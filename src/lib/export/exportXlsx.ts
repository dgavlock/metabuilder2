import ExcelJS from 'exceljs'
import { PlateConfig, MetadataLayer, Plate } from '@/types/plate'
import { wellAddress, rowIndexToLabel } from '@/lib/plate/wellAddressing'
import { downloadBlob } from '@/lib/utils'

function addSummarySheet(workbook: ExcelJS.Workbook, config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean, sheetName: string = 'Summary') {
  const summarySheet = workbook.addWorksheet(sheetName)
  const headers = ['Well', 'Row', 'Column', ...layers.map((l) => l.name)]
  summarySheet.addRow(headers)

  const headerRow = summarySheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E5E5' },
  }

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.columns; c++) {
      const addr = wellAddress(r, c)
      const hasAnyValue = layers.some((l) => {
        const val = l.values[addr]
        return val !== null && val !== undefined && val !== ''
      })
      if (!includeEmptyWells && !hasAnyValue) continue

      const rowData = [
        addr,
        rowIndexToLabel(r),
        c + 1,
        ...layers.map((l) => {
          const val = l.values[addr]
          return val !== null && val !== undefined ? val : ''
        }),
      ]
      summarySheet.addRow(rowData)
    }
  }

  summarySheet.columns.forEach((col) => {
    let maxLen = 10
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value).length
      if (len > maxLen) maxLen = len
    })
    col.width = Math.min(maxLen + 2, 30)
  })
}

function addLayerSheets(workbook: ExcelJS.Workbook, config: PlateConfig, layers: MetadataLayer[], namePrefix: string = '') {
  for (const layer of layers) {
    const sheetName = namePrefix ? `${namePrefix} - ${layer.name}` : layer.name
    // Excel sheet names limited to 31 chars
    const sheet = workbook.addWorksheet(sheetName.slice(0, 31))

    const colHeaders = ['', ...Array.from({ length: config.columns }, (_, i) => i + 1)]
    sheet.addRow(colHeaders)
    const layerHeaderRow = sheet.getRow(1)
    layerHeaderRow.font = { bold: true }
    layerHeaderRow.alignment = { horizontal: 'center' }

    for (let r = 0; r < config.rows; r++) {
      const rowLabel = rowIndexToLabel(r)
      const rowData: (string | number)[] = [rowLabel]

      for (let c = 0; c < config.columns; c++) {
        const addr = wellAddress(r, c)
        const val = layer.values[addr]
        rowData.push(val !== null && val !== undefined ? val : '')
      }

      sheet.addRow(rowData)

      const excelRow = sheet.getRow(r + 2)
      excelRow.getCell(1).font = { bold: true }

      for (let c = 0; c < config.columns; c++) {
        const addr = wellAddress(r, c)
        const val = layer.values[addr]
        if (val !== null && val !== undefined && val !== '') {
          const color = layer.colorMap[String(val)]
          if (color) {
            const cell = excelRow.getCell(c + 2)
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF' + color.replace('#', '') },
            }
            cell.alignment = { horizontal: 'center' }
            const brightness = getBrightness(color)
            cell.font = { color: { argb: brightness < 128 ? 'FFFFFFFF' : 'FF000000' } }
          }
        }
      }
    }

    sheet.getColumn(1).width = 4
    for (let c = 0; c < config.columns; c++) {
      sheet.getColumn(c + 2).width = 12
    }
  }
}

export async function exportXlsx(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false, suffix: string = '') {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MetaBuilder'
  workbook.created = new Date()

  addSummarySheet(workbook, config, layers, includeEmptyWells)
  addLayerSheets(workbook, config, layers)

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  downloadBlob(blob, `plate-metadata${suffix}.xlsx`)
}

/** Consolidated multi-plate XLSX — all plates in one workbook with grouped sheets */
export async function exportXlsxMultiPlate(plates: Plate[], includeEmptyWells: boolean = false) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MetaBuilder'
  workbook.created = new Date()

  for (const plate of plates) {
    const prefix = plate.name.slice(0, 15)
    addSummarySheet(workbook, plate.config, plate.layers, includeEmptyWells, `${prefix} Summary`.slice(0, 31))
    addLayerSheets(workbook, plate.config, plate.layers, prefix)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  downloadBlob(blob, 'plate-metadata.xlsx')
}

/** Returns XLSX buffer (for zip usage) */
export async function generateXlsxBuffer(config: PlateConfig, layers: MetadataLayer[], includeEmptyWells: boolean = false): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MetaBuilder'
  workbook.created = new Date()

  addSummarySheet(workbook, config, layers, includeEmptyWells)
  addLayerSheets(workbook, config, layers)

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer
}

function getBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}
