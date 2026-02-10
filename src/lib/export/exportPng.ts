import { toPng } from 'html-to-image'
import { PngExportOptions } from '@/types/export'
import { downloadBlob } from '@/lib/utils'

export async function exportPng(options: PngExportOptions) {
  const container = document.getElementById('plate-grid-container')
  if (!container) {
    throw new Error('Plate grid container not found')
  }

  const dataUrl = await toPng(container, {
    backgroundColor: options.backgroundColor || '#ffffff',
    pixelRatio: options.scale || 2,
    quality: 1,
  })

  const response = await fetch(dataUrl)
  const blob = await response.blob()
  downloadBlob(blob, 'plate-layout.png')
}

/** Captures the currently rendered plate as a PNG blob (for zip usage) */
export async function capturePngBlob(options: PngExportOptions): Promise<Blob> {
  const container = document.getElementById('plate-grid-container')
  if (!container) {
    throw new Error('Plate grid container not found')
  }

  const dataUrl = await toPng(container, {
    backgroundColor: options.backgroundColor || '#ffffff',
    pixelRatio: options.scale || 2,
    quality: 1,
  })

  const response = await fetch(dataUrl)
  return response.blob()
}
