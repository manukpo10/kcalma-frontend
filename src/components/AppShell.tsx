import { Outlet } from 'react-router'
import { BottomTabBar } from './BottomTabBar'

/** Layout for the tabbed section of the app ("Hoy" / "Perfil") — renders the active tab + the fixed tab bar. */
export function AppShell() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  )
}
