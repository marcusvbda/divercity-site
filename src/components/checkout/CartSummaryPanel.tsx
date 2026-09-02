'use client'

import { AlertCircle, Loader2, ShoppingBag, Sparkles } from 'lucide-react'
import type { UseMutationResult } from '@tanstack/react-query'

import type { QuoteResponse } from './types'
import { currency, formatAge } from './utils'

export default function CartSummaryPanel({
  quoteMutation,
}: {
  quoteMutation: Pick<
    UseMutationResult<QuoteResponse, Error, never>,
    'data' | 'isPending' | 'isError' | 'error' | 'isIdle'
  >
}) {
  const { data, isPending, isError, error, isIdle } = quoteMutation

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="font-heading flex items-center gap-2 text-base font-bold text-gray-800">
        <ShoppingBag size={18} className="text-brand-pink" />
        Resumo da compra
      </h3>

      {isIdle && !data && (
        <p className="font-body text-sm text-gray-400">
          Preencha os dados das crianças para ver o valor calculado.
        </p>
      )}

      {isPending && (
        <div className="flex items-center gap-2 py-4 text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="font-body text-sm">Calculando valores...</span>
        </div>
      )}

      {isError && (
        <div className="font-body flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-600">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error instanceof Error ? error.message : 'Não foi possível calcular o valor.'}</span>
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-3">
          {data.children.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.children.map((child, idx) => {
                const hasDiscount = child.isPNE || child.ageMonths < 12
                return (
                  <div key={`quote-child-${idx}`} className="flex flex-col gap-0.5 border-b border-gray-100 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body truncate text-sm font-medium text-gray-700">
                        {child.name || `Criança ${idx + 1}`}
                      </span>
                      <span className="font-body text-sm font-semibold text-gray-800">
                        {currency(child.unitPrice)}
                      </span>
                    </div>
                    <div className="font-body flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                      <span>{child.passportTypeName}</span>
                      <span>· {formatAge(child.ageMonths)}</span>
                      {hasDiscount && (
                        <span className="text-brand-purple inline-flex items-center gap-0.5 font-semibold">
                          <Sparkles size={10} /> 50% off
                        </span>
                      )}
                      {child.hasCompanion === true && <span>· com acompanhante gratuito</span>}
                      {child.hasCompanion === false && <span>· sem acompanhante</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {data.companions.length > 0 && (
            <div className="flex flex-col gap-2">
              {data.companions.map((companion, idx) => (
                <div key={`quote-companion-${idx}`} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-body truncate text-sm font-medium text-gray-700">
                      {companion.name || `Acompanhante ${idx + 1}`}
                    </span>
                    {companion.passportTypeName && (
                      <span className="font-body text-[11px] text-gray-400">{companion.passportTypeName}</span>
                    )}
                  </div>
                  <span
                    className={
                      companion.isFree
                        ? 'font-body text-xs font-semibold text-brand-lime'
                        : 'font-body text-sm font-semibold text-gray-800'
                    }
                  >
                    {companion.isFree ? 'Gratuito' : currency(companion.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-heading text-base font-bold text-gray-800">Total</span>
            <span className="font-heading text-brand-pink text-2xl font-bold">{currency(data.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
