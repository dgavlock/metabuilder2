import { create } from 'zustand'
import {
  Plate,
  PlateConfig,
  MetadataLayer,
  PlateSnapshot,
  WellAddress,
  AIPlateOperation,
  PlateType,
  StandardPlateType,
} from '@/types/plate'
import { getDefaultPlateConfig, getPlateConfig, PLATE_DIMENSIONS } from '@/lib/plate/plateTypes'
import { normalizeWellList } from '@/lib/plate/wellAddressing'
import { assignColor, buildColorMap } from '@/lib/plate/colorScale'
import { generateId } from '@/lib/utils'

function createDefaultPlate(name?: string): Plate {
  return {
    id: generateId(),
    name: name ?? 'Plate 1',
    config: getDefaultPlateConfig(),
    layers: [],
    activeLayerId: null,
  }
}

interface PlateStore {
  plates: Plate[]
  activePlateId: string | null
  history: PlateSnapshot[]
  historyIndex: number

  // Derived helpers
  getActivePlate: () => Plate | undefined

  // Multi-plate operations
  addPlate: (name?: string) => void
  removePlate: (plateId: string) => void
  duplicatePlate: (plateId: string) => void
  renamePlate: (plateId: string, name: string) => void
  setActivePlate: (plateId: string) => void

  // Plate config (operates on active plate)
  setPlateType: (type: PlateType, rows?: number, cols?: number) => void

  // Layer operations (operates on active plate)
  addLayer: (name: string) => void
  removeLayer: (layerId: string) => void
  renameLayer: (layerId: string, name: string) => void
  toggleLayerVisibility: (layerId: string) => void
  setActiveLayer: (layerId: string | null) => void

  // Well operations (operates on active plate)
  setWellValues: (layerId: string, wells: WellAddress[], value: string | number | null) => void
  clearWells: (layerId: string, wells: WellAddress[]) => void
  fillRow: (layerId: string, row: number, value: string | number) => void
  fillColumn: (layerId: string, col: number, value: string | number) => void

  // Layer merge
  mergeLayers: (layerIds: string[], newName: string, separator?: string) => void

  // AI operations
  applyAILayout: (operation: AIPlateOperation) => void

  // Undo/redo
  undo: () => void
  redo: () => void
  snapshot: () => void

  // Reset
  resetPlate: () => void
}

function deepClonePlates(plates: Plate[]): Plate[] {
  return plates.map(p => ({
    ...p,
    config: { ...p.config },
    layers: p.layers.map(l => ({
      ...l,
      colorMap: { ...l.colorMap },
      values: { ...l.values },
    })),
  }))
}

function createSnapshotFromState(state: { plates: Plate[]; activePlateId: string | null }): PlateSnapshot {
  return {
    plates: deepClonePlates(state.plates),
    activePlateId: state.activePlateId,
  }
}

// Helper: update a specific plate in the array
function updatePlateInArray(plates: Plate[], plateId: string, updater: (plate: Plate) => Plate): Plate[] {
  return plates.map(p => p.id === plateId ? updater(p) : p)
}

export const usePlateStore = create<PlateStore>((set, get) => {
  const defaultPlate = createDefaultPlate()

  return {
    plates: [defaultPlate],
    activePlateId: defaultPlate.id,
    history: [],
    historyIndex: -1,

    getActivePlate: () => {
      const state = get()
      return state.plates.find(p => p.id === state.activePlateId)
    },

    // ─── Multi-plate operations ───

    addPlate: (name?) => {
      const state = get()
      state.snapshot()
      const plateName = name ?? `Plate ${state.plates.length + 1}`
      const newPlate = createDefaultPlate(plateName)
      set({
        plates: [...state.plates, newPlate],
        activePlateId: newPlate.id,
      })
    },

    removePlate: (plateId) => {
      const state = get()
      if (state.plates.length <= 1) return
      state.snapshot()
      const remaining = state.plates.filter(p => p.id !== plateId)
      set({
        plates: remaining,
        activePlateId: state.activePlateId === plateId ? remaining[0].id : state.activePlateId,
      })
    },

    duplicatePlate: (plateId) => {
      const state = get()
      const source = state.plates.find(p => p.id === plateId)
      if (!source) return
      state.snapshot()
      const newId = generateId()
      const newLayerIds = source.layers.map(() => generateId())
      const duplicate: Plate = {
        ...source,
        id: newId,
        name: `${source.name} (Copy)`,
        layers: source.layers.map((l, i) => ({
          ...l,
          id: newLayerIds[i],
          colorMap: { ...l.colorMap },
          values: { ...l.values },
        })),
        activeLayerId: null,
      }
      if (source.activeLayerId) {
        const srcIdx = source.layers.findIndex(l => l.id === source.activeLayerId)
        if (srcIdx >= 0) duplicate.activeLayerId = newLayerIds[srcIdx]
      }
      set({
        plates: [...state.plates, duplicate],
        activePlateId: newId,
      })
    },

    renamePlate: (plateId, name) => {
      set({ plates: updatePlateInArray(get().plates, plateId, p => ({ ...p, name })) })
    },

    setActivePlate: (plateId) => {
      set({ activePlateId: plateId })
    },

    // ─── Plate config ───

    setPlateType: (type, rows?, cols?) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      state.snapshot()
      let config: PlateConfig
      if (type === 'custom') {
        config = { type: 'custom', rows: rows ?? 8, columns: cols ?? 12 }
      } else {
        config = getPlateConfig(type as StandardPlateType)
      }
      set({ plates: updatePlateInArray(state.plates, plate.id, p => ({ ...p, config })) })
    },

    // ─── Layer operations ───

    addLayer: (name) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      state.snapshot()
      const id = generateId()
      const newLayer: MetadataLayer = { id, name, visible: true, colorMap: {}, values: {} }
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: [...p.layers, newLayer],
          activeLayerId: id,
        })),
      })
    },

    removeLayer: (layerId) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      state.snapshot()
      const newLayers = plate.layers.filter(l => l.id !== layerId)
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: newLayers,
          activeLayerId: p.activeLayerId === layerId
            ? (newLayers.length > 0 ? newLayers[0].id : null)
            : p.activeLayerId,
        })),
      })
    },

    renameLayer: (layerId, name) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: p.layers.map(l => l.id === layerId ? { ...l, name } : l),
        })),
      })
    },

    toggleLayerVisibility: (layerId) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: p.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l),
        })),
      })
    },

    setActiveLayer: (layerId) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({ ...p, activeLayerId: layerId })),
      })
    },

    // ─── Layer merge ───

    mergeLayers: (layerIds, newName, separator = ' | ') => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate || layerIds.length < 2) return
      state.snapshot()

      // Get layers in the specified order
      const sourceLayers = layerIds
        .map(id => plate.layers.find(l => l.id === id))
        .filter((l): l is MetadataLayer => l !== undefined)
      if (sourceLayers.length < 2) return

      // Collect all well addresses that have a value in any source layer
      const allWells = new Set<WellAddress>()
      for (const layer of sourceLayers) {
        for (const addr of Object.keys(layer.values)) {
          if (layer.values[addr] != null && layer.values[addr] !== '') {
            allWells.add(addr)
          }
        }
      }

      // Concatenate values in specified order
      const mergedValues: Record<WellAddress, string | number | null> = {}
      const mergedColorMap: Record<string, string> = {}
      for (const addr of allWells) {
        const parts: string[] = []
        for (const layer of sourceLayers) {
          const v = layer.values[addr]
          if (v != null && v !== '') {
            parts.push(String(v))
          }
        }
        if (parts.length > 0) {
          const combined = parts.join(separator)
          mergedValues[addr] = combined
          if (!mergedColorMap[combined]) {
            const assigned = assignColor(combined, mergedColorMap)
            Object.assign(mergedColorMap, assigned)
          }
        }
      }

      const newLayer: MetadataLayer = {
        id: generateId(),
        name: newName,
        visible: true,
        colorMap: mergedColorMap,
        values: mergedValues,
      }

      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: [...p.layers, newLayer],
          activeLayerId: newLayer.id,
        })),
      })
    },

    // ─── Well operations ───

    setWellValues: (layerId, wells, value) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      state.snapshot()
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: p.layers.map(l => {
            if (l.id !== layerId) return l
            const newValues = { ...l.values }
            let newColorMap = { ...l.colorMap }
            for (const w of wells) newValues[w] = value
            if (value !== null && value !== undefined && value !== '') {
              newColorMap = assignColor(value, newColorMap)
            }
            return { ...l, values: newValues, colorMap: newColorMap }
          }),
        })),
      })
    },

    clearWells: (layerId, wells) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      state.snapshot()
      set({
        plates: updatePlateInArray(state.plates, plate.id, p => ({
          ...p,
          layers: p.layers.map(l => {
            if (l.id !== layerId) return l
            const newValues = { ...l.values }
            for (const w of wells) delete newValues[w]
            return { ...l, values: newValues }
          }),
        })),
      })
    },

    fillRow: (layerId, row, value) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      const wells: WellAddress[] = []
      for (let c = 0; c < plate.config.columns; c++) {
        const rowLabel = row < 26 ? String.fromCharCode(65 + row) : ''
        wells.push(`${rowLabel}${c + 1}`)
      }
      state.setWellValues(layerId, wells, value)
    },

    fillColumn: (layerId, col, value) => {
      const state = get()
      const plate = state.getActivePlate()
      if (!plate) return
      const wells: WellAddress[] = []
      for (let r = 0; r < plate.config.rows; r++) {
        const rowLabel = r < 26 ? String.fromCharCode(65 + r) : ''
        wells.push(`${rowLabel}${col + 1}`)
      }
      state.setWellValues(layerId, wells, value)
    },

    // ─── AI operations ───

    applyAILayout: (operation) => {
      const state = get()
      state.snapshot()

      // Resolve target plate
      let targetPlateId = state.activePlateId
      if (operation.plateName) {
        const found = state.plates.find(p => p.name.toLowerCase() === operation.plateName!.toLowerCase())
        if (found) targetPlateId = found.id
      } else if (operation.plateIndex !== undefined && operation.plateIndex < state.plates.length) {
        targetPlateId = state.plates[operation.plateIndex].id
      }
      if (!targetPlateId) return

      if (operation.action === 'configure_plate') {
        let config: PlateConfig
        if (operation.plateType === 'custom') {
          config = { type: 'custom', rows: operation.rows ?? 8, columns: operation.columns ?? 12 }
        } else if (operation.plateType && operation.plateType in PLATE_DIMENSIONS) {
          config = getPlateConfig(operation.plateType as StandardPlateType)
        } else {
          const existing = state.plates.find(p => p.id === targetPlateId)
          config = existing?.config ?? getDefaultPlateConfig()
        }

        const newLayers: MetadataLayer[] = []
        if (operation.layers) {
          for (const lc of operation.layers) {
            const id = generateId()
            const values: Record<WellAddress, string | number | null> = {}
            for (const a of lc.assignments) {
              for (const w of normalizeWellList(a.wells)) values[w] = a.value
            }
            newLayers.push({ id, name: lc.name, visible: true, colorMap: buildColorMap(Object.values(values)), values })
          }
        }

        // If plateName is provided and doesn't exist yet, create a new plate
        if (operation.plateName && !state.plates.find(p => p.name.toLowerCase() === operation.plateName!.toLowerCase())) {
          const newPlate: Plate = {
            id: generateId(),
            name: operation.plateName,
            config,
            layers: newLayers,
            activeLayerId: newLayers.length > 0 ? newLayers[0].id : null,
          }
          set({ plates: [...state.plates, newPlate], activePlateId: newPlate.id })
        } else {
          set({
            plates: updatePlateInArray(state.plates, targetPlateId, p => ({
              ...p,
              config,
              layers: newLayers.length > 0 ? newLayers : p.layers,
              activeLayerId: newLayers.length > 0 ? newLayers[0].id : p.activeLayerId,
            })),
          })
        }
      } else if (operation.action === 'add_layer' && operation.layerName && operation.assignments) {
        const id = generateId()
        const values: Record<WellAddress, string | number | null> = {}
        for (const a of operation.assignments) {
          for (const w of normalizeWellList(a.wells)) values[w] = a.value
        }
        const newLayer: MetadataLayer = { id, name: operation.layerName, visible: true, colorMap: buildColorMap(Object.values(values)), values }
        set({
          plates: updatePlateInArray(state.plates, targetPlateId, p => ({
            ...p, layers: [...p.layers, newLayer], activeLayerId: id,
          })),
        })
      } else if (operation.action === 'update_layer' && operation.layerName && operation.assignments) {
        set({
          plates: updatePlateInArray(state.plates, targetPlateId, p => {
            const existing = p.layers.find(l => l.name === operation.layerName)
            if (!existing) return p
            const newValues = { ...existing.values }
            for (const a of operation.assignments!) {
              for (const w of normalizeWellList(a.wells)) newValues[w] = a.value
            }
            return {
              ...p,
              layers: p.layers.map(l => l.id === existing.id ? { ...l, values: newValues, colorMap: buildColorMap(Object.values(newValues)) } : l),
            }
          }),
        })
      } else if (operation.action === 'clear_wells' && operation.wells) {
        const wellsToClear = normalizeWellList(operation.wells)
        set({
          plates: updatePlateInArray(state.plates, targetPlateId, p => ({
            ...p,
            layers: p.layers.map(l => {
              const newValues = { ...l.values }
              for (const w of wellsToClear) delete newValues[w]
              return { ...l, values: newValues }
            }),
          })),
        })
      }
    },

    // ─── Undo/Redo ───

    snapshot: () => {
      const state = get()
      const snap = createSnapshotFromState(state)
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snap)
      if (newHistory.length > 50) newHistory.shift()
      set({ history: newHistory, historyIndex: newHistory.length - 1 })
    },

    undo: () => {
      const state = get()
      if (state.historyIndex < 0) return
      const snap = state.history[state.historyIndex]
      set({
        plates: deepClonePlates(snap.plates),
        activePlateId: snap.activePlateId,
        historyIndex: state.historyIndex - 1,
      })
    },

    redo: () => {
      const state = get()
      if (state.historyIndex >= state.history.length - 1) return
      if (state.historyIndex + 2 < state.history.length) {
        const snap = state.history[state.historyIndex + 2]
        set({
          plates: deepClonePlates(snap.plates),
          activePlateId: snap.activePlateId,
          historyIndex: state.historyIndex + 1,
        })
      }
    },

    resetPlate: () => {
      const dp = createDefaultPlate()
      set({ plates: [dp], activePlateId: dp.id, history: [], historyIndex: -1 })
    },
  }
})
