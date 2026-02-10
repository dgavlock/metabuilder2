export type StandardPlateType = 6 | 12 | 24 | 48 | 96 | 384 | 1536
export type PlateType = StandardPlateType | 'custom'

export type WellAddress = string // "A1", "B12", etc.

export interface PlateConfig {
  type: PlateType
  rows: number
  columns: number
  label?: string
}

export interface MetadataLayer {
  id: string
  name: string
  visible: boolean
  colorMap: Record<string, string>
  values: Record<WellAddress, string | number | null>
}

// A single plate with its own config and layers
export interface Plate {
  id: string
  name: string
  config: PlateConfig
  layers: MetadataLayer[]
  activeLayerId: string | null
}

export interface PlateState {
  config: PlateConfig
  layers: MetadataLayer[]
  activeLayerId: string | null
}

export interface WellView {
  address: WellAddress
  row: number
  col: number
  layerValues: Record<string, string | number | null>
  displayColor: string
  isSelected: boolean
}

export interface PlateSnapshot {
  plates: Plate[]
  activePlateId: string | null
}

// AI-generated layout operation
export interface AILayerAssignment {
  wells: WellAddress[]
  value: string | number
}

export interface AILayerConfig {
  name: string
  assignments: AILayerAssignment[]
}

export interface AIPlateOperation {
  action: 'configure_plate' | 'update_layer' | 'add_layer' | 'clear_wells'
  plateType?: StandardPlateType | 'custom'
  rows?: number
  columns?: number
  layers?: AILayerConfig[]
  layerName?: string
  assignments?: AILayerAssignment[]
  wells?: WellAddress[]
  // Multi-plate: target a specific plate by name or index
  plateName?: string
  plateIndex?: number
}
