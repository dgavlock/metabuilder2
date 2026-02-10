'use client'

import { usePlateStore } from '@/stores/plateStore'
import { useUIStore } from '@/stores/uiStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { PlateThumbnail } from './PlateThumbnail'

export function PlateOverview() {
  const plates = usePlateStore((s) => s.plates)
  const activePlateId = usePlateStore((s) => s.activePlateId)
  const setActivePlate = usePlateStore((s) => s.setActivePlate)
  const setViewMode = useUIStore((s) => s.setViewMode)
  const clearSelection = useSelectionStore((s) => s.clearSelection)

  const handlePlateClick = (plateId: string) => {
    clearSelection()
    setActivePlate(plateId)
    setViewMode('single')
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 justify-items-center">
        {plates.map((plate) => (
          <PlateThumbnail
            key={plate.id}
            plate={plate}
            isActive={plate.id === activePlateId}
            onClick={() => handlePlateClick(plate.id)}
          />
        ))}
      </div>
    </div>
  )
}
