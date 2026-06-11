'use client'

import { Camera, MessageCircle, MapPin, Clock } from 'lucide-react'

export default function Footer({ config }: any) {
  const currentYear = new Date().getFullYear()

  const info = config?.Info ?? {}
  const logoFooter = info?.logoFooter?.value ?? null
  const weekdaysTime = info?.weekdaysTime?.value ?? ''
  const holidaysTime = info?.holidaysTime?.value ?? ''
  const googleMapsUrl = info?.googleMapsUrl?.value ?? ''
  const address = info?.address?.value ?? ''
  const instagramUrl = info?.instagramUrl?.value ?? ''
  const wppNumber = info?.wppNumber?.value ?? ''

  return (
    <footer style={{ backgroundColor: '#212121' }} className="text-white">
      <div className="container-max px-4 py-16 md:px-8 lg:px-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoFooter}
                alt="Divercity Park"
                className="h-16 w-16"
              />
              <div>
                <p className="font-heading text-xl font-bold">Divercity Park</p>
                <p className="font-body text-xs text-white/60">
                  Diversão para toda família
                </p>
              </div>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/70">
              O melhor parque indoor da região para festas de aniversário e
              diversão em família.
            </p>
          </div>

          {/* Funcionamento + Endereço */}
          <div className="space-y-6">
            <div>
              <h4 className="font-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                <Clock size={16} className="text-brand-cyan" />
                Funcionamento
              </h4>
              <div className="font-body space-y-1 text-sm">
                <p>
                  Segunda a Sábado :
                  <span className="text-brand-cyan ml-2">{weekdaysTime}</span>
                </p>
                <p>
                  Domingos e feriados :
                  <span className="text-brand-cyan ml-2">{holidaysTime}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                <MapPin size={16} className="text-brand-cyan" />
                Onde estamos
              </h4>
              <div className="font-body space-y-1 text-sm">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-cyan block underline underline-offset-2 transition-colors hover:text-white"
                >
                  {address}
                </a>
              </div>
            </div>
          </div>

          {/* Redes sociais */}
          <div>
            <h4 className="font-heading mb-5 text-lg font-semibold">
              Redes Sociais
            </h4>
            <div className="flex gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
              >
                <Camera size={18} style={{ color: '#FF4F8A' }} />
              </a>
              <a
                href={`https://api.whatsapp.com/send/?phone=${wppNumber}&text&type=phone_number&app_absent=0`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
              >
                <MessageCircle size={18} style={{ color: '#9AD94B' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 sm:flex-row">
          <p
            className="font-body text-sm text-white/50"
            suppressHydrationWarning
          >
            © {currentYear} Divercity Park. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-white/40">
            Diversão para toda a família
          </p>
        </div>
      </div>
    </footer>
  )
}
