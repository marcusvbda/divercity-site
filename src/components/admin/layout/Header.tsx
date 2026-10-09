'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ProfileDropdown } from '@/components/admin/layout/ProfileDropdown'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/admin/ui/breadcrumb'
import { Separator } from '@/components/admin/ui/separator'
import { SidebarTrigger } from '@/components/admin/ui/sidebar'

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Dashboard',
  cms: 'CMS',
  'component-types': 'Tipos de conteúdo',
  customers: 'Clientes',
  services: 'Preços',
  'passport-types': 'Passaportes',
  'contract-templates': 'Modelos de contrato',
  parties: 'Salão de Festas',
  contracts: 'Contratos',
  contract: 'Contrato',
  operacao: 'Operação',
  validar: 'Validar',
  ingressos: 'Ingressos',
  settings: 'Configurações',
  new: 'Novo',
}

const NON_LINKABLE_PATHS = new Set(['/admin/cms/component-types'])

export function Header() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className="bg-card sticky top-0 z-50 border-b">
      <div className="mx-auto flex items-center justify-between gap-6 px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <SidebarTrigger className="[&_svg]:size-5!" />
          <Separator
            orientation="vertical"
            className="hidden h-4! data-vertical:self-center sm:block"
          />
          <Breadcrumb className="hidden min-w-0 sm:block">
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1
                const label =
                  SEGMENT_LABELS[segment] ?? decodeURIComponent(segment)
                const href = '/' + segments.slice(0, index + 1).join('/')

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : NON_LINKABLE_PATHS.has(href) ? (
                        <span>{label}</span>
                      ) : (
                        <Link
                          href={href}
                          className="hover:text-foreground transition-colors"
                        >
                          {label}
                        </Link>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-1.5">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
