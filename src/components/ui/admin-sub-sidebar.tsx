'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NavSkeleton } from '@/components/ui/nav-skeleton'

export type SubSidebarNavItem = {
  href: string
  title: string
  icon: React.ElementType
  exact?: boolean
}

export type SubSidebarSection = {
  label: string
  items: SubSidebarNavItem[]
  isLoading?: boolean
  skeletonCount?: number
  extra?: React.ReactNode
}

export function SubSidebarNavLink({
  href,
  title,
  icon: Icon,
  exact = false,
}: SubSidebarNavItem) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
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

export function AdminSubSidebar({ sections }: { sections: SubSidebarSection[] }) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <aside className="bg-sidebar hidden w-52 shrink-0 flex-col overflow-y-auto border-r md:flex">
        {sections.map((section, i) => (
          <div key={section.label}>
            {i > 0 && <div className="mx-4 border-t" />}
            <div className="px-4 py-3">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {section.label}
              </p>
            </div>
            <nav className="flex flex-col gap-0.5 px-2 pb-4">
              {section.isLoading ? (
                <NavSkeleton
                  count={section.skeletonCount ?? 4}
                  className="mx-1 h-8 bg-gray-300/20"
                  varyWidth
                />
              ) : (
                section.items.map((item) => (
                  <SubSidebarNavLink key={item.href} {...item} />
                ))
              )}
              {section.extra}
            </nav>
          </div>
        ))}
      </aside>

      {/* Mobile: horizontal topbar */}
      <nav className="bg-sidebar flex shrink-0 overflow-x-auto border-b md:hidden">
        {sections.map((section) =>
          section.isLoading ? (
            <NavSkeleton
              key={section.label}
              count={section.skeletonCount ?? 3}
              className="mx-2 my-auto h-5 w-16 rounded"
            />
          ) : (
            section.items.map((item) => {
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
            })
          )
        )}
      </nav>
    </>
  )
}
