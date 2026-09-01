'use client'

import * as React from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  BlocksIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  PartyPopperIcon,
  Settings2Icon,
  SparklesIcon,
  TagIcon,
  UsersIcon,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  logoUrl?: string
}

export function AppSidebar({ logoUrl, ...props }: AppSidebarProps) {
  const { data: pendingPartiesCount } = useQuery({
    queryKey: ['admin', 'parties', 'pending-count'],
    queryFn: () =>
      fetch('/api/admin/parties?status=pending&perPage=1').then(
        async (r) => {
          if (!r.ok) throw new Error('failed to fetch pending parties count')
          const json = await r.json()
          return json.pagination.total as number
        },
      ),
  })

  const navMain = [
    { title: 'Ver site', url: '/', icon: <ExternalLinkIcon />, target: '_blank' },
    { title: 'Dashboard', url: '/admin', icon: <LayoutDashboardIcon /> },
    { title: 'CMS', url: '/admin/cms', icon: <BlocksIcon /> },
    { title: 'Clientes', url: '/admin/customers', icon: <UsersIcon /> },
    {
      title: 'Salão de Festas',
      url: '/admin/parties',
      icon: <PartyPopperIcon />,
      badge: pendingPartiesCount,
    },
    { title: 'Preços e Serviços', url: '/admin/services', icon: <TagIcon /> },
    { title: 'Configurações', url: '/admin/settings', icon: <Settings2Icon /> },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="flex h-auto items-center justify-center !px-4 data-[slot=sidebar-menu-button]:p-2!"
              render={<a href="/admin" />}
            >
              {logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Divercity Park"
                    className="w-full md:w-10/12"
                  />
                </>
              ) : (
                <>
                  <SparklesIcon className="size-5! text-pink-500" />
                  <span className="text-base font-semibold">
                    Divercity Park
                  </span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
