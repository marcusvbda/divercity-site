'use client'

import { LayoutDashboardIcon, ListIcon, ScanLineIcon } from 'lucide-react'
import { AdminSubSidebar } from '@/components/ui/admin-sub-sidebar'

export function OperacaoSidebar() {
  return (
    <AdminSubSidebar
      sections={[
        {
          label: 'Operação',
          items: [
            {
              title: 'Visão geral',
              href: '/admin/operacao',
              icon: LayoutDashboardIcon,
              exact: true,
            },
            {
              title: 'Validar ticket',
              href: '/admin/operacao/validar',
              icon: ScanLineIcon,
              exact: false,
            },
            {
              title: 'Ingressos',
              href: '/admin/operacao/ingressos',
              icon: ListIcon,
              exact: true,
            },
          ],
        },
      ]}
    />
  )
}
