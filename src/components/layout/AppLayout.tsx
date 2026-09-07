import { Outlet } from 'react-router-dom'
import { Sidebar, MobileNav, MobileHeader } from '@/components/layout/Sidebar'
import { AddItemButton } from '@/components/PageHeader'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">
          <Outlet />
        </main>
        <MobileNav />
        {/* Floating Add on mobile */}
        <div className="fixed right-4 bottom-20 z-40 lg:hidden">
          <AddItemButton className="rounded-full px-4 shadow-lg" label="Add" />
        </div>
      </div>
    </div>
  )
}
