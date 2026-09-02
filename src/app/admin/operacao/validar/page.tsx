'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { QrCodeIcon, SearchIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const QrScanner = dynamic(
  () => import('@/components/operacao/qr-scanner').then((m) => m.QrScanner),
  { ssr: false }
)

export default function OperacaoSearchPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function goToOrder(rawCode: string) {
    const trimmed = rawCode.trim().toUpperCase()
    if (!trimmed) return
    router.push(`/admin/operacao/validar/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold">Operação — Entrada e Saída</h1>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR Code do cliente ou digite o código da compra
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Código curto</CardTitle>
          <CardDescription>Ex: XYZ123</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              goToOrder(code)
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XYZ123"
              className="h-12 text-center font-mono text-lg tracking-[0.3em] uppercase"
              maxLength={12}
              autoComplete="off"
            />
            <Button type="submit" size="lg" className="h-12 shrink-0">
              <SearchIcon className="size-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Leitor de QR Code</CardTitle>
          <CardDescription>Utiliza a câmera do dispositivo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!scannerOpen ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => setScannerOpen(true)}
            >
              <QrCodeIcon className="size-4" />
              Ativar câmera
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-end"
                onClick={() => setScannerOpen(false)}
              >
                <XIcon className="size-4" />
                Fechar câmera
              </Button>
              <QrScanner active={scannerOpen} onScan={goToOrder} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
