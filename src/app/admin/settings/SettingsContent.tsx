'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateSettings } from './actions'

type Setting = { key: string; value: string }

function get(settings: Setting[], key: string) {
  return settings.find((s) => s.key === key)?.value ?? ''
}

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function SettingsContent({ settings }: { settings: Setting[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [googleApiKey, setGoogleApiKey] = useState(get(settings, 'google_places_api_key'))
  const [googlePlaceId, setGooglePlaceId] = useState(get(settings, 'google_place_id'))
  const [googleMinRating, setGoogleMinRating] = useState(
    get(settings, 'google_testimonials_minimum_rating') || '4'
  )

  const [instagramToken, setInstagramToken] = useState(get(settings, 'instagram_access_token'))
  const [instagramUrl, setInstagramUrl] = useState(get(settings, 'instagram_url'))

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
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure as integrações externas. Após salvar, o cache é limpo automaticamente.
        </p>
      </div>

      <Tabs defaultValue="google">
        <TabsList className="mb-6">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="google-api-key">API Key</Label>
            <SecretInput
              value={googleApiKey}
              onChange={setGoogleApiKey}
              placeholder="AIzaSy..."
            />
            <p className="text-xs text-gray-400">
              console.cloud.google.com → Credenciais → Places API
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-place-id">Place ID</Label>
            <Input
              id="google-place-id"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              placeholder="ChIJ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="google-min-rating">Rating mínimo para exibir (1–5)</Label>
            <Input
              id="google-min-rating"
              type="number"
              min={1}
              max={5}
              value={googleMinRating}
              onChange={(e) => setGoogleMinRating(e.target.value)}
              className="w-24"
            />
          </div>

          <Button
            onClick={() =>
              save([
                { key: 'google_places_api_key', value: googleApiKey },
                { key: 'google_place_id', value: googlePlaceId },
                { key: 'google_testimonials_minimum_rating', value: googleMinRating },
              ])
            }
            disabled={isPending}
          >
            {isPending ? 'Salvando…' : 'Salvar Google'}
          </Button>
        </TabsContent>

        <TabsContent value="instagram" className="space-y-5">
          <div className="space-y-2">
            <Label>Access Token</Label>
            <SecretInput
              value={instagramToken}
              onChange={setInstagramToken}
              placeholder="IGAAc…"
            />
            <p className="text-xs text-gray-400">
              Token de longa duração (~60 dias). O cron renova automaticamente no dia 1 de cada mês.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram-url">URL do Perfil</Label>
            <Input
              id="instagram-url"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://www.instagram.com/divercity.park"
            />
          </div>

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
        </TabsContent>
      </Tabs>
    </div>
  )
}
