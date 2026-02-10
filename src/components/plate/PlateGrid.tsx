'use client'

import { useCallback, useRef, useMemo } from 'react'
import { usePlateStore } from '@/stores/plateStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { useUIStore } from '@/stores/uiStore'
import { wellAddress, rowIndexToLabel } from '@/lib/plate/wellAddressing'
import { getColorForValue, EMPTY_WELL_COLOR, SELECTED_BORDER_COLOR, DEFAULT_WELL_BORDER } from '@/lib/plate/colorScale'
import { WellAddress } from '@/types/plate'

const WELL_SIZE = 36
const WELL_GAP = 4
const HEADER_SIZE = 28
const PADDING = 12

export function PlateGrid() {
  const plate = usePlateStore((s) => {
    const active = s.plates.find(p => p.id === s.activePlateId)
    return active ?? null
  })
  const selectedWells = useSelectionStore((s) => s.selectedWells)
  const isDragging = useSelectionStore((s) => s.isDragging)
  const dragOrigin = useSelectionStore((s) => s.dragOrigin)
  const dragCurrent = useSelectionStore((s) => s.dragCurrent)
  const startDrag = useSelectionStore((s) => s.startDrag)
  const updateDrag = useSelectionStore((s) => s.updateDrag)
  const endDrag = useSelectionStore((s) => s.endDrag)
  const selectWell = useSelectionStore((s) => s.selectWell)
  const selectRow = useSelectionStore((s) => s.selectRow)
  const selectColumn = useSelectionStore((s) => s.selectColumn)
  const zoom = useUIStore((s) => s.zoom)

  const svgRef = useRef<SVGSVGElement>(null)
  const dragStarted = useRef(false)

  if (!plate) return null

  const { config, layers, activeLayerId } = plate
  const { rows, columns } = config
  const cellSize = WELL_SIZE + WELL_GAP
  const svgWidth = HEADER_SIZE + PADDING + columns * cellSize + PADDING
  const svgHeight = HEADER_SIZE + PADDING + rows * cellSize + PADDING

  // Get active layer for coloring
  const activeLayer = layers.find((l) => l.id === activeLayerId && l.visible) ?? null

  // Compute drag selection rectangle
  const dragSelection = useMemo(() => {
    if (!isDragging || !dragOrigin || !dragCurrent) return new Set<WellAddress>()
    const minRow = Math.min(dragOrigin.row, dragCurrent.row)
    const maxRow = Math.max(dragOrigin.row, dragCurrent.row)
    const minCol = Math.min(dragOrigin.col, dragCurrent.col)
    const maxCol = Math.max(dragOrigin.col, dragCurrent.col)
    const set = new Set<WellAddress>()
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        set.add(wellAddress(r, c))
      }
    }
    return set
  }, [isDragging, dragOrigin, dragCurrent])

  const getWellFromEvent = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return null
      const rect = svgRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom - HEADER_SIZE - PADDING
      const y = (e.clientY - rect.top) / zoom - HEADER_SIZE - PADDING
      const col = Math.floor(x / cellSize)
      const row = Math.floor(y / cellSize)
      if (row < 0 || row >= rows || col < 0 || col >= columns) return null
      return { row, col }
    },
    [zoom, rows, columns, cellSize]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const well = getWellFromEvent(e as unknown as React.MouseEvent<SVGSVGElement>)
      if (!well) return
      dragStarted.current = false
      startDrag(well.row, well.col)
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    },
    [getWellFromEvent, startDrag]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const well = getWellFromEvent(e as unknown as React.MouseEvent<SVGSVGElement>)
      if (!well) return
      if (isDragging) {
        dragStarted.current = true
        updateDrag(well.row, well.col)
      }
    },
    [getWellFromEvent, isDragging, updateDrag]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging) return
      if (!dragStarted.current) {
        // Single click
        const well = getWellFromEvent(e as unknown as React.MouseEvent<SVGSVGElement>)
        if (well) {
          const addr = wellAddress(well.row, well.col)
          selectWell(addr, e.shiftKey || e.metaKey)
        }
        // Cancel drag
        endDrag(false)
      } else {
        endDrag(e.shiftKey || e.metaKey)
      }
      dragStarted.current = false
    },
    [isDragging, getWellFromEvent, selectWell, endDrag]
  )

  return (
    <div id="plate-grid-container" className="inline-block">
      <svg
        ref={svgRef}
        width={svgWidth * zoom}
        height={svgHeight * zoom}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Column headers */}
        {Array.from({ length: columns }, (_, c) => (
          <text
            key={`col-${c}`}
            x={HEADER_SIZE + PADDING + c * cellSize + WELL_SIZE / 2}
            y={HEADER_SIZE - 4}
            textAnchor="middle"
            className="text-[10px] fill-[var(--muted-foreground)] cursor-pointer"
            onClick={() => selectColumn(c, rows)}
          >
            {c + 1}
          </text>
        ))}

        {/* Row headers */}
        {Array.from({ length: rows }, (_, r) => (
          <text
            key={`row-${r}`}
            x={HEADER_SIZE - 4}
            y={HEADER_SIZE + PADDING + r * cellSize + WELL_SIZE / 2 + 4}
            textAnchor="end"
            className="text-[10px] fill-[var(--muted-foreground)] cursor-pointer"
            onClick={() => selectRow(r, columns)}
          >
            {rowIndexToLabel(r)}
          </text>
        ))}

        {/* Wells */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: columns }, (_, c) => {
            const addr = wellAddress(r, c)
            const value = activeLayer?.values[addr] ?? null
            const color = value !== null && value !== undefined && value !== ''
              ? getColorForValue(value, activeLayer?.colorMap ?? {})
              : EMPTY_WELL_COLOR
            const isSelected = selectedWells.has(addr) || dragSelection.has(addr)

            return (
              <g key={addr}>
                <rect
                  x={HEADER_SIZE + PADDING + c * cellSize}
                  y={HEADER_SIZE + PADDING + r * cellSize}
                  width={WELL_SIZE}
                  height={WELL_SIZE}
                  rx={4}
                  fill={color}
                  stroke={isSelected ? SELECTED_BORDER_COLOR : DEFAULT_WELL_BORDER}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {/* Show value text for small plates */}
                {rows * columns <= 96 && value !== null && value !== undefined && value !== '' && (
                  <text
                    x={HEADER_SIZE + PADDING + c * cellSize + WELL_SIZE / 2}
                    y={HEADER_SIZE + PADDING + r * cellSize + WELL_SIZE / 2 + 3}
                    textAnchor="middle"
                    className="text-[7px] fill-[var(--foreground)] pointer-events-none"
                    style={{ opacity: 0.7 }}
                  >
                    {String(value).length > 6 ? String(value).slice(0, 5) + '...' : String(value)}
                  </text>
                )}
              </g>
            )
          })
        )}

        {/* Drag selection overlay */}
        {isDragging && dragOrigin && dragCurrent && (
          <rect
            x={HEADER_SIZE + PADDING + Math.min(dragOrigin.col, dragCurrent.col) * cellSize - 2}
            y={HEADER_SIZE + PADDING + Math.min(dragOrigin.row, dragCurrent.row) * cellSize - 2}
            width={(Math.abs(dragCurrent.col - dragOrigin.col) + 1) * cellSize + 4 - WELL_GAP}
            height={(Math.abs(dragCurrent.row - dragOrigin.row) + 1) * cellSize + 4 - WELL_GAP}
            fill="rgba(37, 99, 235, 0.1)"
            stroke={SELECTED_BORDER_COLOR}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            rx={4}
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  )
}
