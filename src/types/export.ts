export type ExportFormat = 'json' | 'csv' | 'xml' | 'png' | 'xlsx' | 'pptx'

export interface PngExportOptions {
  showLabels: boolean
  includeLegend: boolean
  backgroundColor: string
  scale: number // 1, 2, or 4
  title?: string
}

export interface PptxExportOptions {
  includeDescriptionSlides: boolean
  experimentDescription?: string
  title?: string
}

export interface ExportOptions {
  format: ExportFormat
  includeEmptyWells: boolean
  png?: PngExportOptions
  pptx?: PptxExportOptions
}
