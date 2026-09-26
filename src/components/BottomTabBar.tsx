import { CalendarDays, LineChart, Plus, Sparkles, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '../lib/cn'

interface TabLinkProps {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

function TabLink({ to, label, icon: Icon, end }: TabLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-xs font-medium transition-colors',
          isActive ? 'text-primary-300' : 'text-ink-muted hover:text-ink active:text-ink',
        )
      }
    >
      <Icon className="size-6" aria-hidden="true" strokeWidth={2} />
      {label}
    </NavLink>
  )
}

/**
 * Fixed bottom navigation on a 5-column grid so the prominent "+" (add flow) is always exactly
 * centered: "Hoy" + "Progreso" on the left, "Ideas" (meal suggestions) + "Perfil" on the right.
 * Pages rendered inside {@link AppShell} must reserve bottom padding (see
 * `TAB_BAR_CLEARANCE_CLASS`) so content never sits underneath this fixed bar.
 */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5 items-center px-2 pt-1">
        <TabLink to="/" label="Hoy" icon={CalendarDays} end />
        <TabLink to="/progreso" label="Progreso" icon={LineChart} />

        <NavLink
          to="/agregar"
          aria-label="Agregar comida"
          className="-mt-7 flex size-16 shrink-0 items-center justify-center justify-self-center rounded-full bg-primary text-primary-fg shadow-lg transition-transform active:scale-95"
        >
          <Plus className="size-8" aria-hidden="true" strokeWidth={2.5} />
        </NavLink>

        <TabLink to="/sugerencias" label="Ideas" icon={Sparkles} />
        <TabLink to="/perfil" label="Perfil" icon={UserRound} />
      </div>
    </nav>
  )
}

/**
 * Height for a spacer element pages inside {@link AppShell} should render as the LAST child of
 * their scrollable content, so the fixed tab bar never covers the last row. A plain spacer beats
 * fighting Screen's own bottom-padding utility for CSS specificity.
 */
export const TAB_BAR_CLEARANCE_CLASS = 'h-24'
