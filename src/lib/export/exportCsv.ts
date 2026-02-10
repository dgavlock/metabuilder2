import { PlateConfig, MetadataLayer, Plate } from '@/types/plate'
import { wellAddress, rowIndexToLabel } from '@/lib/plate/wellAddressing'
import { downloadString } from '@/lib/utils'

function buildCsvContent(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean, plateName?: string): string {
  const headers = [
    ...(plateName !== undefined ? ['Plate'] : []),
    'Well', 'Row', 'Column',
    ...layers.map((l) => l.name),
  ]
  const rows: string[][] = []

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.columns; c++) {
      const addr = wellAddress(r, c)
      const hasAnyValue = layers.some((l) => {
        const val = l.values[addr]
        return val !== null && val !== undefined && val !== ''
      })
      if (!includeEmptyWells && !hasAnyValue) continue

      const row = [
        ...(plateName !== undefined ? [plateName] : []),
        addr,
        rowIndexToLabel(r),
        String(c + 1),
        ...layers.map((l) => {
          const val = l.values[addr]
          return val !== null && val !== undefined ? String(val) : ''
        }),
      ]
      rows.push(row)
    }
  }

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')
}

export function exportCsv(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false, suffix: string = '') {
  const csvContent = buildCsvContent(config, layers, includeEmptyWells)
  downloadString(csvContent, `plate-metadata${suffix}.csv`, 'text/csv')
}

/** Consolidated multi-plate CSV — all plates in one file with a Plate column */
export function exportCsvMultiPlate(plates: Plate[], includeEmptyWells: boolean = false) {
  // Collect all unique layer names across all plates
  const allLayerNames = [...new Set(plates.flatMap(p => p.layers.map(l => l.name)))]

  const headers = ['Plate', 'Well', 'Row', 'Column', ...allLayerNames]
  const rows: string[][] = []

  for (const plate of plates) {
    for (let r = 0; r < plate.config.rows; r++) {
      for (let c = 0; c < plate.config.columns; c++) {
        const addr = wellAddress(r, c)
        const hasAnyValue = plate.layers.some((l) => {
          const val = l.values[addr]
          return val !== null && val !== undefined && val !== ''
        })
        if (!includeEmptyWells && !hasAnyValue) continue

        const row = [
          plate.name,
          addr,
          rowIndexToLabel(r),
          String(c + 1),
          ...allLayerNames.map((layerName) => {
            const layer = plate.layers.find(l => l.name === layerName)
            if (!layer) return ''
            const val = layer.values[addr]
            return val !== null && val !== undefined ? String(val) : ''
          }),
        ]
        rows.push(row)
      }
    }
  }

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n')

  downloadString(csvContent, 'plate-metadata.csv', 'text/csv')
}

/** Returns CSV string content (for zip usage) */
export function generateCsvString(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false): string {
  return buildCsvContent(config, layers, includeEmptyWells)
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
