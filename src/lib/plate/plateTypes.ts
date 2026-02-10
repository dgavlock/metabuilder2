import { StandardPlateType, PlateConfig } from '@/types/plate'

export const PLATE_DIMENSIONS: Record<StandardPlateType, { rows: number; columns: number }> = {
  6: { rows: 2, columns: 3 },
  12: { rows: 3, columns: 4 },
  24: { rows: 4, columns: 6 },
  48: { rows: 6, columns: 8 },
  96: { rows: 8, columns: 12 },
  384: { rows: 16, columns: 24 },
  1536: { rows: 32, columns: 48 },
}

export const STANDARD_PLATE_TYPES: StandardPlateType[] = [6, 12, 24, 48, 96, 384, 1536]

export function getPlateConfig(type: StandardPlateType): PlateConfig {
  const dims = PLATE_DIMENSIONS[type]
  return { type, rows: dims.rows, columns: dims.columns }
}

export function getDefaultPlateConfig(): PlateConfig {
  return getPlateConfig(96)
}
