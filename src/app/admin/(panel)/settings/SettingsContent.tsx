'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/admin/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/admin/ui/input-group'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/admin/ui/tabs'
import { updateSettings } from './actions'

type Setting = { key: string; value: string }

function get(settings: Setting[], key: string) {
  return settings.find((s) => s.key === key)?.value ?? ''
}

function SecretInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={show ? 'Ocultar' : 'Mostrar'}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export function SettingsContent({ settings }: { settings: Setting[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<string>('google')

  const [googleApiKey, setGoogleApiKey] = useState(
    get(settings, 'google_places_api_key')
  )
  const [googlePlaceId, setGooglePlaceId] = useState(
    get(settings, 'google_place_id')
  )
  const [googleMinRating, setGoogleMinRating] = useState(
    get(settings, 'google_testimonials_minimum_rating') || '4'
  )

  const [instagramToken, setInstagramToken] = useState(
    get(settings, 'instagram_access_token')
  )
  const [instagramUrl, setInstagramUrl] = useState(
    get(settings, 'instagram_url')
  )

  const [stripeSecretKey, setStripeSecretKey] = useState(
    get(settings, 'stripe_secret_key')
  )
  const [stripePublishableKey, setStripePublishableKey] = useState(
    get(settings, 'stripe_publishable_key')
  )
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState(
    get(settings, 'stripe_webhook_secret')
  )

  function save(entries: { key: string; value: string }[]) {
    startTransition(async () => {
      try {
        await updateSettings(entries)
        toast.success('Configurações salvas com sucesso!')
        router.refresh()
      } catch {
        toast.error('Erro ao salvar configurações')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Integrações</h1>
        <p className="text-muted-foreground text-sm">
          Configure as integrações externas. Após salvar, o cache é limpo
          automaticamente.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>

        <TabsContent value="google">
          <Card>
            <CardHeader>
              <CardTitle>Google</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="google-api-key">API Key</FieldLabel>
                  <SecretInput
                    id="google-api-key"
                    value={googleApiKey}
                    onChange={setGoogleApiKey}
                    placeholder="AIzaSy..."
                  />
                  <FieldDescription>
                    console.cloud.google.com → Credenciais → Places API
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="google-place-id">Place ID</FieldLabel>
                  <Input
                    id="google-place-id"
                    value={googlePlaceId}
                    onChange={(e) => setGooglePlaceId(e.target.value)}
                    placeholder="ChIJ..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="google-min-rating">
                    Rating mínimo para exibir (1–5)
                  </FieldLabel>
                  <Input
                    id="google-min-rating"
                    type="number"
                    min={1}
                    max={5}
                    className="w-24"
                    value={googleMinRating}
                    onChange={(e) => setGoogleMinRating(e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() =>
                  save([
                    { key: 'google_places_api_key', value: googleApiKey },
                    { key: 'google_place_id', value: googlePlaceId },
                    {
                      key: 'google_testimonials_minimum_rating',
                      value: googleMinRating,
                    },
                  ])
                }
                disabled={isPending}
              >
                {isPending ? 'Salvando…' : 'Salvar Google'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>Instagram</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="instagram-token">
                    Access Token
                  </FieldLabel>
                  <SecretInput
                    id="instagram-token"
                    value={instagramToken}
                    onChange={setInstagramToken}
                    placeholder="IGAAc…"
                  />
                  <FieldDescription>
                    Token de longa duração (~60 dias). O cron renova
                    automaticamente no dia 1 de cada mês.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="instagram-url">URL do Perfil</FieldLabel>
                  <Input
                    id="instagram-url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://www.instagram.com/divercity.park"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() =>
                  save([
                    { key: 'instagram_access_token', value: instagramToken },
                    { key: 'instagram_url', value: instagramUrl },
                  ])
                }
                disabled={isPending}
              >
                {isPending ? 'Salvando…' : 'Salvar Instagram'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="stripe-publishable-key">
                    Publishable Key
                  </FieldLabel>
                  <Input
                    id="stripe-publishable-key"
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    placeholder="pk_live_..."
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="stripe-secret-key">
                    Secret Key
                  </FieldLabel>
                  <SecretInput
                    id="stripe-secret-key"
                    value={stripeSecretKey}
                    onChange={setStripeSecretKey}
                    placeholder="sk_live_..."
                  />
                  <FieldDescription>
                    dashboard.stripe.com → Desenvolvedores → Chaves de API
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="stripe-webhook-secret">
                    Webhook Signing Secret
                  </FieldLabel>
                  <SecretInput
                    id="stripe-webhook-secret"
                    value={stripeWebhookSecret}
                    onChange={setStripeWebhookSecret}
                    placeholder="whsec_..."
                  />
                  <FieldDescription>
                    dashboard.stripe.com → Desenvolvedores → Webhooks →
                    assinatura do endpoint
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={() =>
                  save([
                    {
                      key: 'stripe_publishable_key',
                      value: stripePublishableKey,
                    },
                    { key: 'stripe_secret_key', value: stripeSecretKey },
                    {
                      key: 'stripe_webhook_secret',
                      value: stripeWebhookSecret,
                    },
                  ])
                }
                disabled={isPending}
              >
                {isPending ? 'Salvando…' : 'Salvar Stripe'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
