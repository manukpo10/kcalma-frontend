import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/ToastProvider'
import { apiFetch } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { usePushUnsubscribe } from '../reminders/usePushSubscription'

const CONFIRM_WORD = 'ELIMINAR'

interface DeleteAccountSheetProps {
  onClose: () => void
}

/**
 * Perfil -> "Eliminar mi cuenta" danger zone. Irreversible: `DELETE /api/account` drops every row
 * the backend has for this account plus the Supabase auth user itself. Requires typing
 * `CONFIRM_WORD` first, same "type to confirm" pattern as other irreversible-and-unusual actions
 * elsewhere in the ecosystem — a plain "¿Estás seguro?" is too easy to tap through by habit here.
 */
export function DeleteAccountSheet({ onClose }: DeleteAccountSheetProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const unsubscribePush = usePushUnsubscribe()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_WORD

  const handleDelete = async () => {
    if (!canDelete || deleting) return
    setDeleting(true)

    try {
      await unsubscribePush.mutateAsync()
    } catch {
      // Best-effort: this device's push registration is cosmetic cleanup — it must never block
      // deleting the account itself.
    }

    try {
      await apiFetch<void>('/api/account', { method: 'DELETE' })
    } catch {
      // Covers the backend not being live yet (404/405) as well as any real failure — either way
      // the account is untouched, so stay on this sheet (confirm text kept) and let the user retry.
      showToast({ message: 'No se pudo eliminar la cuenta. Intentá de nuevo.' })
      setDeleting(false)
      return
    }

    queryClient.clear()
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
    showToast({ message: 'Tu cuenta fue eliminada' })
  }

  return (
    <Sheet onClose={onClose} ariaLabel="Eliminar mi cuenta">
      <p className="mb-1 text-lg font-bold text-ink">¿Eliminar tu cuenta?</p>
      <p className="mb-4 text-sm text-ink-muted">
        Esta acción es irreversible: se borran tu perfil, tus comidas, tu peso, tus medidas y todo
        lo demás que guardamos de vos. Si querés conservar tu historial, exportalo primero desde
        Perfil.
      </p>

      <Input
        label={`Escribí ${CONFIRM_WORD} para confirmar`}
        id="confirm-delete"
        value={confirmText}
        onChange={(event) => setConfirmText(event.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        containerClassName="mb-4"
      />

      <Button
        variant="danger"
        icon={<Trash2 className="size-5" aria-hidden="true" />}
        loading={deleting}
        disabled={!canDelete}
        onClick={() => void handleDelete()}
      >
        Eliminar mi cuenta
      </Button>
      <Button variant="ghost" className="mt-2" disabled={deleting} onClick={onClose}>
        Cancelar
      </Button>
    </Sheet>
  )
}
