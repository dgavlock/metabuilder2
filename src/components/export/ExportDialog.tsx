'use client'

import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { usePlateStore } from '@/stores/plateStore'
import { useChatStore } from '@/stores/chatStore'
import { ExportFormat, PngExportOptions, PptxExportOptions } from '@/types/export'
import { exportJson, exportJsonMultiPlate, generateJsonString } from '@/lib/export/exportJson'
import { exportCsv, exportCsvMultiPlate, generateCsvString } from '@/lib/export/exportCsv'
import { exportXml, exportXmlMultiPlate, generateXmlString } from '@/lib/export/exportXml'
import { exportPng, capturePngBlob } from '@/lib/export/exportPng'
import { exportXlsx, exportXlsxMultiPlate, generateXlsxBuffer } from '@/lib/export/exportXlsx'
import { exportPptx, exportPptxMultiPlate } from '@/lib/export/exportPptx'
import { downloadBlob } from '@/lib/utils'
import { Plate } from '@/types/plate'
import JSZip from 'jszip'
import { X, FileJson, FileSpreadsheet, FileText, Image, Presentation, FileCode } from 'lucide-react'

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'json', label: 'JSON', icon: <FileJson size={18} />, description: 'Structured metadata' },
  { value: 'csv', label: 'CSV', icon: <FileText size={18} />, description: 'Flat table format' },
  { value: 'xml', label: 'XML', icon: <FileCode size={18} />, description: 'Structured XML' },
  { value: 'png', label: 'PNG', icon: <Image size={18} />, description: 'Visual plate image' },
  { value: 'xlsx', label: 'Excel', icon: <FileSpreadsheet size={18} />, description: 'Colored spreadsheet' },
  { value: 'pptx', label: 'PowerPoint', icon: <Presentation size={18} />, description: 'Presentation slides' },
]

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  json: '.json',
  csv: '.csv',
  xml: '.xml',
  png: '.png',
  xlsx: '.xlsx',
  pptx: '.pptx',
}

export function ExportDialog() {
  const toggleExportDialog = useUIStore((s) => s.toggleExportDialog)
  const plates = usePlateStore((s) => s.plates)
  const activePlateId = usePlateStore((s) => s.activePlateId)
  const setActivePlate = usePlateStore((s) => s.setActivePlate)
  const messages = useChatStore((s) => s.messages)

  const [format, setFormat] = useState<ExportFormat>('json')
  const [includeEmptyWells, setIncludeEmptyWells] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportScope, setExportScope] = useState<'active' | 'all'>('active')
  const [consolidateFiles, setConsolidateFiles] = useState(true)

  // PNG options
  const [pngOptions, setPngOptions] = useState<PngExportOptions>({
    showLabels: true,
    includeLegend: true,
    backgroundColor: '#ffffff',
    scale: 2,
  })

  // PPTX options
  const [pptxOptions, setPptxOptions] = useState<PptxExportOptions>({
    includeDescriptionSlides: true,
    experimentDescription: messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n\n'),
    title: 'Experiment Plate Layout',
  })

  const activePlate = plates.find(p => p.id === activePlateId)
  const platesToExport = exportScope === 'all' ? plates : (activePlate ? [activePlate] : [])
  const hasLayers = platesToExport.some(p => p.layers.length > 0)
  const isMultiPlateExport = exportScope === 'all' && plates.length > 1

  // PNG always uses zip for multiple plates (can't consolidate images into one file)
  const willConsolidate = isMultiPlateExport && consolidateFiles && format !== 'png'
  const willZip = isMultiPlateExport && (!consolidateFiles || format === 'png')

  /** Export as zip with individual plate files */
  async function exportAsZip(platesToExport: Plate[], format: ExportFormat) {
    const zip = new JSZip()
    const ext = FILE_EXTENSIONS[format]
    const originalActivePlateId = activePlateId

    for (const plate of platesToExport) {
      const safeName = plate.name.replace(/[^a-zA-Z0-9_-]/g, '_')

      switch (format) {
        case 'json':
          zip.file(`${safeName}${ext}`, generateJsonString(plate.config, plate.layers, includeEmptyWells))
          break
        case 'csv':
          zip.file(`${safeName}${ext}`, generateCsvString(plate.config, plate.layers, includeEmptyWells))
          break
        case 'xml':
          zip.file(`${safeName}${ext}`, generateXmlString(plate.config, plate.layers, includeEmptyWells))
          break
        case 'xlsx': {
          const buffer = await generateXlsxBuffer(plate.config, plate.layers, includeEmptyWells)
          zip.file(`${safeName}${ext}`, buffer)
          break
        }
        case 'png': {
          // Switch to this plate so the SVG renders it, wait for render, then capture
          setActivePlate(plate.id)
          // Small delay to allow React to re-render the plate grid
          await new Promise(resolve => setTimeout(resolve, 200))
          const blob = await capturePngBlob(pngOptions)
          zip.file(`${safeName}${ext}`, blob)
          break
        }
        case 'pptx': {
          // PPTX separate: each plate gets its own file — not zippable via buffer,
          // so we fall through to individual downloads
          break
        }
      }
    }

    // Restore original active plate for PNG case
    if (format === 'png' && originalActivePlateId) {
      setActivePlate(originalActivePlateId)
    }

    // Special case: PPTX can't easily be zipped (uses writeFile directly),
    // so for separate PPTX exports we just download them individually
    if (format === 'pptx') {
      for (const plate of platesToExport) {
        const suffix = `_${plate.name.replace(/\s+/g, '_')}`
        await exportPptx(plate.config, plate.layers, pptxOptions, suffix)
      }
      return
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, `plate-metadata${ext === '.png' ? '-images' : ''}.zip`)
  }

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)

    try {
      if (!isMultiPlateExport) {
        // Single plate export (active plate only, or "all" with just 1 plate)
        const plate = platesToExport[0]
        if (!plate) return

        switch (format) {
          case 'json':
            exportJson(plate.config, plate.layers, includeEmptyWells)
            break
          case 'csv':
            exportCsv(plate.config, plate.layers, includeEmptyWells)
            break
          case 'xml':
            exportXml(plate.config, plate.layers, includeEmptyWells)
            break
          case 'png':
            await exportPng(pngOptions)
            break
          case 'xlsx':
            await exportXlsx(plate.config, plate.layers, includeEmptyWells)
            break
          case 'pptx':
            await exportPptx(plate.config, plate.layers, pptxOptions)
            break
        }
      } else if (willConsolidate) {
        // Consolidated multi-plate export (one file)
        switch (format) {
          case 'json':
            exportJsonMultiPlate(platesToExport, includeEmptyWells)
            break
          case 'csv':
            exportCsvMultiPlate(platesToExport, includeEmptyWells)
            break
          case 'xml':
            exportXmlMultiPlate(platesToExport, includeEmptyWells)
            break
          case 'xlsx':
            await exportXlsxMultiPlate(platesToExport, includeEmptyWells)
            break
          case 'pptx':
            await exportPptxMultiPlate(platesToExport, pptxOptions)
            break
        }
      } else {
        // Separate files as zip
        await exportAsZip(platesToExport, format)
      }

      toggleExportDialog()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  // Determine what the button label says
  const getButtonLabel = () => {
    if (isExporting) return 'Exporting...'
    const formatLabel = FORMAT_OPTIONS.find((o) => o.value === format)?.label
    if (willZip) return `Export as ZIP (${platesToExport.length} ${formatLabel} files)`
    return `Export as ${formatLabel}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={toggleExportDialog}>
      <div
        className="bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Export Metadata</h2>
          <button onClick={toggleExportDialog} className="p-1 rounded hover:bg-[var(--muted)]">
            <X size={18} />
          </button>
        </div>

        {/* Plate scope selector (only show when multiple plates exist) */}
        {plates.length > 1 && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-[var(--muted)]">
            <span className="text-sm font-medium">Export:</span>
            <button
              onClick={() => setExportScope('active')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                exportScope === 'active'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] hover:bg-[var(--background)]'
              }`}
            >
              Active plate ({activePlate?.name})
            </button>
            <button
              onClick={() => setExportScope('all')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                exportScope === 'all'
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'border border-[var(--border)] hover:bg-[var(--background)]'
              }`}
            >
              All plates ({plates.length})
            </button>
          </div>
        )}

        {/* Format selection */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFormat(opt.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                format === opt.value
                  ? 'border-[var(--primary)] bg-[var(--accent)]'
                  : 'border-[var(--border)] hover:bg-[var(--muted)]'
              }`}
            >
              <span className={format === opt.value ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}>
                {opt.icon}
              </span>
              <span className="text-xs font-medium">{opt.label}</span>
              <span className="text-[10px] text-[var(--muted-foreground)]">{opt.description}</span>
            </button>
          ))}
        </div>

        {/* Consolidate toggle — only shown for multi-plate "all" exports, and not for PNG */}
        {isMultiPlateExport && format !== 'png' && (
          <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-[var(--muted)]">
            <div>
              <div className="text-sm font-medium">Combine into single file</div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                {consolidateFiles
                  ? 'All plates will be merged into one file'
                  : 'Each plate exported separately in a ZIP archive'
                }
              </div>
            </div>
            <button
              onClick={() => setConsolidateFiles(!consolidateFiles)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                consolidateFiles ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
              role="switch"
              aria-checked={consolidateFiles}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  consolidateFiles ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* PNG multi-plate info */}
        {isMultiPlateExport && format === 'png' && (
          <div className="mb-5 p-3 rounded-lg bg-[var(--muted)]">
            <div className="text-sm font-medium">Multiple plate images</div>
            <div className="text-[10px] text-[var(--muted-foreground)]">
              Each plate will be exported as a separate PNG image inside a ZIP archive.
            </div>
          </div>
        )}

        {/* Include empty wells toggle — applies to data formats (not PNG/PPTX) */}
        {format !== 'png' && format !== 'pptx' && (
          <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-[var(--muted)]">
            <div>
              <div className="text-sm font-medium">Include empty wells</div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                Export wells that have no metadata assigned
              </div>
            </div>
            <button
              onClick={() => setIncludeEmptyWells(!includeEmptyWells)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                includeEmptyWells ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
              }`}
              role="switch"
              aria-checked={includeEmptyWells}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  includeEmptyWells ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Format-specific options */}
        {format === 'png' && (
          <div className="space-y-3 mb-5 p-3 rounded-lg bg-[var(--muted)]">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">PNG Options</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pngOptions.showLabels}
                onChange={(e) => setPngOptions({ ...pngOptions, showLabels: e.target.checked })}
              />
              Show well labels
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pngOptions.includeLegend}
                onChange={(e) => setPngOptions({ ...pngOptions, includeLegend: e.target.checked })}
              />
              Include legend
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm">Scale:</label>
              <select
                value={pngOptions.scale}
                onChange={(e) => setPngOptions({ ...pngOptions, scale: Number(e.target.value) })}
                className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--background)]"
              >
                <option value={1}>1x</option>
                <option value={2}>2x (Recommended)</option>
                <option value={4}>4x (High Resolution)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Background:</label>
              <input
                type="color"
                value={pngOptions.backgroundColor}
                onChange={(e) => setPngOptions({ ...pngOptions, backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer"
              />
            </div>
          </div>
        )}

        {format === 'pptx' && (
          <div className="space-y-3 mb-5 p-3 rounded-lg bg-[var(--muted)]">
            <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">PowerPoint Options</h3>
            <div>
              <label className="text-sm block mb-1">Presentation Title</label>
              <input
                value={pptxOptions.title}
                onChange={(e) => setPptxOptions({ ...pptxOptions, title: e.target.value })}
                className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border)] bg-[var(--background)]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pptxOptions.includeDescriptionSlides}
                onChange={(e) => setPptxOptions({ ...pptxOptions, includeDescriptionSlides: e.target.checked })}
              />
              Include experiment description slide
            </label>
            {pptxOptions.includeDescriptionSlides && (
              <div>
                <label className="text-sm block mb-1">Experiment Description</label>
                <textarea
                  value={pptxOptions.experimentDescription}
                  onChange={(e) => setPptxOptions({ ...pptxOptions, experimentDescription: e.target.value })}
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border)] bg-[var(--background)] resize-none"
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 rounded bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={isExporting || !hasLayers}
          className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {getButtonLabel()}
        </button>

        {!hasLayers && (
          <p className="text-xs text-[var(--muted-foreground)] text-center mt-2">
            Add at least one metadata layer before exporting.
          </p>
        )}
      </div>
    </div>
  )
}
