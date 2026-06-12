'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboardIcon, BlocksIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  {
    title: 'Visão Geral',
    href: '/admin/cms',
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    title: 'Tipos de Conteúdo',
    href: '/admin/cms/component-types',
    icon: BlocksIcon,
    exact: false,
  },
]

export function CMSSidebar() {
  const pathname = usePathname()

  const navItem = (item: (typeof items)[number], mobile?: boolean) => {
    const Icon = item.icon
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href)

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          mobile ? 'whitespace-nowrap' : 'w-full',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
        )}
      >
        <Icon className="size-4 shrink-0" />
        {item.title}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside className="bg-sidebar hidden w-52 shrink-0 flex-col border-r md:flex">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            CMS
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {items.map((item) => navItem(item))}
        </nav>
      </aside>

      {/* Mobile: topbar with tab-style underline */}
      <nav className="bg-sidebar flex shrink-0 overflow-x-auto border-b md:hidden">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'border-brand-cyan text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
