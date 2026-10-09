'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRightIcon,
  SparklesIcon,
  SquareArrowOutUpRightIcon,
} from 'lucide-react'

import {
  getNavItems,
  type ContentTypeNavEntry,
  type MenuItem,
  type MenuLeafSubItem,
} from '@/components/admin/layout/nav-config'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/admin/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/admin/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/admin/ui/sidebar'
import { cn } from '@/lib/utils'

type LinkTarget = {
  href: string
  activePath?: string
  exact?: boolean
}

function isLinkActive(target: LinkTarget, pathname: string) {
  if (target.href === '/') return false
  if (target.exact) return pathname === target.href
  if (target.activePath) return pathname.startsWith(target.activePath)
  return pathname === target.href
}

function isItemChildActive(item: MenuItem, pathname: string) {
  return (
    item.childItems?.some((child) => isLinkActive(child, pathname)) ?? false
  )
}

function FlyoutMenuLink({
  item,
  isActive,
}: {
  item: MenuLeafSubItem
  isActive: boolean
}) {
  return (
    <DropdownMenuItem
      className={cn(
        'justify-between gap-2',
        isActive && 'bg-primary/10 text-accent-foreground font-medium'
      )}
      render={<Link href={item.href} />}
    >
      <span className="truncate">{item.label}</span>
    </DropdownMenuItem>
  )
}

function FlyoutMenuItem({
  item,
  isChildActive,
  pathname,
}: {
  item: MenuItem
  isChildActive: boolean
  pathname: string
}) {
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              isActive={isChildActive}
              className="data-active:bg-primary/5!"
            />
          }
        >
          <Icon />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <ChevronRightIcon className="ml-auto" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={12}
          className="w-auto min-w-52"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-foreground flex items-center gap-2 text-sm">
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="bg-primary/10 rounded-full px-1.5 text-xs font-normal">
                  {item.badge}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.childItems?.map((child) => (
              <FlyoutMenuLink
                key={child.href}
                item={child}
                isActive={isLinkActive(child, pathname)}
              />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function SidebarGroupedMenuItems({
  data,
  groupLabel,
  pathname,
  isIconMode,
  isBranchOpen,
  setOpenItem,
}: {
  data: MenuItem[]
  groupLabel?: string
  pathname: string
  isIconMode: boolean
  isBranchOpen: (item: MenuItem) => boolean
  setOpenItem: (key: string, open: boolean) => void
}) {
  return (
    <SidebarGroup>
      {groupLabel && (
        <SidebarGroupLabel className="text-sidebar-foreground/50 tracking-wider uppercase">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map((item) => {
            const Icon = item.icon
            const isChildActive = isItemChildActive(item, pathname)

            if (item.childItems && isIconMode) {
              return (
                <FlyoutMenuItem
                  key={item.label}
                  item={item}
                  isChildActive={isChildActive}
                  pathname={pathname}
                />
              )
            }

            if (item.childItems) {
              return (
                <Collapsible
                  className="group/collapsible"
                  key={item.label}
                  open={isBranchOpen(item)}
                  onOpenChange={(open) => setOpenItem(item.label, open)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={isChildActive}
                          className="data-active:bg-primary/5!"
                        />
                      }
                    >
                      <Icon />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate',
                          item.badge && 'pr-14'
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-primary/10 max-w-24 truncate rounded-full px-1.5 font-normal">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-all duration-200 data-ending-style:h-0 data-starting-style:h-0">
                      <SidebarMenuSub>
                        {item.childItems.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              className="data-active:bg-primary/10! justify-between"
                              render={<Link href={child.href} />}
                              isActive={isLinkActive(child, pathname)}
                            >
                              <span className="min-w-0 flex-1 truncate">
                                {child.label}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            const isExternal = item.target === '_blank'

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  render={<Link href={item.href} target={item.target} />}
                  isActive={isLinkActive(item, pathname)}
                  className="data-active:bg-primary/10!"
                >
                  <Icon />
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate',
                      isExternal && 'pr-6'
                    )}
                  >
                    {item.label}
                  </span>
                  {isExternal && (
                    <SquareArrowOutUpRightIcon className="ml-auto size-3.5! shrink-0 opacity-50" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SidebarLayout({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const { status, data: session } = useSession()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const isAdmin = status === 'authenticated' && session?.user?.role === 'admin'

  const { data: contentTypes = [] } = useQuery<ContentTypeNavEntry[]>({
    queryKey: ['admin', 'content-types', 'sidebar'],
    queryFn: async () => {
      const response = await fetch(
        '/api/admin/content-types?limit=100&sort=name&editable=true'
      )
      if (!response.ok) throw new Error('failed to fetch content types')
      const json = await response.json()
      return json.data ?? []
    },
    enabled: isAdmin,
  })

  const { data: pendingPartiesCount } = useQuery({
    queryKey: ['admin', 'parties', 'pending-count'],
    queryFn: async () => {
      const response = await fetch(
        '/api/admin/parties?status=pending&perPage=1'
      )
      if (!response.ok) throw new Error('failed to fetch pending parties count')
      const json = await response.json()
      return json.pagination.total as number
    },
    enabled: isAdmin,
  })

  const navGroups = getNavItems({
    role: session?.user?.role,
    contentTypes,
    pendingPartiesCount,
  })

  const isBranchOpen = (item: MenuItem) =>
    openItems[item.label] ?? isItemChildActive(item, pathname)

  const setOpenItem = (key: string, open: boolean) => {
    setOpenItems((prev) => ({ ...prev, [key]: open }))
  }

  const isIconMode = state === 'collapsed' && !isMobile

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="flex items-center justify-center gap-2.5 bg-transparent!"
              render={<Link href="/admin" />}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt="Divercity Park"
                  className="size-14 w-auto max-w-full object-contain"
                />
              ) : (
                <>
                  <SparklesIcon className="size-5!" />
                  <span className="text-lg font-semibold text-nowrap">
                    Divercity Park
                  </span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:overflow-y-auto">
        {navGroups.map((group, index) => (
          <SidebarGroupedMenuItems
            key={group.groupLabel ?? index}
            data={group.items}
            groupLabel={group.groupLabel}
            pathname={pathname}
            isIconMode={isIconMode}
            isBranchOpen={isBranchOpen}
            setOpenItem={setOpenItem}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
