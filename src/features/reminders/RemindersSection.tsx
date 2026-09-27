import { Bell, Minus, Plus, Send, Share2, SquarePlus } from 'lucide-react'
import { useState } from 'react'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Switch'
import { useToast } from '../../components/ui/ToastProvider'
import { REMINDER_MEAL_LABELS, REMINDER_MEAL_ORDER } from './labels'
import { isPushSupported, isStandalonePwa } from './pushSupport'
import { ReminderTimeInput } from './ReminderTimeInput'
import { useReminderSettings, useUpdateReminderSettings } from './useReminderSettings'
import { usePushSubscribe, usePushUnsubscribe } from './usePushSubscription'
import { useSendTestPush } from './useTestPush'
import type { ReminderMealType, ReminderSettings } from './types'
import { WeekdayPicker } from './WeekdayPicker'

const MIN_WATER_HOURS = 1
const MAX_WATER_HOURS = 6

interface HoursStepperProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

/** "Cada N horas" nudge stepper for the water reminder — same shape as food/GramsStepper. */
function HoursStepper({ value, onChange, disabled }: HoursStepperProps) {
  const clamp = (n: number) => Math.min(MAX_WATER_HOURS, Math.max(MIN_WATER_HOURS, n))

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || value <= MIN_WATER_HOURS}
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Menos seguido"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-hairline active:bg-hairline disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="w-20 text-center text-sm font-semibold text-ink">Cada {value} h</span>
      <button
        type="button"
        disabled={disabled || value >= MAX_WATER_HOURS}
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Más seguido"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink transition-colors hover:bg-hairline active:bg-hairline disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

/** iOS only exposes a working Push API to an installed (home-screen) PWA — a normal Safari tab
 *  has no functioning `PushManager` at all, so there's nothing to toggle yet. */
function InstallInstructions() {
  return (
    <Card>
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        <Bell className="size-4" aria-hidden="true" />
        Recordatorios
      </p>
      <p className="mb-4 text-sm text-ink-muted">
        En iPhone, las notificaciones sólo funcionan una vez que instalás Kcalma en la pantalla de inicio:
      </p>
      <ol className="space-y-3 text-sm text-ink">
        <li className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-ink-muted">
            1
          </span>
          Si no estás en Safari, abrí este sitio ahí.
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
            <Share2 className="size-4" aria-hidden="true" />
          </span>
          Tocá el botón <strong>Compartir</strong> de la barra inferior.
        </li>
        <li className="flex items-center gap-3">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
            <SquarePlus className="size-4" aria-hidden="true" />
          </span>
          Elegí <strong>Agregar a pantalla de inicio</strong> y abrí Kcalma desde ese ícono.
        </li>
      </ol>
    </Card>
  )
}

interface RemindersContentProps {
  data: ReminderSettings
}

function RemindersContent({ data }: RemindersContentProps) {
  const updateSettings = useUpdateReminderSettings()
  const subscribe = usePushSubscribe()
  const unsubscribe = usePushUnsubscribe()
  const testPush = useSendTestPush()
  const { showToast } = useToast()
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Master toggle: stays disabled for its whole flow (permission + subscribe/unsubscribe + the
  // settings PUT below), so a second tap can't overlap one still in flight.
  const busy = updateSettings.isPending || subscribe.isPending || unsubscribe.isPending
  // Sub-settings (meal/water/weigh-in rows): useUpdateReminderSettings now serializes its PUTs
  // (see its `scope`), so firing another one while an earlier one is still in flight is safe —
  // only subscribe/unsubscribe need to gate these, not every in-flight settings PUT.
  const subSettingsDisabled = !data.enabled || subscribe.isPending || unsubscribe.isPending

  const persist = (next: ReminderSettings) => updateSettings.mutateAsync(next)

  /** Master toggle — runs inside the tap handler on purpose: iOS only honors
   *  `Notification.requestPermission()` reliably when it's called without an unrelated await in
   *  front of it, so permission is requested first, before the public key fetch or subscribe. */
  const handleMasterToggle = async (nextEnabled: boolean) => {
    setPermissionError(null)

    if (!nextEnabled) {
      try {
        await unsubscribe.mutateAsync()
      } catch {
        // Best-effort: still record the "off" preference server-side even if the browser-side
        // unsubscribe/DELETE failed (e.g. the subscription was already gone).
      }
      await persist({ ...data, enabled: false })
      return
    }

    if (!isPushSupported()) {
      setPermissionError('Tu navegador no soporta notificaciones push.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setPermissionError(
        permission === 'denied'
          ? 'Las notificaciones están bloqueadas para Kcalma. Para activarlas: Ajustes > Kcalma > Notificaciones, en tu iPhone.'
          : 'No se activaron los recordatorios.',
      )
      return
    }

    try {
      await subscribe.mutateAsync()
      await persist({ ...data, enabled: true })
    } catch {
      setPermissionError('No se pudo activar. Intentá de nuevo.')
    }
  }

  /** Every sub-setting change below persists immediately (optimistic — see useUpdateReminderSettings).
   *  `persist` already rolls the visible state back on failure; this only adds the toast, and
   *  doing so is what keeps the rejection from surfacing as an unhandled promise rejection. */
  const onPersistError = () => showToast({ message: 'No se pudo guardar el cambio.' })

  const updateMeal = (meal: ReminderMealType, patch: Partial<ReminderSettings['meals'][ReminderMealType]>) => {
    persist({ ...data, meals: { ...data.meals, [meal]: { ...data.meals[meal], ...patch } } }).catch(onPersistError)
  }

  const updateWater = (patch: Partial<ReminderSettings['water']>) => {
    persist({ ...data, water: { ...data.water, ...patch } }).catch(onPersistError)
  }

  const updateWeighIn = (patch: Partial<ReminderSettings['weighIn']>) => {
    persist({ ...data, weighIn: { ...data.weighIn, ...patch } }).catch(onPersistError)
  }

  const handleTestPush = async () => {
    try {
      await testPush.mutateAsync()
      showToast({ message: 'Notificación de prueba enviada.' })
    } catch (error) {
      showToast({ message: error instanceof Error ? error.message : 'No se pudo enviar la prueba.' })
    }
  }

  return (
    <Card>
      <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        <Bell className="size-4" aria-hidden="true" />
        Recordatorios
      </p>

      {permissionError && (
        <Banner tone="warning" className="mt-3">
          {permissionError}
        </Banner>
      )}

      <Switch
        checked={data.enabled}
        onChange={(next) => void handleMasterToggle(next)}
        disabled={busy}
        label="Activar recordatorios"
        description="Avisos de comidas, agua y control de peso en este dispositivo."
        className="mt-2"
      />

      <div className="mt-1 border-t border-hairline pt-1">
        <p className="pt-3 pb-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">Comidas</p>
        {REMINDER_MEAL_ORDER.map((meal) => (
          <div key={meal} className="flex items-center gap-3 border-b border-hairline last:border-none">
            <Switch
              checked={data.meals[meal].enabled}
              onChange={(next) => updateMeal(meal, { enabled: next })}
              disabled={subSettingsDisabled}
              label={REMINDER_MEAL_LABELS[meal]}
              className="flex-1"
            />
            <ReminderTimeInput
              aria-label={`Hora de ${REMINDER_MEAL_LABELS[meal]}`}
              value={data.meals[meal].time}
              disabled={subSettingsDisabled}
              onChange={(time) => updateMeal(meal, { time })}
              containerClassName="w-28 shrink-0"
            />
          </div>
        ))}

        <p className="pt-3 pb-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">Agua</p>
        <Switch
          checked={data.water.enabled}
          onChange={(next) => updateWater({ enabled: next })}
          disabled={subSettingsDisabled}
          label="Recordatorio de agua"
          description={`Entre las ${data.water.from} y las ${data.water.to}`}
        />
        <div className="flex flex-wrap items-center gap-3 border-b border-hairline pb-3">
          <HoursStepper
            value={data.water.everyHours}
            onChange={(everyHours) => updateWater({ everyHours })}
            disabled={subSettingsDisabled || !data.water.enabled}
          />
          <ReminderTimeInput
            label="Desde"
            value={data.water.from}
            disabled={subSettingsDisabled || !data.water.enabled}
            onChange={(from) => updateWater({ from })}
            containerClassName="w-28"
          />
          <ReminderTimeInput
            label="Hasta"
            value={data.water.to}
            disabled={subSettingsDisabled || !data.water.enabled}
            onChange={(to) => updateWater({ to })}
            containerClassName="w-28"
          />
        </div>

        <p className="pt-3 pb-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">Control de peso</p>
        <Switch
          checked={data.weighIn.enabled}
          onChange={(next) => updateWeighIn({ enabled: next })}
          disabled={subSettingsDisabled}
          label="Recordatorio de peso"
        />
        <div className="flex flex-wrap items-center gap-3 pb-1">
          <WeekdayPicker
            value={data.weighIn.days}
            onChange={(days) => updateWeighIn({ days })}
            disabled={subSettingsDisabled || !data.weighIn.enabled}
          />
          <ReminderTimeInput
            aria-label="Hora de control de peso"
            value={data.weighIn.time}
            disabled={subSettingsDisabled || !data.weighIn.enabled}
            onChange={(time) => updateWeighIn({ time })}
            containerClassName="w-28"
          />
        </div>
      </div>

      <Button
        variant="secondary"
        icon={<Send className="size-5" aria-hidden="true" />}
        disabled={!data.enabled}
        loading={testPush.isPending}
        onClick={() => void handleTestPush()}
        className="mt-3"
      >
        Enviar notificación de prueba
      </Button>
    </Card>
  )
}

function RemindersLoader() {
  const { data, isPending } = useReminderSettings()

  // CRITICAL: the backend for this sprint deploys independently. Until its /api/reminders and
  // /api/push/* routes exist, the initial fetch 404/405/500s with no cached data yet — hide the
  // whole section rather than show a broken toggle or an error banner (see the sprint's deploy
  // rule). Deliberately NOT checking `isError` here: once data has loaded once, a later failed
  // background refetch must not hide an otherwise-healthy section.
  if (isPending || !data) return null

  return <RemindersContent data={data} />
}

/** "Perfil" → Recordatorios. Lazy-loaded from ProfilePage (see its import) so this entire
 *  feature — including the query/mutation hooks and the extra icons above — stays out of the
 *  main bundle for everyone who never opens the section. */
export function RemindersSection() {
  if (!isStandalonePwa()) {
    return <InstallInstructions />
  }

  return <RemindersLoader />
}
