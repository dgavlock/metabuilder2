import { PlateConfig, MetadataLayer, Plate } from '@/types/plate'
import { downloadString } from '@/lib/utils'

function buildPlateData(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean) {
  return {
    plate: {
      type: config.type,
      rows: config.rows,
      columns: config.columns,
      label: config.label || undefined,
    },
    layers: layers.map((layer) => {
      if (includeEmptyWells) {
        return { name: layer.name, values: layer.values }
      }
      const filtered: Record<string, string | number | null> = {}
      for (const [well, val] of Object.entries(layer.values)) {
        if (val !== null && val !== undefined && val !== '') {
          filtered[well] = val
        }
      }
      return { name: layer.name, values: filtered }
    }),
  }
}

export function exportJson(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false, suffix: string = '') {
  const data = buildPlateData(config, layers, includeEmptyWells)
  const json = JSON.stringify(data, null, 2)
  downloadString(json, `plate-metadata${suffix}.json`, 'application/json')
}

/** Consolidated multi-plate JSON — all plates in one file */
export function exportJsonMultiPlate(plates: Plate[], includeEmptyWells: boolean = false) {
  const data = {
    plates: plates.map((plate) => ({
      name: plate.name,
      ...buildPlateData(plate.config, plate.layers, includeEmptyWells),
    })),
  }
  const json = JSON.stringify(data, null, 2)
  downloadString(json, 'plate-metadata.json', 'application/json')
}

/** Returns JSON string content (for zip usage) */
export function generateJsonString(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false): string {
  const data = buildPlateData(config, layers, includeEmptyWells)
  return JSON.stringify(data, null, 2)
}
