import { PlateConfig, MetadataLayer, Plate } from '@/types/plate'
import { wellAddress } from '@/lib/plate/wellAddressing'
import { downloadString } from '@/lib/utils'

function buildXmlForPlate(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean, plateName?: string, indent: string = ''): string {
  let xml = ''
  xml += `${indent}<Plate type="${config.type}" rows="${config.rows}" columns="${config.columns}"${config.label ? ` label="${escapeXml(config.label)}"` : ''}${plateName ? ` name="${escapeXml(plateName)}"` : ''} />\n`
  xml += `${indent}<Layers>\n`

  for (const layer of layers) {
    xml += `${indent}  <Layer name="${escapeXml(layer.name)}">\n`
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.columns; c++) {
        const addr = wellAddress(r, c)
        const val = layer.values[addr]
        const hasValue = val !== null && val !== undefined && val !== ''
        if (hasValue) {
          xml += `${indent}    <Well address="${addr}" value="${escapeXml(String(val))}" />\n`
        } else if (includeEmptyWells) {
          xml += `${indent}    <Well address="${addr}" value="" />\n`
        }
      }
    }
    xml += `${indent}  </Layer>\n`
  }

  xml += `${indent}</Layers>\n`
  return xml
}

export function exportXml(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false, suffix: string = '') {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<PlateMetadata>\n'
  xml += buildXmlForPlate(config, layers, includeEmptyWells, undefined, '  ')
  xml += '</PlateMetadata>\n'
  downloadString(xml, `plate-metadata${suffix}.xml`, 'application/xml')
}

/** Consolidated multi-plate XML — all plates in one file */
export function exportXmlMultiPlate(plates: Plate[], includeEmptyWells: boolean = false) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<PlateMetadata>\n'
  xml += '  <Plates>\n'
  for (const plate of plates) {
    xml += `    <PlateEntry name="${escapeXml(plate.name)}">\n`
    xml += buildXmlForPlate(plate.config, plate.layers, includeEmptyWells, plate.name, '      ')
    xml += '    </PlateEntry>\n'
  }
  xml += '  </Plates>\n'
  xml += '</PlateMetadata>\n'
  downloadString(xml, 'plate-metadata.xml', 'application/xml')
}

/** Returns XML string content (for zip usage) */
export function generateXmlString(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<PlateMetadata>\n'
  xml += buildXmlForPlate(config, layers, includeEmptyWells, undefined, '  ')
  xml += '</PlateMetadata>\n'
  return xml
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
