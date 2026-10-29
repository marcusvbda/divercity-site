'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { MarkdownField } from '@/components/admin/markdown-field'
import { Alert, AlertDescription } from '@/components/admin/ui/alert'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/admin/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/admin/ui/field'
import { Input } from '@/components/admin/ui/input'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { BOT_CONFIG_MAX_LENGTH } from '@/lib/schemas/bot-config'
import type { BotConfig, BotConfigField } from '@/types/bot-config'

const QUERY_KEY = ['admin', 'bot-config']

const FIELDS: {
  name: Exclude<BotConfigField, 'FERIADOS'>
  label: string
}[] = [
  { name: 'PERSONA_E_REGRAS', label: 'Persona e regras' },
  { name: 'FATOS_DO_PARQUE', label: 'Fatos do parque' },
  { name: 'AVISOS_DE_HOJE', label: 'Avisos de hoje' },
  {
    name: 'MSG_HANDOFF_CLIENTE',
    label: 'Mensagem de handoff ao cliente',
  },
  { name: 'MSG_MIDIA', label: 'Mensagem de mídia' },
  { name: 'MSG_CONFIRMACAO', label: 'Mensagem de confirmação' },
]

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function parseHolidays(value: string): string[] {
  const tokens = value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
  return [...new Set(tokens)].sort()
}

function formatHoliday(token: string) {
  const match = ISO_DATE.exec(token)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : token
}

async function fetchBotConfig(): Promise<BotConfig> {
  const res = await fetch('/api/admin/bot-config')
  if (!res.ok) throw new Error('Failed to load bot config')
  return res.json()
}

async function saveBotConfig(values: BotConfig): Promise<BotConfig> {
  const res = await fetch('/api/admin/bot-config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  if (!res.ok) throw new Error('Failed to save bot config')
  return res.json()
}

function isDirty(values: BotConfig, saved: BotConfig) {
  return (
    FIELDS.some((field) => values[field.name] !== saved[field.name]) ||
    parseHolidays(values.FERIADOS).join(',') !==
      parseHolidays(saved.FERIADOS).join(',')
  )
}

function SaveBar({
  dirty = false,
  pending = false,
  disabled = false,
}: {
  dirty?: boolean
  pending?: boolean
  disabled?: boolean
}) {
  return (
    <div className="bg-card sticky bottom-0 z-10 flex flex-col gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between">
      {dirty ? (
        <p role="status" className="text-muted-foreground text-sm">
          Alterações não salvas
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={disabled || pending}
        className="w-full sm:ml-auto sm:w-auto"
      >
        {pending ? 'Salvando…' : 'Salvar'}
      </Button>
    </div>
  )
}

function BotConfigForm({ initialValues }: { initialValues: BotConfig }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<BotConfig>(initialValues)
  const [saved, setSaved] = useState<BotConfig>(initialValues)
  const [pendingDate, setPendingDate] = useState('')
  const holidays = parseHolidays(values.FERIADOS)

  function setHolidays(next: string[]) {
    setValues((prev) => ({ ...prev, FERIADOS: next.join(',') }))
  }

  function addHoliday() {
    if (!ISO_DATE.test(pendingDate)) return
    setHolidays(parseHolidays([...holidays, pendingDate].join(',')))
    setPendingDate('')
  }

  const dirty = isDirty(values, saved)

  const mutation = useMutation({
    mutationFn: saveBotConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data)
      setSaved(data)
      toast.success('Configurações do bot salvas com sucesso.')
    },
    onError: () =>
      toast.error(
        'Não foi possível salvar as configurações do bot. Tente novamente.'
      ),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ ...values, FERIADOS: holidays.join(',') })
  }

  function renderField(field: (typeof FIELDS)[number]) {
    return (
      <Field key={field.name}>
        <FieldLabel htmlFor={field.name}>
          {field.label}
          <span className="text-muted-foreground font-mono text-xs">
            {field.name}
          </span>
        </FieldLabel>
        <MarkdownField
          id={field.name}
          maxLength={BOT_CONFIG_MAX_LENGTH}
          value={values[field.name]}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, [field.name]: value }))
          }
        />
      </Field>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat bot</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {FIELDS.slice(0, 3).map((field) => renderField(field))}
            <Field>
              <FieldLabel htmlFor="holiday-date">
                Feriados
                <span className="text-muted-foreground font-mono text-xs">
                  FERIADOS
                </span>
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="holiday-date"
                  type="date"
                  value={pendingDate}
                  onChange={(e) => setPendingDate(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addHoliday()
                    }
                  }}
                  className="sm:max-w-48"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHoliday}
                  disabled={!ISO_DATE.test(pendingDate)}
                >
                  Adicionar
                </Button>
              </div>
              <FieldDescription>
                Adicione as datas uma a uma; serão salvas no formato AAAA-MM-DD
                separadas por vírgula
              </FieldDescription>
              {holidays.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {holidays.map((holiday) => (
                    <li key={holiday}>
                      <Badge
                        variant="secondary"
                        className="h-7 gap-1 pr-1 pl-2.5 text-sm"
                      >
                        {formatHoliday(holiday)}
                        <button
                          type="button"
                          aria-label={`Remover ${formatHoliday(holiday)}`}
                          className="hover:bg-foreground/10 focus-visible:ring-ring/50 flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-2"
                          onClick={() =>
                            setHolidays(holidays.filter((h) => h !== holiday))
                          }
                        >
                          <XIcon className="size-3" />
                        </button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma data adicionada.
                </p>
              )}
            </Field>
            {FIELDS.slice(3).map((field) => renderField(field))}
          </FieldGroup>
        </CardContent>
      </Card>
      <SaveBar dirty={dirty} pending={mutation.isPending} />
    </form>
  )
}

function SkeletonField() {
  return (
    <Field>
      <Skeleton className="h-4 w-48" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-75 w-full" />
      </div>
    </Field>
  )
}

function BotConfigSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Chat bot</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {FIELDS.slice(0, 3).map((field) => (
              <SkeletonField key={field.name} />
            ))}
            <Field>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-7 w-40" />
            </Field>
            {FIELDS.slice(3).map((field) => (
              <SkeletonField key={field.name} />
            ))}
          </FieldGroup>
        </CardContent>
      </Card>
      <SaveBar disabled />
    </>
  )
}

export default function ChatBotPage() {
  const { data, isLoading, isError, refetch } = useQuery<BotConfig>({
    queryKey: QUERY_KEY,
    queryFn: fetchBotConfig,
    retry: false,
  })

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-6">
      {isLoading ? (
        <BotConfigSkeleton />
      ) : isError || !data ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-destructive">
              Não foi possível carregar as configurações do bot. Tente novamente
              em instantes.
            </span>
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <BotConfigForm initialValues={data} />
      )}
    </div>
  )
}
