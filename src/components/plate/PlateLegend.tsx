'use client'

import { usePlateStore } from '@/stores/plateStore'

export function PlateLegend() {
  const plate = usePlateStore((s) => {
    const active = s.plates.find(p => p.id === s.activePlateId)
    return active ?? null
  })

  if (!plate) return null

  const activeLayer = plate.layers.find((l) => l.id === plate.activeLayerId)
  if (!activeLayer || Object.keys(activeLayer.colorMap).length === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--border)] bg-[var(--background)] flex-shrink-0 overflow-x-auto">
      <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
        {activeLayer.name}:
      </span>
      {Object.entries(activeLayer.colorMap).map(([value, color]) => (
        <div key={value} className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="w-3 h-3 rounded-sm border border-[var(--border)]"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs">{value}</span>
        </div>
      ))}
    </div>
  )
}
