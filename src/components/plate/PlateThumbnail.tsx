'use client'

import { memo } from 'react'
import { Plate } from '@/types/plate'
import { wellAddress } from '@/lib/plate/wellAddressing'
import { getColorForValue, EMPTY_WELL_COLOR, DEFAULT_WELL_BORDER } from '@/lib/plate/colorScale'

interface PlateThumbnailProps {
  plate: Plate
  onClick?: () => void
  isActive?: boolean
}

const PADDING = 4
const GAP = 1

function getWellSize(rows: number, columns: number): number {
  const totalWells = rows * columns
  if (totalWells > 384) return 4
  if (totalWells > 96) return 8
  return 12
}

export const PlateThumbnail = memo(function PlateThumbnail({
  plate,
  onClick,
  isActive = false,
}: PlateThumbnailProps) {
  const { config, layers, activeLayerId } = plate
  const { rows, columns } = config

  const wellSize = getWellSize(rows, columns)
  const svgWidth = PADDING * 2 + columns * wellSize + (columns - 1) * GAP
  const svgHeight = PADDING * 2 + rows * wellSize + (rows - 1) * GAP

  // Use active layer if set, otherwise first visible layer
  const displayLayer =
    layers.find((l) => l.id === activeLayerId && l.visible) ??
    layers.find((l) => l.visible) ??
    null

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isActive
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
          : 'border-[var(--border)] hover:border-[var(--primary)]/50'
      }`}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="block"
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: columns }, (_, c) => {
            const addr = wellAddress(r, c)
            const value = displayLayer?.values[addr] ?? null
            const color =
              value != null && value !== ''
                ? getColorForValue(String(value), displayLayer?.colorMap ?? {})
                : EMPTY_WELL_COLOR

            return (
              <rect
                key={addr}
                x={PADDING + c * (wellSize + GAP)}
                y={PADDING + r * (wellSize + GAP)}
                width={wellSize}
                height={wellSize}
                rx={wellSize > 6 ? 2 : 1}
                fill={color}
                stroke={DEFAULT_WELL_BORDER}
                strokeWidth={0.5}
              />
            )
          })
        )}
      </svg>
      <span className="text-xs font-medium text-[var(--foreground)] truncate max-w-full">
        {plate.name}
      </span>
      <span className="text-[10px] text-[var(--muted-foreground)]">
        {rows} × {columns} ({rows * columns} wells)
      </span>
    </div>
  )
})
