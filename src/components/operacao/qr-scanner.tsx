'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const REGION_ID = 'operacao-qr-reader'

type QrScannerProps = {
  active: boolean
  onScan: (code: string) => void
}

/**
 * Leitor de QR Code via câmera do dispositivo. Client-only por natureza (usa
 * navigator.mediaDevices) — deve ser importado com `dynamic(..., { ssr: false })`.
 */
const isCameraSupported = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

export function QrScanner({ active, onScan }: QrScannerProps) {
  const supported = isCameraSupported()

  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(() => active && supported)
  const onScanRef = useRef(onScan)
  const hasScannedRef = useRef(false)

  useEffect(() => {
    onScanRef.current = onScan
  })

  // Reseta o estado de erro/carregamento durante a renderização quando `active`
  // muda para true (padrão recomendado do React para "ajustar estado quando uma
  // prop muda" — evita setState síncrono dentro do corpo do efeito abaixo).
  const [prevActive, setPrevActive] = useState(active)
  if (active !== prevActive) {
    setPrevActive(active)
    if (active) {
      setError(null)
      setStarting(supported)
    }
  }

  useEffect(() => {
    if (!active || !supported) return

    let cancelled = false
    // `html5-qrcode` lança uma exceção SÍNCRONA (não só uma promise rejeitada) se
    // `.stop()` for chamado antes de `.start()` terminar ou depois de já ter parado
    // — comum em dev com Strict Mode (o efeito roda, limpa, e roda de novo).
    // Por isso só chamamos stop() depois que started === true, e sempre com try/catch.
    let started = false
    hasScannedRef.current = false

    const scanner = new Html5Qrcode(REGION_ID, { verbose: false })

    function stopScanner() {
      try {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            // câmera pode já ter sido liberada — sem problema
          })
      } catch {
        // scanner nunca chegou a iniciar (ou já parou) — sem problema
      }
    }

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled || hasScannedRef.current) return
          hasScannedRef.current = true
          onScanRef.current(decodedText.trim())
        },
        () => {
          // falha de leitura em um frame individual — normal, ignorar
        }
      )
      .then(() => {
        started = true
        if (cancelled) {
          // o efeito já foi desmontado enquanto start() resolvia — libera a câmera agora
          stopScanner()
          return
        }
        setStarting(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStarting(false)
        const name = err instanceof Error ? err.name : ''
        setError(
          name === 'NotAllowedError'
            ? 'Permissão de câmera negada. Use o campo de código manual abaixo.'
            : 'Não foi possível acessar a câmera. Use o campo de código manual abaixo.'
        )
      })

    return () => {
      cancelled = true
      if (started) {
        stopScanner()
      }
    }
  }, [active, supported])

  if (!active) return null

  return (
    <div className="flex flex-col gap-2">
      <div
        id={REGION_ID}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-lg [&_video]:rounded-lg"
      />
      {!supported && (
        <p className="text-center text-sm text-destructive">
          Este navegador/dispositivo não suporta leitura de câmera. Use o código manual.
        </p>
      )}
      {starting && <p className="text-center text-sm text-muted-foreground">Iniciando câmera…</p>}
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
