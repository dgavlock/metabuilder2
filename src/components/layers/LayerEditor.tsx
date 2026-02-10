'use client'

import { usePlateStore } from '@/stores/plateStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { useState } from 'react'
import { Paintbrush, Eraser, Hash } from 'lucide-react'
import { SequenceFillDialog } from './SequenceFillDialog'

export function LayerEditor() {
  const plate = usePlateStore((s) => {
    const active = s.plates.find(p => p.id === s.activePlateId)
    return active ?? null
  })
  const setWellValues = usePlateStore((s) => s.setWellValues)
  const clearWells = usePlateStore((s) => s.clearWells)
  const selectedWells = useSelectionStore((s) => s.selectedWells)

  const [value, setValue] = useState('')
  const [showSequence, setShowSequence] = useState(false)

  if (!plate) return null

  const { activeLayerId, layers } = plate
  const activeLayer = layers.find((l) => l.id === activeLayerId)
  if (!activeLayer || !activeLayerId) return null

  const handleAssign = () => {
    if (!value.trim()) return
    setWellValues(activeLayerId, Array.from(selectedWells), value.trim())
    setValue('')
  }

  const handleClear = () => {
    clearWells(activeLayerId, Array.from(selectedWells))
  }

  // Get existing values for quick assignment
  const existingValues = Object.keys(activeLayer.colorMap)

  return (
    <div className="border-t border-[var(--border)] px-2 py-2 space-y-2">
      <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Assign to {selectedWells.size} well{selectedWells.size !== 1 ? 's' : ''}
      </div>

      <div className="flex gap-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAssign()}
          placeholder="Enter value..."
          className="flex-1 px-2 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={handleAssign}
          disabled={!value.trim()}
          className="px-2 py-1 rounded bg-[var(--primary)] text-[var(--primary-foreground)] text-xs disabled:opacity-50"
        >
          <Paintbrush size={12} />
        </button>
        <button
          onClick={handleClear}
          className="px-2 py-1 rounded border border-[var(--border)] text-xs hover:bg-[var(--muted)]"
          title="Clear selected wells"
        >
          <Eraser size={12} />
        </button>
        <button
          onClick={() => setShowSequence(true)}
          className="px-2 py-1 rounded border border-[var(--border)] text-xs hover:bg-[var(--muted)]"
          title="Sequence fill (numbered series)"
        >
          <Hash size={12} />
        </button>
      </div>

      {/* Quick assign from existing values */}
      {existingValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {existingValues.map((v) => (
            <button
              key={v}
              onClick={() => setWellValues(activeLayerId, Array.from(selectedWells), v)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: activeLayer.colorMap[v] }}
              />
              {v}
            </button>
          ))}
        </div>
      )}

      {showSequence && <SequenceFillDialog onClose={() => setShowSequence(false)} />}
    </div>
  )
}
