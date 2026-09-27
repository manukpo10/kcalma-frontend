import { FileJson, FileSpreadsheet } from 'lucide-react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { useExportData } from './useExportData'

interface ExportDataSheetProps {
  onClose: () => void
}

/** "Exportar mis datos": JSON or CSV, shared via the OS share sheet when available (iOS) or
 *  downloaded directly otherwise — see useExportData. */
export function ExportDataSheet({ onClose }: ExportDataSheetProps) {
  const { exportData, pendingFormat, error } = useExportData()
  const busy = pendingFormat !== null

  return (
    <Sheet onClose={onClose} ariaLabel="Exportar mis datos">
      <p className="mb-1 text-lg font-bold text-ink">Exportar mis datos</p>
      <p className="mb-5 text-sm text-ink-muted">Elegí un formato para descargar tu historial completo.</p>

      {error && (
        <Banner tone="danger" className="mb-4">
          {error}
        </Banner>
      )}

      <div className="space-y-3">
        <Button
          variant="secondary"
          icon={<FileJson className="size-5" aria-hidden="true" />}
          loading={pendingFormat === 'json'}
          disabled={busy}
          onClick={() => void exportData('json')}
        >
          Descargar como JSON
        </Button>
        <Button
          variant="secondary"
          icon={<FileSpreadsheet className="size-5" aria-hidden="true" />}
          loading={pendingFormat === 'csv'}
          disabled={busy}
          onClick={() => void exportData('csv')}
        >
          Descargar como CSV
        </Button>
      </div>

      <Button variant="ghost" className="mt-3" onClick={onClose}>
        Cerrar
      </Button>
    </Sheet>
  )
}
