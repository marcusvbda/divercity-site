'use client'

import { BlocksIcon, ArrowRightIcon } from 'lucide-react'

const features = [
  {
    href: '/admin/cms',
    icon: BlocksIcon,
    label: 'Acessar CMS',
    title: 'Gerenciador de Conteúdo',
    desc: 'Edite textos, imagens e informações de todas as seções do site — Hero, Atrações, Festas, Preços, Contato e mais.',
    accent: 'from-brand-cyan to-brand-purple',
    iconBg: 'bg-brand-cyan/15',
    iconColor: 'text-brand-cyan',
  },
]

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
    <div className="flex flex-col gap-8 p-6 md:p-8">
      {/* Welcome header */}
      <div className="from-brand-cyan via-brand-purple to-brand-pink relative overflow-hidden rounded-2xl bg-linear-to-br p-8 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/70 capitalize">
            {today}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {greeting}, {userName}! 👋
          </h1>
          <p className="mt-2 max-w-md text-white/80">
            Bem-vindo ao painel de administração do Divercity Park. Gerencie o
            conteúdo do site e controle o cache em um só lugar.
          </p>
        </div>
        <div className="absolute -top-10 -right-10 size-56 rounded-full bg-white/10" />
        <div className="absolute right-20 -bottom-14 size-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 bottom-4 size-24 rounded-full bg-white/8" />
      </div>

      {/* Features */}
      <section>
        <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
          Funcionalidades
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <a
                key={f.href + f.title}
                href={f.href}
                className="group bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* subtle gradient accent strip at top */}
                <div
                  className={`absolute inset-x-0 top-0 h-0.5 bg-linear-to-r ${f.accent}`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${f.iconBg}`}
                  >
                    <Icon className={`size-5 ${f.iconColor}`} />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full bg-linear-to-r ${f.accent} px-3 py-1 text-xs font-semibold text-white opacity-90`}
                  >
                    {f.label}
                    <ArrowRightIcon className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
