import { Lock } from 'lucide-react'

export function OrcamentoNavbarHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-y-1">
      <div className="flex items-center gap-2 md:gap-3">
        <span className="bg-brand-pink h-2 w-2 rotate-45 md:h-2.5 md:w-2.5" />
        <div>
          <p className="font-heading text-sm leading-tight font-bold text-gray-900 md:text-lg">
            Reserva de Festa
          </p>
          <p className="font-body text-[10px] leading-tight text-gray-500 md:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex basis-full items-center justify-end gap-1.5 md:basis-auto md:gap-2">
        <Lock className="h-3 w-3 text-gray-400 md:h-4 md:w-4" />
        <span className="font-body text-[10px] whitespace-nowrap text-gray-500 md:text-sm">
          Ambiente 100% seguro
        </span>
      </div>
    </div>
  )
}
