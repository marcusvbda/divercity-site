import type { LucideIcon } from 'lucide-react'
import {
  BlocksIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  PartyPopperIcon,
  QrCodeIcon,
  Settings2Icon,
  TagIcon,
  UsersIcon,
} from 'lucide-react'

export type MenuLeafSubItem = {
  label: string
  href: string
  activePath?: string
  exact?: boolean
  badge?: string
}

export type MenuSubItem = MenuLeafSubItem

export type MenuItem = {
  icon: LucideIcon
  label: string
  badge?: string
} & (
  | {
      href: string
      activePath?: string
      exact?: boolean
      target?: '_blank'
      childItems?: never
    }
  | {
      href?: never
      childItems: MenuSubItem[]
    }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

export type ContentTypeNavEntry = { id: number; name: string }

const operationItem: MenuItem = {
  icon: QrCodeIcon,
  label: 'Operação',
  childItems: [
    { label: 'Visão geral', href: '/admin/operacao', exact: true },
    {
      label: 'Validar ticket',
      href: '/admin/operacao/validar',
      activePath: '/admin/operacao/validar',
    },
    {
      label: 'Ingressos',
      href: '/admin/operacao/ingressos',
      activePath: '/admin/operacao/ingressos',
    },
  ],
}

const viewSiteItem: MenuItem = {
  icon: ExternalLinkIcon,
  label: 'Ver site',
  href: '/',
  target: '_blank',
}

export function getNavItems({
  role,
  contentTypes,
  pendingPartiesCount,
}: {
  role?: string
  contentTypes: ContentTypeNavEntry[]
  pendingPartiesCount?: number
}): NavItem[] {
  if (role === 'operator') {
    return [{ items: [viewSiteItem, operationItem] }]
  }

  return [
    {
      items: [
        viewSiteItem,
        {
          icon: LayoutDashboardIcon,
          label: 'Dashboard',
          href: '/admin',
          exact: true,
        },
        {
          icon: BlocksIcon,
          label: 'CMS',
          childItems: [
            { label: 'Cache', href: '/admin/cms', exact: true },
            ...contentTypes.map((contentType) => ({
              label: contentType.name,
              href: `/admin/cms/component-types/${contentType.id}`,
              exact: true,
            })),
          ],
        },
        {
          icon: UsersIcon,
          label: 'Clientes',
          href: '/admin/customers',
          activePath: '/admin/customers',
        },
        {
          icon: PartyPopperIcon,
          label: 'Salão de Festas',
          badge:
            pendingPartiesCount && pendingPartiesCount > 0
              ? String(pendingPartiesCount)
              : undefined,
          childItems: [
            {
              label: 'Agenda',
              href: '/admin/parties',
              activePath: '/admin/parties',
            },
            {
              label: 'Modelos de contrato',
              href: '/admin/contract-templates',
              activePath: '/admin/contract-templates',
            },
          ],
        },
        {
          icon: TagIcon,
          label: 'Preços',
          href: '/admin/services',
          activePath: '/admin/services',
        },
        operationItem,
        {
          icon: Settings2Icon,
          label: 'Configurações',
          childItems: [
            {
              label: 'Integrações',
              href: '/admin/settings',
              activePath: '/admin/settings',
              exact: true,
            },
            {
              label: 'Features',
              href: '/admin/settings/features',
              activePath: '/admin/settings/features',
            },
            {
              label: 'API tokens',
              href: '/admin/settings/api-tokens',
              activePath: '/admin/settings/api-tokens',
            },
          ],
        },
      ],
    },
  ]
}
