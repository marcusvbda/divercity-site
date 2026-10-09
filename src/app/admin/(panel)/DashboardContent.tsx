'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRightIcon,
  BellIcon,
  BlocksIcon,
  CheckCircle2Icon,
  PartyPopperIcon,
} from 'lucide-react'
import { Badge } from '@/components/admin/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/admin/ui/card'

function PendingPartiesCard() {
  const { data: count, isLoading } = useQuery({
    queryKey: ['admin', 'parties', 'pending-count'],
    queryFn: () =>
      fetch('/api/admin/parties?status=pending&perPage=1').then(async (r) => {
        if (!r.ok) throw new Error('failed to fetch pending parties count')
        const json = await r.json()
        return json.pagination.total as number
      }),
  })

  const hasPending = !isLoading && (count ?? 0) > 0
  const Icon = hasPending ? BellIcon : PartyPopperIcon

  return (
    <Link
      href={hasPending ? '/admin/parties?status=pending' : '/admin/parties'}
      className="group rounded-xl"
    >
      <Card className="group-hover:bg-muted/50 h-full transition-colors">
        <CardHeader>
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm">
            <Icon className="size-4" />
          </div>
          <CardAction>
            {hasPending ? (
              <Badge>
                {count} pendente{count === 1 ? '' : 's'}
                <ArrowRightIcon />
              </Badge>
            ) : (
              !isLoading && (
                <Badge variant="secondary">
                  <CheckCircle2Icon />
                  Em dia
                </Badge>
              )
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="text-base font-semibold">Reservas de Festas</span>
          <span className="text-muted-foreground text-sm">
            {isLoading
              ? 'Carregando...'
              : hasPending
                ? `${count} reserva${count === 1 ? '' : 's'} nova${count === 1 ? '' : 's'} aguardando contato pelo WhatsApp.`
                : 'Nenhuma reserva pendente no momento.'}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

function CmsCard() {
  return (
    <Link href="/admin/cms" className="group rounded-xl">
      <Card className="group-hover:bg-muted/50 h-full transition-colors">
        <CardHeader>
          <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm">
            <BlocksIcon className="size-4" />
          </div>
          <CardAction>
            <Badge variant="secondary">
              Acessar CMS
              <ArrowRightIcon />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="text-base font-semibold">
            Gerenciador de Conteúdo
          </span>
          <span className="text-muted-foreground text-sm">
            Edite textos, imagens e informações de todas as seções do site —
            Hero, Atrações, Festas, Preços, Contato e mais.
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardContent({ userName }: { userName: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <p className="text-muted-foreground text-sm capitalize">{today}</p>
        <h1 className="text-2xl font-semibold">
          {greeting}, {userName}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Bem-vindo ao painel de administração do Divercity Park. Gerencie o
          conteúdo do site e controle o cache em um só lugar.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <CardDescription className="text-xs font-semibold tracking-wider uppercase">
          Funcionalidades
        </CardDescription>
        <div className="grid gap-4 sm:grid-cols-2">
          <PendingPartiesCard />
          <CmsCard />
        </div>
      </section>
    </div>
  )
}
