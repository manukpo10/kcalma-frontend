import { Database, ShieldCheck, Sparkles, UserCog } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Card } from '../../components/ui/Card'
import { Screen } from '../../components/ui/Screen'

/** Public page — linked from /registro's checkbox. Plain-language summary of what Kcalma stores
 *  and why; not a substitute for Supabase's/Google's own terms, just an honest short version. */
export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <Screen title="Privacidad" onBack={() => navigate(-1)}>
      <div className="space-y-4 pb-6">
        <Card>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <Database className="size-4" aria-hidden="true" />
            Qué guardamos
          </p>
          <p className="text-sm text-ink">
            Tu perfil (objetivos y datos físicos), las comidas que registrás, tu peso, tus medidas
            corporales, tu consumo de agua y tus recordatorios. Todo se guarda en Supabase, con
            servidores ubicados en Estados Unidos.
          </p>
        </Card>

        <Card>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <Sparkles className="size-4" aria-hidden="true" />
            Análisis con inteligencia artificial
          </p>
          <p className="text-sm text-ink">
            Cuando analizás una foto o una descripción de comida, la enviamos a la capa gratuita de
            Google Gemini para reconocer los alimentos. En ese nivel gratuito, Google puede usar
            ese contenido para mejorar sus servicios. Por eso, evitá subir fotos con personas
            identificables o información sensible.
          </p>
        </Card>

        <Card>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <ShieldCheck className="size-4" aria-hidden="true" />
            No vendemos tus datos
          </p>
          <p className="text-sm text-ink">
            No vendemos ni compartimos tu información con terceros con fines comerciales.
          </p>
        </Card>

        <Card>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted uppercase">
            <UserCog className="size-4" aria-hidden="true" />
            Tus datos, tu decisión
          </p>
          <p className="text-sm text-ink">
            Desde Perfil podés exportar toda tu información en formato JSON o CSV, o eliminar tu
            cuenta de forma permanente junto con todos tus datos.
          </p>
        </Card>
      </div>
    </Screen>
  )
}
