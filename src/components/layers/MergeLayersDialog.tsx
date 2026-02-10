'use client'

import { useState, useCallback } from 'react'
import { usePlateStore } from '@/stores/plateStore'
import { X, GripVertical, ChevronUp, ChevronDown, Merge } from 'lucide-react'
import { MetadataLayer } from '@/types/plate'

interface Props {
  onClose: () => void
}

export function MergeLayersDialog({ onClose }: Props) {
  const plate = usePlateStore((s) => {
    const active = s.plates.find((p) => p.id === s.activePlateId)
    return active ?? null
  })
  const mergeLayers = usePlateStore((s) => s.mergeLayers)

  const layers = plate?.layers ?? []

  // Track which layers are selected for merge (by id)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // Track the concatenation order (subset of selectedIds, reorderable)
  const [orderedIds, setOrderedIds] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [separator, setSeparator] = useState(' | ')

  const toggleLayer = useCallback(
    (layerId: string) => {
      if (selectedIds.includes(layerId)) {
        setSelectedIds(selectedIds.filter((id) => id !== layerId))
        setOrderedIds(orderedIds.filter((id) => id !== layerId))
      } else {
        setSelectedIds([...selectedIds, layerId])
        setOrderedIds([...orderedIds, layerId])
      }
    },
    [selectedIds, orderedIds]
  )

  const moveUp = (index: number) => {
    if (index === 0) return
    setOrderedIds((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    setOrderedIds((prev) => {
      if (index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  const handleMerge = () => {
    if (orderedIds.length < 2) return
    const name = newName.trim() || orderedIds
      .map((id) => layers.find((l) => l.id === id)?.name ?? '')
      .join(' + ')
    mergeLayers(orderedIds, name, separator)
    onClose()
  }

  // Preview: show a sample well's concatenated value
  const previewValue = (() => {
    if (orderedIds.length < 2) return null
    const orderedLayers = orderedIds
      .map((id) => layers.find((l) => l.id === id))
      .filter((l): l is MetadataLayer => l !== undefined)

    // Find a well that has values in all selected layers
    for (const layer of orderedLayers) {
      for (const addr of Object.keys(layer.values)) {
        const v = layer.values[addr]
        if (v == null || v === '') continue
        const parts: string[] = []
        let hasAll = true
        for (const ol of orderedLayers) {
          const val = ol.values[addr]
          if (val != null && val !== '') {
            parts.push(String(val))
          } else {
            hasAll = false
          }
        }
        if (hasAll && parts.length === orderedLayers.length) {
          return parts.join(separator)
        }
      }
    }
    // Fallback: find a well with at least some values
    for (const layer of orderedLayers) {
      for (const addr of Object.keys(layer.values)) {
        const parts: string[] = []
        for (const ol of orderedLayers) {
          const val = ol.values[addr]
          if (val != null && val !== '') parts.push(String(val))
        }
        if (parts.length >= 2) return parts.join(separator)
      }
    }
    return null
  })()

  if (!plate || layers.length < 2) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl w-[400px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Merge size={16} className="text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Merge Layers</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-4">
          {/* Step 1: Select layers */}
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              Select layers to merge
            </label>
            <div className="mt-2 space-y-1">
              {layers.map((layer) => {
                const isSelected = selectedIds.includes(layer.id)
                const wellCount = Object.values(layer.values).filter(
                  (v) => v != null && v !== ''
                ).length
                return (
                  <label
                    key={layer.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                        : 'border border-transparent hover:bg-[var(--muted)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleLayer(layer.id)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="text-xs font-medium flex-1">{layer.name}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {wellCount} wells
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Step 2: Reorder (only if 2+ selected) */}
          {orderedIds.length >= 2 && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Concatenation order
              </label>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5 mb-2">
                Values will be joined top-to-bottom. Use arrows to reorder.
              </p>
              <div className="space-y-1">
                {orderedIds.map((id, idx) => {
                  const layer = layers.find((l) => l.id === id)
                  if (!layer) return null
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-2 py-1.5 rounded bg-[var(--muted)] border border-[var(--border)]"
                    >
                      <GripVertical
                        size={12}
                        className="text-[var(--muted-foreground)] flex-shrink-0"
                      />
                      <span className="text-xs font-medium flex-1">
                        <span className="text-[var(--muted-foreground)] mr-1">{idx + 1}.</span>
                        {layer.name}
                      </span>
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className="p-0.5 rounded hover:bg-[var(--background)] disabled:opacity-25"
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === orderedIds.length - 1}
                        className="p-0.5 rounded hover:bg-[var(--background)] disabled:opacity-25"
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Separator */}
          {orderedIds.length >= 2 && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Separator
              </label>
              <div className="flex gap-1.5 mt-1.5">
                {[' | ', ' - ', '_', ', ', ' '].map((sep) => (
                  <button
                    key={sep}
                    onClick={() => setSeparator(sep)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      separator === sep
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                        : 'border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {sep.trim() === '' ? '(space)' : sep.trim() === '' ? '(none)' : `"${sep}"`}
                  </button>
                ))}
                <input
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-16 px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="Custom"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {previewValue && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Preview
              </label>
              <div className="mt-1.5 px-3 py-2 rounded bg-[var(--muted)] border border-[var(--border)] text-xs font-mono">
                {previewValue}
              </div>
            </div>
          )}

          {/* New layer name */}
          {orderedIds.length >= 2 && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                New layer name
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={orderedIds
                  .map((id) => layers.find((l) => l.id === id)?.name ?? '')
                  .join(' + ')}
                className="mt-1.5 w-full px-2 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={orderedIds.length < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Merge size={12} />
            Merge {orderedIds.length >= 2 ? `${orderedIds.length} Layers` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
