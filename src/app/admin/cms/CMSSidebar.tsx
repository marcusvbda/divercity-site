'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboardIcon, ComponentIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavSkeleton } from '@/components/ui/nav-skeleton'

const topItems = [
  {
    title: 'Visão Geral',
    href: '/admin/cms',
    icon: LayoutDashboardIcon,
    exact: true,
  },
]

type ContentType = { id: number; name: string }

export function CMSSidebar() {
  const pathname = usePathname()

  const { data: contentTypes = [], isLoading } = useQuery<ContentType[]>({
    queryKey: ['admin', 'content-types', 'sidebar'],
    queryFn: () =>
      fetch('/api/admin/content-types?limit=100&sort=name&editable=true')
        .then((r) => r.json())
        .then((d) => d.data ?? []),
  })

  const navItem = (
    href: string,
    title: string,
    icon: React.ElementType,
    exact: boolean,
    mobile?: boolean
  ) => {
    const Icon = icon
    const isActive = exact ? pathname === href : pathname.startsWith(href)
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          mobile ? 'whitespace-nowrap' : 'w-full',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
        )}
      >
        <Icon className="size-4 shrink-0" />
        {title}
      </Link>
    )
  }

  return (
    <>
      {/* Desktop: vertical sidebar — scroll interno */}
      <aside className="bg-sidebar hidden w-52 shrink-0 flex-col overflow-y-auto border-r md:flex">
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            CMS
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {topItems.map((item) =>
            navItem(item.href, item.title, item.icon, item.exact)
          )}
        </nav>

        <div className="mx-4 border-t" />
        <div className="px-4 py-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Tipos de components
          </p>
        </div>
        <nav className="flex flex-col gap-0.5 px-2 pb-4">
          {isLoading ? (
            <NavSkeleton count={5} className="mx-1 h-8" varyWidth />
          ) : (
            contentTypes.map((ct) =>
              navItem(
                `/admin/cms/component-types/${ct.id}`,
                ct.name,
                ComponentIcon,
                false
              )
            )
          )}
        </nav>
      </aside>

      {/* Mobile: topbar com scroll horizontal */}
      <nav className="bg-sidebar flex shrink-0 overflow-x-auto border-b md:hidden">
        {topItems.map((item) => {
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
        {isLoading ? (
          <NavSkeleton count={3} className="mx-2 my-auto h-5 w-16 rounded" />
        ) : (
          contentTypes.map((ct) => {
            const href = `/admin/cms/component-types/${ct.id}`
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={ct.id}
                href={href}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'border-brand-cyan text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-transparent'
                )}
              >
                <ComponentIcon className="size-4" />
                {ct.name}
              </Link>
            )
          })
        )}
      </nav>
    </>
  )
}
