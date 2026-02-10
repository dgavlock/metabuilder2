import { WellAddress } from '@/types/plate'

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Extended row labels for plates > 26 rows (AA, AB, etc.)
export function rowIndexToLabel(row: number): string {
  if (row < 26) return ROW_LETTERS[row]
  const first = Math.floor(row / 26) - 1
  const second = row % 26
  return ROW_LETTERS[first] + ROW_LETTERS[second]
}

export function labelToRowIndex(label: string): number {
  if (label.length === 1) return ROW_LETTERS.indexOf(label.toUpperCase())
  const first = ROW_LETTERS.indexOf(label[0].toUpperCase())
  const second = ROW_LETTERS.indexOf(label[1].toUpperCase())
  return (first + 1) * 26 + second
}

export function wellAddress(row: number, col: number): WellAddress {
  return `${rowIndexToLabel(row)}${col + 1}`
}

export function parseWellAddress(address: WellAddress): { row: number; col: number } {
  const match = address.match(/^([A-Z]+)(\d+)$/i)
  if (!match) throw new Error(`Invalid well address: ${address}`)
  return {
    row: labelToRowIndex(match[1]),
    col: parseInt(match[2], 10) - 1,
  }
}

// Expand a range like "A1:A12" or "A1:H1" into individual addresses
export function expandWellRange(range: string): WellAddress[] {
  const parts = range.split(':')
  if (parts.length !== 2) return [range] // not a range, single well

  const start = parseWellAddress(parts[0].trim())
  const end = parseWellAddress(parts[1].trim())

  const wells: WellAddress[] = []
  const minRow = Math.min(start.row, end.row)
  const maxRow = Math.max(start.row, end.row)
  const minCol = Math.min(start.col, end.col)
  const maxCol = Math.max(start.col, end.col)

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      wells.push(wellAddress(r, c))
    }
  }
  return wells
}

// Normalize well addresses from AI (may include ranges)
export function normalizeWellList(wells: string[]): WellAddress[] {
  const result: WellAddress[] = []
  for (const w of wells) {
    if (w.includes(':')) {
      result.push(...expandWellRange(w))
    } else {
      result.push(w.toUpperCase().trim())
    }
  }
  return result
}

// Get all wells for a plate
export function getAllWells(rows: number, columns: number): WellAddress[] {
  const wells: WellAddress[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      wells.push(wellAddress(r, c))
    }
  }
  return wells
}

// Get wells in a specific row
export function getRowWells(row: number, columns: number): WellAddress[] {
  const wells: WellAddress[] = []
  for (let c = 0; c < columns; c++) {
    wells.push(wellAddress(row, c))
  }
  return wells
}

// Get wells in a specific column
export function getColumnWells(col: number, rows: number): WellAddress[] {
  const wells: WellAddress[] = []
  for (let r = 0; r < rows; r++) {
    wells.push(wellAddress(r, col))
  }
  return wells
}
