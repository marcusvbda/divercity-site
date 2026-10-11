'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/admin/ui/alert'
import { Card, CardContent } from '@/components/admin/ui/card'
import { Label } from '@/components/admin/ui/label'
import { Switch } from '@/components/admin/ui/switch'
import type { FeatureKey } from '@/lib/features'
import { updateFeature } from './actions'

type FeatureItem = { key: FeatureKey; name: string; enabled: boolean }

export function FeaturesContent({
  features,
  devOnlyLock,
}: {
  features: FeatureItem[]
  devOnlyLock: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingKey, setPendingKey] = useState<FeatureKey | null>(null)

  function toggle(key: FeatureKey, enabled: boolean) {
    setPendingKey(key)
    startTransition(async () => {
      try {
        await updateFeature(key, enabled)
        toast.success('Feature atualizada')
        router.refresh()
      } catch {
        toast.error('Erro ao atualizar feature')
      } finally {
        setPendingKey(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Features</h1>
        <p className="text-muted-foreground text-sm">
          Ative ou desative funcionalidades do site.
        </p>
      </div>

      {devOnlyLock && (
        <Alert>
          <AlertTitle>Trava de desenvolvimento ativa</AlertTitle>
          <AlertDescription>
            As features só funcionam em modo de desenvolvimento, mesmo ligadas aqui. Os valores
            abaixo passam a valer quando a trava for removida.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="divide-y">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <Label htmlFor={`feature-${feature.key}`}>{feature.name}</Label>
              <Switch
                id={`feature-${feature.key}`}
                checked={feature.enabled}
                disabled={isPending && pendingKey === feature.key}
                onCheckedChange={(checked) => toggle(feature.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
