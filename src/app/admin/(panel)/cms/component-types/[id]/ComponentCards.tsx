'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ComponentIcon, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/admin/ui/sheet'
import { Skeleton } from '@/components/admin/ui/skeleton'
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import { Field, FieldLabel } from '@/components/admin/ui/field'
import { Card, CardContent } from '@/components/admin/ui/card'
import { Input } from '@/components/admin/ui/input'

type ComponentSummary = { id: number; name: string }

type TemplateField = { id: number; name: string }

type InstanceSubField = {
  ivId: number | null
  fieldId: number
  name: string
  value: string
}

type InstanceRow = {
  uid: string
  fvId: number | null
  instanceId: number | null
  templateComponentId: number
  subFields: InstanceSubField[]
  deleted: boolean
}

type FieldValue = {
  id: number
  value: string | null
  type: string
  instance: {
    id: number
    templateComponentId: number
    fieldValues: {
      id: number
      value: string | null
      field: { id: number; name: string }
    }[]
    templateComponent: { fields: TemplateField[] }
  } | null
}

type Field = { id: number; name: string; type: string; values: FieldValue[] }
type ComponentDetail = { id: number; name: string; fields: Field[] }

function ConfirmButton({
  onConfirm,
  loading,
}: {
  onConfirm: () => void
  loading: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  if (loading)
    return (
      <Button size="sm" disabled>
        Salvando...
      </Button>
    )

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            onConfirm()
            setConfirming(false)
          }}
        >
          Confirmar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" onClick={() => setConfirming(true)}>
      Salvar
    </Button>
  )
}

function SimpleFieldEditor({
  field,
  componentId,
}: {
  field: Field
  componentId: number
}) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState(() =>
    field.values.map((fv) => ({ id: fv.id, value: fv.value ?? '' }))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      Promise.all(
        values.map((v) =>
          fetch(`/api/admin/component-field-values/${v.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: v.value }),
          })
        )
      ),
    onSuccess: () => {
      toast.success('Salvo com sucesso')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'component-detail', componentId],
      })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  return (
    <div className="flex flex-col gap-2">
      {values.map((v, i) => (
        <Input
          key={v.id}
          value={v.value}
          onChange={(e) =>
            setValues((prev) =>
              prev.map((x, j) =>
                j === i ? { ...x, value: e.target.value } : x
              )
            )
          }
        />
      ))}
      <div className="flex justify-end border-t pt-3">
        <ConfirmButton onConfirm={() => mutate()} loading={isPending} />
      </div>
    </div>
  )
}

function InstanceFieldEditor({
  field,
  componentId,
  isMultiple,
}: {
  field: Field
  componentId: number
  isMultiple: boolean
}) {
  const queryClient = useQueryClient()
  const uidRef = useRef(0)

  const firstInstance = field.values.find((fv) => fv.instance)?.instance
  const templateComponentId = firstInstance?.templateComponentId ?? 0
  const templateFields: TemplateField[] =
    firstInstance?.templateComponent?.fields ?? []

  const [rows, setRows] = useState<InstanceRow[]>(() =>
    field.values.map((fv) => ({
      uid: `fv-${fv.id}`,
      fvId: fv.id,
      instanceId: fv.instance?.id ?? null,
      templateComponentId:
        fv.instance?.templateComponentId ?? templateComponentId,
      subFields: (fv.instance?.fieldValues ?? []).map((iv) => ({
        ivId: iv.id,
        fieldId: iv.field.id,
        name: iv.field.name,
        value: iv.value ?? '',
      })),
      deleted: false,
    }))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      for (const row of rows.filter((r) => r.deleted && r.fvId)) {
        await fetch(`/api/admin/component-field-values/${row.fvId}`, {
          method: 'DELETE',
        })
      }
      for (const row of rows.filter((r) => !r.deleted && r.fvId === null)) {
        await fetch('/api/admin/component-field-values', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentFieldId: field.id,
            templateComponentId: row.templateComponentId,
            subFields: row.subFields.map((sf) => ({
              fieldId: sf.fieldId,
              value: sf.value,
            })),
          }),
        })
      }
      for (const row of rows.filter((r) => !r.deleted && r.fvId !== null)) {
        await Promise.all(
          row.subFields
            .filter((sf) => sf.ivId !== null)
            .map((sf) =>
              fetch(`/api/admin/component-instance-field-values/${sf.ivId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: sf.value }),
              })
            )
        )
      }
    },
    onSuccess: () => {
      toast.success('Salvo com sucesso')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'component-detail', componentId],
      })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  function addRow() {
    const uid = `new-${++uidRef.current}`
    setRows((prev) => [
      ...prev,
      {
        uid,
        fvId: null,
        instanceId: null,
        templateComponentId,
        subFields: templateFields.map((tf) => ({
          ivId: null,
          fieldId: tf.id,
          name: tf.name,
          value: '',
        })),
        deleted: false,
      },
    ])
  }

  function deleteRow(uid: string) {
    setRows((prev) =>
      prev.map((r) => (r.uid === uid ? { ...r, deleted: true } : r))
    )
  }

  function updateSubField(uid: string, sfIdx: number, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.uid === uid
          ? {
              ...r,
              subFields: r.subFields.map((sf, j) =>
                j === sfIdx ? { ...sf, value } : sf
              ),
            }
          : r
      )
    )
  }

  const visible = rows.filter((r) => !r.deleted)

  return (
    <div className="flex flex-col gap-3">
      {visible.map((row) => (
        <div
          key={row.uid}
          className="bg-muted/40 relative rounded-lg border p-3 pr-8"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Remover linha"
            onClick={() => deleteRow(row.uid)}
            className="hover:text-destructive absolute top-2 right-2"
          >
            <Trash2 />
          </Button>
          <div className="flex flex-col gap-2">
            {row.subFields.map((sf, sfIdx) => (
              <Field key={sfIdx} className="gap-1">
                <FieldLabel className="text-muted-foreground text-xs">
                  {sf.name}
                </FieldLabel>
                <Input
                  value={sf.value}
                  onChange={(e) =>
                    updateSubField(row.uid, sfIdx, e.target.value)
                  }
                  className="h-8 text-sm"
                />
              </Field>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between border-t pt-3">
        {isMultiple && templateFields.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        ) : (
          <span />
        )}
        <ConfirmButton onConfirm={() => mutate()} loading={isPending} />
      </div>
    </div>
  )
}

function FieldSection({
  field,
  componentId,
}: {
  field: Field
  componentId: number
}) {
  const hasInstances = field.values.some((fv) => fv.instance !== null)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{field.name}</span>
        <Badge variant="outline" className="font-mono text-[10px]">
          {field.type}
        </Badge>
      </div>
      {hasInstances ? (
        <InstanceFieldEditor
          field={field}
          componentId={componentId}
          isMultiple={field.type !== 'simple'}
        />
      ) : (
        <SimpleFieldEditor field={field} componentId={componentId} />
      )}
    </div>
  )
}

function ComponentSheetContent({ componentId }: { componentId: number }) {
  const { data, isLoading } = useQuery<ComponentDetail>({
    queryKey: ['admin', 'component-detail', componentId],
    queryFn: () =>
      fetch(`/api/admin/content-components/${componentId}`).then((r) =>
        r.json()
      ),
    enabled: componentId > 0,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-6 px-4 pb-8">
      {data.fields.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nenhum campo cadastrado.
        </p>
      )}
      {data.fields.map((field) => (
        <FieldSection key={field.id} field={field} componentId={componentId} />
      ))}
    </div>
  )
}

export function ComponentCards({
  components,
}: {
  components: ComponentSummary[]
}) {
  const [selected, setSelected] = useState<ComponentSummary | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {components.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c)}
            className="focus-visible:ring-ring/50 cursor-pointer rounded-xl text-left outline-none focus-visible:ring-3"
          >
            <Card className="hover:bg-muted/50 h-full transition-colors">
              <CardContent className="flex flex-col gap-3">
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <ComponentIcon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-muted-foreground text-xs">ID #{c.id}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full! overflow-y-auto sm:w-[50vw]! sm:max-w-none!">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <ComponentIcon className="size-4" />
              {selected?.name}
            </SheetTitle>
          </SheetHeader>
          {selected && <ComponentSheetContent componentId={selected.id} />}
        </SheetContent>
      </Sheet>
    </>
  )
}
