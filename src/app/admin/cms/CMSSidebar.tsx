'use client'

import { useQuery } from '@tanstack/react-query'
import { LayoutDashboardIcon, ComponentIcon } from 'lucide-react'
import { AdminSubSidebar } from '@/components/ui/admin-sub-sidebar'

type ContentType = { id: number; name: string }

export function CMSSidebar() {
  const { data: contentTypes = [], isLoading } = useQuery<ContentType[]>({
    queryKey: ['admin', 'content-types', 'sidebar'],
    queryFn: () =>
      fetch('/api/admin/content-types?limit=100&sort=name&editable=true')
        .then((r) => r.json())
        .then((d) => d.data ?? []),
  })

  return (
    <AdminSubSidebar
      sections={[
        {
          label: 'CMS',
          items: [
            {
              title: 'Visão Geral',
              href: '/admin/cms',
              icon: LayoutDashboardIcon,
              exact: true,
            },
          ],
        },
        {
          label: 'Tipos de componentes',
          items: contentTypes.map((ct) => ({
            href: `/admin/cms/component-types/${ct.id}`,
            title: ct.name,
            icon: ComponentIcon,
            exact: false,
          })),
          isLoading,
          skeletonCount: 5,
        },
      ]}
    />
  )
}
