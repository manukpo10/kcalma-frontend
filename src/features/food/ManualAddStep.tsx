import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Banner } from '../../components/ui/Banner'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { MealTypePicker } from './MealTypePicker'
import { manualAddSchema, type ManualAddFormValues } from './manualAddSchema'
import { mealTypeForNow } from './labels'
import type { FoodEntryRequest, MealType } from './types'

interface ManualAddStepProps {
  entryDate: string
  onSubmit: (entry: FoodEntryRequest) => void
  saving: boolean
  saveError: string | null
}

/** Simple manual add: name, grams, and kcal/macros per 100 g — fiber/sugar/sodium default to 0. */
export function ManualAddStep({ entryDate, onSubmit, saving, saveError }: ManualAddStepProps) {
  const [mealType, setMealType] = useState<MealType>(() => mealTypeForNow())
  const [showDetails, setShowDetails] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualAddFormValues>({ resolver: zodResolver(manualAddSchema) })

  const submit = (values: ManualAddFormValues) => {
    onSubmit({
      entryDate,
      mealType,
      name: values.name,
      grams: Number(values.grams),
      kcalPer100: Number(values.kcalPer100),
      proteinPer100: Number(values.proteinPer100),
      fatPer100: Number(values.fatPer100),
      carbsPer100: Number(values.carbsPer100),
      fiberPer100: Number(values.fiberPer100 || 0),
      sugarPer100: Number(values.sugarPer100 || 0),
      sodiumMgPer100: Number(values.sodiumMgPer100 || 0),
      source: 'MANUAL',
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Comida</p>
        <MealTypePicker value={mealType} onChange={setMealType} />
      </div>

      <Input label="Nombre" placeholder="Ensalada de lentejas" error={errors.name?.message} {...register('name')} />

      <Input
        label="Gramos"
        type="text"
        inputMode="decimal"
        placeholder="200"
        trailing={<span className="text-sm font-medium text-ink-muted">g</span>}
        error={errors.grams?.message}
        {...register('grams')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Calorías / 100 g"
          type="text"
          inputMode="decimal"
          placeholder="150"
          error={errors.kcalPer100?.message}
          {...register('kcalPer100')}
        />
        <Input
          label="Proteína / 100 g"
          type="text"
          inputMode="decimal"
          placeholder="8"
          trailing={<span className="text-sm font-medium text-ink-muted">g</span>}
          error={errors.proteinPer100?.message}
          {...register('proteinPer100')}
        />
        <Input
          label="Grasas / 100 g"
          type="text"
          inputMode="decimal"
          placeholder="5"
          trailing={<span className="text-sm font-medium text-ink-muted">g</span>}
          error={errors.fatPer100?.message}
          {...register('fatPer100')}
        />
        <Input
          label="Carbohidratos / 100 g"
          type="text"
          inputMode="decimal"
          placeholder="18"
          trailing={<span className="text-sm font-medium text-ink-muted">g</span>}
          error={errors.carbsPer100?.message}
          {...register('carbsPer100')}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((show) => !show)}
        className="text-sm font-medium text-primary-300 underline-offset-2 hover:underline"
      >
        {showDetails ? 'Ocultar detalles' : 'Agregar fibra, azúcar y sodio (opcional)'}
      </button>

      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Fibra / 100 g"
            type="text"
            inputMode="decimal"
            placeholder="0"
            error={errors.fiberPer100?.message}
            {...register('fiberPer100')}
          />
          <Input
            label="Azúcar / 100 g"
            type="text"
            inputMode="decimal"
            placeholder="0"
            error={errors.sugarPer100?.message}
            {...register('sugarPer100')}
          />
          <Input
            label="Sodio / 100 g"
            type="text"
            inputMode="decimal"
            placeholder="0"
            trailing={<span className="text-xs font-medium text-ink-muted">mg</span>}
            error={errors.sodiumMgPer100?.message}
            {...register('sodiumMgPer100')}
          />
        </div>
      )}

      {saveError && <Banner tone="danger">{saveError}</Banner>}

      <Button type="submit" size="lg" loading={saving}>
        {saving ? 'Guardando...' : 'Agregar'}
      </Button>
    </form>
  )
}
