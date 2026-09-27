import { useState } from 'react'
import { apiFetchBlob } from '../../lib/api'

export type ExportFormat = 'json' | 'csv'

interface ExportState {
  pending: ExportFormat | null
  error: string | null
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Downloads GET /api/export?format=... as a file. Shares it through the OS share sheet when the
 * platform supports sharing files (iOS Safari: "Guardar en Archivos"), otherwise falls back to a
 * plain blob download link — feature-detected via `canShare`, never a UA sniff for "iOS".
 */
export function useExportData() {
  const [state, setState] = useState<ExportState>({ pending: null, error: null })

  const exportData = async (format: ExportFormat) => {
    setState({ pending: format, error: null })
    try {
      const { blob, filename } = await apiFetchBlob(`/api/export?format=${format}`)
      const file = new File([blob], filename, { type: blob.type })
      const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }

      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        downloadBlob(blob, filename)
      }
      setState({ pending: null, error: null })
    } catch (error) {
      // Dismissing the native share sheet rejects with an AbortError — not a real failure.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState({ pending: null, error: null })
        return
      }
      setState({ pending: null, error: error instanceof Error ? error.message : 'No se pudo exportar.' })
    }
  }

  return { exportData, pendingFormat: state.pending, error: state.error }
}
