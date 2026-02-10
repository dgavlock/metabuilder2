'use client'

import { usePlateStore } from '@/stores/plateStore'
import { useUIStore } from '@/stores/uiStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { STANDARD_PLATE_TYPES } from '@/lib/plate/plateTypes'
import { PlateType, StandardPlateType } from '@/types/plate'
import { ZoomIn, ZoomOut, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function PlateToolbar() {
  const plate = usePlateStore((s) => {
    const active = s.plates.find(p => p.id === s.activePlateId)
    return active ?? null
  })
  const setPlateType = usePlateStore((s) => s.setPlateType)
  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const selectedWells = useSelectionStore((s) => s.selectedWells)
  const clearWells = usePlateStore((s) => s.clearWells)

  const config = plate?.config
  const activeLayerId = plate?.activeLayerId ?? null

  const [customRows, setCustomRows] = useState(config?.type === 'custom' ? config.rows : 8)
  const [customCols, setCustomCols] = useState(config?.type === 'custom' ? config.columns : 12)

  if (!plate || !config) return null

  const handlePlateTypeChange = (value: string) => {
    if (value === 'custom') {
      setPlateType('custom', customRows, customCols)
    } else {
      setPlateType(Number(value) as StandardPlateType)
    }
    clearSelection()
  }

  const handleCustomApply = () => {
    setPlateType('custom', customRows, customCols)
    clearSelection()
  }

  const handleClearSelected = () => {
    if (activeLayerId && selectedWells.size > 0) {
      clearWells(activeLayerId, Array.from(selectedWells))
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-[var(--background)] flex-shrink-0">
      <label className="text-xs text-[var(--muted-foreground)]">Plate:</label>
      <select
        value={String(config.type)}
        onChange={(e) => handlePlateTypeChange(e.target.value)}
        className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
      >
        {STANDARD_PLATE_TYPES.map((t) => (
          <option key={t} value={t}>{t}-well</option>
        ))}
        <option value="custom">Custom</option>
      </select>

      {config.type === 'custom' && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={64}
            value={customRows}
            onChange={(e) => setCustomRows(Number(e.target.value))}
            className="w-14 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)]"
            placeholder="Rows"
          />
          <span className="text-xs text-[var(--muted-foreground)]">x</span>
          <input
            type="number"
            min={1}
            max={64}
            value={customCols}
            onChange={(e) => setCustomCols(Number(e.target.value))}
            className="w-14 px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)]"
            placeholder="Cols"
          />
          <button
            onClick={handleCustomApply}
            className="px-2 py-1 text-xs rounded bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            Apply
          </button>
        </div>
      )}

      <div className="flex-1" />

      <span className="text-xs text-[var(--muted-foreground)]">
        {config.rows} x {config.columns} ({config.rows * config.columns} wells)
      </span>

      {selectedWells.size > 0 && (
        <>
          <span className="text-xs text-[var(--primary)] font-medium">
            {selectedWells.size} selected
          </span>
          <button
            onClick={handleClearSelected}
            className="p-1.5 rounded hover:bg-[var(--muted)] text-[var(--destructive)]"
            title="Clear selected wells"
          >
            <Trash2 size={14} />
          </button>
        </>
      )}

      <div className="w-px h-5 bg-[var(--border)]" />

      <button
        onClick={() => setZoom(zoom - 0.25)}
        className="p-1.5 rounded hover:bg-[var(--muted)]"
        title="Zoom out"
      >
        <ZoomOut size={14} />
      </button>
      <span className="text-xs text-[var(--muted-foreground)] w-10 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(zoom + 0.25)}
        className="p-1.5 rounded hover:bg-[var(--muted)]"
        title="Zoom in"
      >
        <ZoomIn size={14} />
      </button>
    </div>
  )
}
