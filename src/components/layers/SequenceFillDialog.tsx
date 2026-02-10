'use client'

import { useState, useMemo } from 'react'
import { usePlateStore } from '@/stores/plateStore'
import { useSelectionStore } from '@/stores/selectionStore'
import { parseWellAddress, wellAddress } from '@/lib/plate/wellAddressing'
import { WellAddress } from '@/types/plate'
import { X, Hash, ArrowDown, ArrowRight, ArrowDownRight } from 'lucide-react'

interface Props {
  onClose: () => void
}

type FillOrder =
  | 'left-right-top-bottom'
  | 'top-bottom-left-right'
  | 'snake-left-right'
  | 'snake-top-bottom'

const FILL_ORDERS: { value: FillOrder; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'left-right-top-bottom',
    label: 'Row-wise (L→R, T→B)',
    description: 'A1, A2, A3… B1, B2, B3…',
    icon: <ArrowRight size={12} />,
  },
  {
    value: 'top-bottom-left-right',
    label: 'Column-wise (T→B, L→R)',
    description: 'A1, B1, C1… A2, B2, C2…',
    icon: <ArrowDown size={12} />,
  },
  {
    value: 'snake-left-right',
    label: 'Snake rows (L→R, R→L…)',
    description: 'A1, A2, A3… B3, B2, B1…',
    icon: <ArrowDownRight size={12} />,
  },
  {
    value: 'snake-top-bottom',
    label: 'Snake columns (T→B, B→T…)',
    description: 'A1, B1, C1… C2, B2, A2…',
    icon: <ArrowDownRight size={12} />,
  },
]

function sortWells(wells: WellAddress[], order: FillOrder): WellAddress[] {
  const parsed = wells.map((w) => ({ addr: w, ...parseWellAddress(w) }))

  // Determine the bounding box to know column/row order for snaking
  const rows = [...new Set(parsed.map((p) => p.row))].sort((a, b) => a - b)
  const cols = [...new Set(parsed.map((p) => p.col))].sort((a, b) => a - b)

  switch (order) {
    case 'left-right-top-bottom':
      parsed.sort((a, b) => a.row - b.row || a.col - b.col)
      break

    case 'top-bottom-left-right':
      parsed.sort((a, b) => a.col - b.col || a.row - b.row)
      break

    case 'snake-left-right': {
      // Group by row, even rows L→R, odd rows R→L
      parsed.sort((a, b) => {
        const aRowIdx = rows.indexOf(a.row)
        const bRowIdx = rows.indexOf(b.row)
        if (aRowIdx !== bRowIdx) return aRowIdx - bRowIdx
        const isEvenRow = aRowIdx % 2 === 0
        return isEvenRow ? a.col - b.col : b.col - a.col
      })
      break
    }

    case 'snake-top-bottom': {
      // Group by column, even columns T→B, odd columns B→T
      parsed.sort((a, b) => {
        const aColIdx = cols.indexOf(a.col)
        const bColIdx = cols.indexOf(b.col)
        if (aColIdx !== bColIdx) return aColIdx - bColIdx
        const isEvenCol = aColIdx % 2 === 0
        return isEvenCol ? a.row - b.row : b.row - a.row
      })
      break
    }
  }

  return parsed.map((p) => p.addr)
}

function generateLabel(prefix: string, index: number, startNum: number, padLength: number): string {
  const num = startNum + index
  const numStr = String(num).padStart(padLength, '0')
  return `${prefix}${numStr}`
}

export function SequenceFillDialog({ onClose }: Props) {
  const plate = usePlateStore((s) => {
    const active = s.plates.find((p) => p.id === s.activePlateId)
    return active ?? null
  })
  const setWellValues = usePlateStore((s) => s.setWellValues)
  const selectedWells = useSelectionStore((s) => s.selectedWells)

  const [prefix, setPrefix] = useState('Sample')
  const [startNum, setStartNum] = useState(1)
  const [padLength, setPadLength] = useState(2)
  const [fillOrder, setFillOrder] = useState<FillOrder>('left-right-top-bottom')

  const activeLayerId = plate?.activeLayerId
  const wellCount = selectedWells.size

  // Sort wells by chosen order and generate preview
  const sortedWells = useMemo(() => {
    return sortWells(Array.from(selectedWells), fillOrder)
  }, [selectedWells, fillOrder])

  const previewItems = useMemo(() => {
    const maxPreview = 6
    const items: { well: string; label: string }[] = []
    for (let i = 0; i < Math.min(sortedWells.length, maxPreview); i++) {
      items.push({
        well: sortedWells[i],
        label: generateLabel(prefix, i, startNum, padLength),
      })
    }
    if (sortedWells.length > maxPreview) {
      items.push({
        well: '…',
        label: '…',
      })
      const lastIdx = sortedWells.length - 1
      items.push({
        well: sortedWells[lastIdx],
        label: generateLabel(prefix, lastIdx, startNum, padLength),
      })
    }
    return items
  }, [sortedWells, prefix, startNum, padLength])

  const handleApply = () => {
    if (!activeLayerId || sortedWells.length === 0) return
    // Assign each well its sequential value
    for (let i = 0; i < sortedWells.length; i++) {
      const label = generateLabel(prefix, i, startNum, padLength)
      setWellValues(activeLayerId, [sortedWells[i]], label)
    }
    onClose()
  }

  if (!plate || !activeLayerId || wellCount === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl w-[380px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Sequence Fill</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-4">
          {/* Prefix & numbering */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Prefix
              </label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
                placeholder="Sample"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Start #
              </label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Zero-pad
              </label>
              <div className="flex gap-1 mt-1">
                {[0, 2, 3, 4].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPadLength(p)}
                    className={`flex-1 py-1.5 text-[10px] rounded border transition-colors ${
                      padLength === p
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                        : 'border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {p === 0 ? 'None' : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fill order */}
          <div>
            <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              Fill order
            </label>
            <div className="mt-1.5 space-y-1">
              {FILL_ORDERS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    fillOrder === opt.value
                      ? 'bg-[var(--primary)]/10 border border-[var(--primary)]/30'
                      : 'border border-transparent hover:bg-[var(--muted)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="fillOrder"
                    value={opt.value}
                    checked={fillOrder === opt.value}
                    onChange={() => setFillOrder(opt.value)}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-[var(--primary)]">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              Preview ({wellCount} wells)
            </label>
            <div className="mt-1.5 rounded border border-[var(--border)] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--muted)]">
                    <th className="text-left px-2 py-1 font-medium text-[var(--muted-foreground)]">Well</th>
                    <th className="text-left px-2 py-1 font-medium text-[var(--muted-foreground)]">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((item, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? '' : 'bg-[var(--muted)]/50'}
                    >
                      <td className="px-2 py-1 font-mono text-[var(--muted-foreground)]">
                        {item.well}
                      </td>
                      <td className="px-2 py-1 font-mono font-medium">
                        {item.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Hash size={12} />
            Fill {wellCount} Wells
          </button>
        </div>
      </div>
    </div>
  )
}
