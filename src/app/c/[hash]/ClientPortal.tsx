'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contract, Party } from '@/types/parties'
import { buildDefaultValues, isDefaultVariable } from '@/lib/contract-defaults'
import { ContractPreview } from '@/components/ui/contract-preview'

type Props = { hash: string }

export function ClientPortal({ hash }: Props) {
  const [step, setStep] = useState(1)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const {
    data: contract,
    isLoading,
    error,
  } = useQuery<Contract>({
    queryKey: ['client', 'contract', hash],
    queryFn: () =>
      fetch(`/api/client/contract/${hash}`).then(async (r) => {
        if (!r.ok) throw new Error('not_found')
        return r.json()
      }),
    retry: false,
  })

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, string>) =>
      fetch(`/api/client/contract/${hash}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldValues: values }),
      }).then((r) => r.json()),
  })

  // Derived values computed unconditionally (safe before hooks)
  const existingValues = (contract?.fieldValues as Record<string, string>) ?? {}
  const contractParty = (contract as Contract & { party?: Party & { contractTemplate?: { variables?: string[]; body?: string } } })?.party
  const template = contractParty?.contractTemplate
  const defaultValues = contractParty ? buildDefaultValues(contractParty as unknown as Parameters<typeof buildDefaultValues>[0]) : {}
  const mergedValues = { ...defaultValues, ...existingValues }

  const allVars: string[] = (template?.variables ?? Object.keys(existingValues)).filter(v => !isDefaultVariable(v))
  const unfilledVars = allVars.filter((v) => !existingValues[v])

  // ALL hooks must be before early returns — skip step 1 if all variables are already filled
  useEffect(() => {
    if (!contract || isLoading) return
    if (step === 1 && unfilledVars.length === 0) setStep(2)
  }, [step, unfilledVars.length, contract, isLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    )
  }

  if (error || !contract || !contract.clientLinkOpen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Link Indisponível</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Este link está indisponível no momento. Por favor, entre em contato com o Divercity
            Park.
          </p>
        </div>
      </div>
    )
  }

  if (contract.status === 'signed') {
    const renderedBody = renderBody(contract.body, mergedValues)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20">
          <p className="font-semibold text-green-700 dark:text-green-400">Contrato assinado</p>
        </div>
        <ContractPreview html={renderedBody} />
      </div>
    )
  }

  if (step === 1) {
    if (unfilledVars.length === 0) return null

    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-8">
          <div className="text-muted-foreground mb-2 text-xs">Passo 1 de 3</div>
          <h1 className="text-xl font-bold">Preencha seus dados</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Complete as informações do seu contrato.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {unfilledVars.map((variable) => (
            <div key={variable} className="flex flex-col gap-1.5">
              <Label>{variable.replace(/_/g, ' ')}</Label>
              <Input
                value={fieldValues[variable] ?? ''}
                onChange={(e) =>
                  setFieldValues((prev) => ({ ...prev, [variable]: e.target.value }))
                }
                placeholder={`Seu ${variable.replace(/_/g, ' ')}...`}
              />
            </div>
          ))}

          <Button
            className="mt-2"
            onClick={() => {
              saveMutation.mutate(
                { ...existingValues, ...fieldValues },
                { onSuccess: () => setStep(2) },
              )
            }}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Salvando...' : 'Continuar'}
          </Button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    const renderedBody = renderBody(contract.body, { ...mergedValues, ...fieldValues })

    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <div className="text-muted-foreground mb-2 text-xs">Passo 2 de 3</div>
          <h1 className="text-xl font-bold">Revise seu contrato</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Leia o contrato antes de prosseguir.
          </p>
        </div>

        <div className="mb-6 rounded-lg border p-6">
          <ContractPreview html={renderedBody} />
        </div>

        <div className="flex gap-3">
          {unfilledVars.length > 0 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Voltar
            </Button>
          )}
          <Button onClick={() => setStep(3)}>Continuar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8">
        <div className="text-muted-foreground mb-2 text-xs">Passo 3 de 3</div>
        <h1 className="text-xl font-bold">Assinatura digital</h1>
      </div>
      <div className="rounded-lg border-2 border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">Assinatura digital em breve.</p>
        <p className="text-muted-foreground mt-2 text-xs">
          Entre em contato com o Divercity Park para finalizar o contrato.
        </p>
      </div>
      <Button variant="outline" className="mt-4" onClick={() => setStep(2)}>
        Voltar
      </Button>
    </div>
  )
}

function renderBody(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (values[key]) return values[key]
    if (key.startsWith('cliente_') || key.startsWith('festa_')) return ''
    return `<span class="bg-amber-100 text-amber-700 rounded px-1 font-mono text-xs">${match}</span>`
  })
}
