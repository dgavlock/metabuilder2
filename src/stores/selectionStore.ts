import { create } from 'zustand'
import { WellAddress } from '@/types/plate'
import { wellAddress } from '@/lib/plate/wellAddressing'

interface SelectionStore {
  selectedWells: Set<WellAddress>
  isDragging: boolean
  dragOrigin: { row: number; col: number } | null
  dragCurrent: { row: number; col: number } | null

  startDrag: (row: number, col: number) => void
  updateDrag: (row: number, col: number) => void
  endDrag: (additive: boolean) => void
  selectWell: (address: WellAddress, additive: boolean) => void
  selectRow: (row: number, columns: number) => void
  selectColumn: (col: number, rows: number) => void
  selectAll: (rows: number, columns: number) => void
  clearSelection: () => void
  getSelectedArray: () => WellAddress[]

  // Computed drag selection (wells in the current drag rectangle)
  getDragSelection: () => WellAddress[]
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedWells: new Set<WellAddress>(),
  isDragging: false,
  dragOrigin: null,
  dragCurrent: null,

  startDrag: (row, col) => {
    set({ isDragging: true, dragOrigin: { row, col }, dragCurrent: { row, col } })
  },

  updateDrag: (row, col) => {
    if (!get().isDragging) return
    set({ dragCurrent: { row, col } })
  },

  endDrag: (additive) => {
    const state = get()
    if (!state.dragOrigin || !state.dragCurrent) {
      set({ isDragging: false, dragOrigin: null, dragCurrent: null })
      return
    }

    const dragWells = state.getDragSelection()
    const newSelection = additive ? new Set(state.selectedWells) : new Set<WellAddress>()
    for (const w of dragWells) {
      newSelection.add(w)
    }

    set({
      selectedWells: newSelection,
      isDragging: false,
      dragOrigin: null,
      dragCurrent: null,
    })
  },

  selectWell: (address, additive) => {
    const state = get()
    const newSelection = additive ? new Set(state.selectedWells) : new Set<WellAddress>()
    if (newSelection.has(address) && additive) {
      newSelection.delete(address)
    } else {
      newSelection.add(address)
    }
    set({ selectedWells: newSelection })
  },

  selectRow: (row, columns) => {
    const newSelection = new Set<WellAddress>()
    for (let c = 0; c < columns; c++) {
      newSelection.add(wellAddress(row, c))
    }
    set({ selectedWells: newSelection })
  },

  selectColumn: (col, rows) => {
    const newSelection = new Set<WellAddress>()
    for (let r = 0; r < rows; r++) {
      newSelection.add(wellAddress(r, col))
    }
    set({ selectedWells: newSelection })
  },

  selectAll: (rows, columns) => {
    const newSelection = new Set<WellAddress>()
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        newSelection.add(wellAddress(r, c))
      }
    }
    set({ selectedWells: newSelection })
  },

  clearSelection: () => {
    set({ selectedWells: new Set() })
  },

  getSelectedArray: () => {
    return Array.from(get().selectedWells)
  },

  getDragSelection: () => {
    const { dragOrigin, dragCurrent } = get()
    if (!dragOrigin || !dragCurrent) return []

    const minRow = Math.min(dragOrigin.row, dragCurrent.row)
    const maxRow = Math.max(dragOrigin.row, dragCurrent.row)
    const minCol = Math.min(dragOrigin.col, dragCurrent.col)
    const maxCol = Math.max(dragOrigin.col, dragCurrent.col)

    const wells: WellAddress[] = []
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        wells.push(wellAddress(r, c))
      }
    }
    return wells
  },
}))
