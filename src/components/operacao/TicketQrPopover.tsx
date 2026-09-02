'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { Loader2Icon, QrCodeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function TicketQrPopover({ shortCode }: { shortCode: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (dataUrl || loading) return
    setLoading(true)
    try {
      const url = await QRCode.toDataURL(shortCode, { errorCorrectionLevel: 'M', margin: 2, width: 220 })
      setDataUrl(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover onOpenChange={(open) => open && generate()}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" title="Ver QR Code">
            <QrCodeIcon className="size-4" />
          </Button>
        }
      />
      <PopoverContent className="flex w-auto flex-col items-center gap-2 p-4">
        {loading && <Loader2Icon className="text-muted-foreground size-6 animate-spin" />}
        {dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`QR Code do ingresso ${shortCode}`} className="size-44 rounded-md" />
        )}
        <p className="font-mono text-sm font-bold tracking-widest">{shortCode}</p>
      </PopoverContent>
    </Popover>
  )
}
