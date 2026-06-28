'use client'

import { PlugZapIcon } from 'lucide-react'
import { AdminSubSidebar } from '@/components/ui/admin-sub-sidebar'

export function SettingsSidebar() {
  return (
    <AdminSubSidebar
      sections={[
        {
          label: 'Configurações',
          items: [
            {
              title: 'Integrações',
              href: '/admin/settings',
              icon: PlugZapIcon,
              exact: true,
            },
          ],
        },
      ]}
    />
  )
}
