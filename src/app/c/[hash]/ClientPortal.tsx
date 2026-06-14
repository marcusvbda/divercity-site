'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contract, Party } from '@/types/parties'
import { buildDefaultValues, isDefaultVariable } from '@/lib/contract-defaults'
import { ContractPreview } from '@/components/ui/contract-preview'

type Props = { hash: string }

export function ClientPortal({ hash }: Props) {
  const searchParams = useSearchParams()
  const dsEvent = searchParams.get('ds_event')

  const [step, setStep] = useState(dsEvent === 'signing_complete' ? 4 : 1)
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

  const signMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/client/contract/${hash}/sign`, { method: 'POST' }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? 'Erro ao iniciar assinatura')
        return r.json() as Promise<{ url: string }>
      }),
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })

  // Derived values computed unconditionally (safe before hooks)
  const existingValues = (contract?.fieldValues as Record<string, string>) ?? {}
  const contractParty = (contract as Contract & { party?: Party & { contractTemplate?: { variables?: string[]; body?: string } } })?.party
  const template = contractParty?.contractTemplate
  const defaultValues = contractParty ? buildDefaultValues(contractParty as unknown as Parameters<typeof buildDefaultValues>[0]) : {}
  const mergedValues = { ...defaultValues, ...existingValues }

  const allVars: string[] = (template?.variables ?? Object.keys(existingValues)).filter(v => !isDefaultVariable(v))
  const unfilledVars = allVars.filter((v) => !existingValues[v])

  const completeMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/client/contract/${hash}/complete`, { method: 'POST' }).then((r) => r.json()),
  })

  // ALL hooks must be before early returns — skip step 1 if all variables are already filled
  useEffect(() => {
    if (!contract || isLoading) return
    if (step === 1 && unfilledVars.length === 0) setStep(2)
  }, [step, unfilledVars.length, contract, isLoading])

  // Quando volta do DocuSign, confirma assinatura e atualiza contrato + festa
  useEffect(() => {
    if (dsEvent === 'signing_complete') {
      completeMutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (step === 4) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Contrato assinado!</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Recebemos sua assinatura. Nossa equipe irá revisar e confirmar sua festa em breve.
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Em caso de dúvidas, entre em contato com o Divercity Park.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8">
        <div className="text-muted-foreground mb-2 text-xs">Passo 3 de 3</div>
        <h1 className="text-xl font-bold">Assinar contrato</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Assine digitalmente para confirmar o seu contrato.
        </p>
      </div>

      <div className="mb-6 rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">Assinatura segura via DocuSign</p>
            <p className="text-muted-foreground text-xs">
              Você será redirecionado para assinar o contrato digitalmente.
            </p>
          </div>
        </div>
        <ul className="text-muted-foreground space-y-1.5 text-xs">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
            Assinatura com validade jurídica
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
            Processo 100% digital, sem papel
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
            Cópia enviada por e-mail após assinatura
          </li>
        </ul>
      </div>

      {signMutation.error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          {(signMutation.error as Error).message}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)}>
          Voltar
        </Button>
        <Button onClick={() => signMutation.mutate()} disabled={signMutation.isPending} className="flex-1">
          {signMutation.isPending ? 'Abrindo DocuSign...' : 'Assinar contrato'}
        </Button>
      </div>
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
