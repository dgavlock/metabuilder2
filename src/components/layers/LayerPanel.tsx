'use client'

import { usePlateStore } from '@/stores/plateStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { useState } from 'react'
import { Plus, Eye, EyeOff, Trash2, GripVertical, Merge } from 'lucide-react'
import { LayerEditor } from './LayerEditor'
import { MergeLayersDialog } from './MergeLayersDialog'

export function LayerPanel() {
  const plate = usePlateStore((s) => {
    const active = s.plates.find(p => p.id === s.activePlateId)
    return active ?? null
  })
  const addLayer = usePlateStore((s) => s.addLayer)
  const removeLayer = usePlateStore((s) => s.removeLayer)
  const renameLayer = usePlateStore((s) => s.renameLayer)
  const toggleLayerVisibility = usePlateStore((s) => s.toggleLayerVisibility)
  const setActiveLayer = usePlateStore((s) => s.setActiveLayer)
  const selectedWells = useSelectionStore((s) => s.selectedWells)

  const [newLayerName, setNewLayerName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showMerge, setShowMerge] = useState(false)

  if (!plate) return null

  const { layers, activeLayerId } = plate

  const handleAddLayer = () => {
    const name = newLayerName.trim() || `Layer ${layers.length + 1}`
    addLayer(name)
    setNewLayerName('')
  }

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const handleFinishRename = (id: string) => {
    if (editName.trim()) {
      renameLayer(id, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Metadata Layers
        </h3>
        {layers.length >= 2 && (
          <button
            onClick={() => setShowMerge(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            title="Merge layers"
          >
            <Merge size={11} />
            Merge
          </button>
        )}
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-[var(--muted-foreground)]">
            No layers yet. Add one to start assigning metadata.
          </div>
        )}

        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`border-b border-[var(--border)] ${
              activeLayerId === layer.id ? 'bg-[var(--accent)]' : ''
            }`}
          >
            <div
              className="flex items-center gap-1 px-2 py-1.5 cursor-pointer"
              onClick={() => setActiveLayer(layer.id)}
            >
              <GripVertical size={12} className="text-[var(--muted-foreground)] flex-shrink-0" />

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLayerVisibility(layer.id)
                }}
                className="p-0.5 rounded hover:bg-[var(--muted)]"
              >
                {layer.visible ? (
                  <Eye size={13} className="text-[var(--muted-foreground)]" />
                ) : (
                  <EyeOff size={13} className="text-[var(--muted-foreground)] opacity-50" />
                )}
              </button>

              {editingId === layer.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleFinishRename(layer.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(layer.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="flex-1 text-xs px-1 py-0.5 rounded border border-[var(--primary)] bg-[var(--background)] focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1 text-xs font-medium truncate"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleStartRename(layer.id, layer.name)
                  }}
                >
                  {layer.name}
                </span>
              )}

              <span className="text-[10px] text-[var(--muted-foreground)]">
                {Object.keys(layer.values).length}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLayer(layer.id)
                }}
                className="p-0.5 rounded hover:bg-[var(--muted)] text-[var(--destructive)] opacity-50 hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add layer */}
      <div className="border-t border-[var(--border)] px-2 py-2">
        <div className="flex gap-1">
          <input
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
            placeholder="New layer name..."
            className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={handleAddLayer}
            className="p-1 rounded bg-[var(--primary)] text-[var(--primary-foreground)]"
            title="Add layer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Layer editor for active layer */}
      {activeLayerId && selectedWells.size > 0 && <LayerEditor />}

      {showMerge && <MergeLayersDialog onClose={() => setShowMerge(false)} />}
    </div>
  )
}
