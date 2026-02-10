'use client'

import { usePlateStore } from '@/stores/plateStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { useUIStore } from '@/stores/uiStore'
import { Plus, X, Copy, LayoutGrid, Square } from 'lucide-react'
import { useState } from 'react'

export function PlateTabBar() {
  const plates = usePlateStore((s) => s.plates)
  const activePlateId = usePlateStore((s) => s.activePlateId)
  const setActivePlate = usePlateStore((s) => s.setActivePlate)
  const addPlate = usePlateStore((s) => s.addPlate)
  const removePlate = usePlateStore((s) => s.removePlate)
  const duplicatePlate = usePlateStore((s) => s.duplicatePlate)
  const renamePlate = usePlateStore((s) => s.renamePlate)
  const clearSelection = useSelectionStore((s) => s.clearSelection)
  const viewMode = useUIStore((s) => s.viewMode)
  const setViewMode = useUIStore((s) => s.setViewMode)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleSelect = (plateId: string) => {
    if (plateId !== activePlateId) {
      clearSelection()
      setActivePlate(plateId)
    }
    if (viewMode === 'overview') {
      setViewMode('single')
    }
  }

  const handleStartRename = (plateId: string, currentName: string) => {
    setEditingId(plateId)
    setEditName(currentName)
  }

  const handleFinishRename = (plateId: string) => {
    if (editName.trim()) {
      renamePlate(plateId, editName.trim())
    }
    setEditingId(null)
  }

  const handleAdd = () => {
    clearSelection()
    addPlate()
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[var(--border)] bg-[var(--muted)] overflow-x-auto flex-shrink-0">
      {plates.map((plate) => {
        const isActive = plate.id === activePlateId
        return (
          <div
            key={plate.id}
            className={`group flex items-center gap-1 px-3 py-1 rounded-t-md text-xs cursor-pointer transition-colors ${
              isActive
                ? 'bg-[var(--background)] text-[var(--foreground)] font-medium border border-b-0 border-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--background)]/50'
            }`}
            onClick={() => handleSelect(plate.id)}
          >
            {editingId === plate.id ? (
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleFinishRename(plate.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename(plate.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-20 px-1 py-0 text-xs rounded border border-[var(--primary)] bg-[var(--background)] focus:outline-none"
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  handleStartRename(plate.id, plate.name)
                }}
              >
                {plate.name}
              </span>
            )}

            {isActive && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicatePlate(plate.id)
                  }}
                  className="p-0.5 rounded hover:bg-[var(--muted)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                  title="Duplicate plate"
                >
                  <Copy size={10} />
                </button>
                {plates.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      clearSelection()
                      removePlate(plate.id)
                    }}
                    className="p-0.5 rounded hover:bg-[var(--muted)] text-[var(--destructive)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                    title="Remove plate"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={handleAdd}
        className="p-1 rounded hover:bg-[var(--background)]/50 text-[var(--muted-foreground)] ml-1"
        title="Add plate"
      >
        <Plus size={14} />
      </button>

      <div className="w-px h-4 bg-[var(--border)] ml-1" />
      <button
        onClick={() => setViewMode(viewMode === 'single' ? 'overview' : 'single')}
        className={`p-1 rounded hover:bg-[var(--background)]/50 transition-colors ml-1 ${
          viewMode === 'overview'
            ? 'text-[var(--primary)]'
            : 'text-[var(--muted-foreground)]'
        }`}
        title={viewMode === 'single' ? 'Show all plates' : 'Show single plate'}
      >
        {viewMode === 'single' ? <LayoutGrid size={14} /> : <Square size={14} />}
      </button>
    </div>
  )
}
