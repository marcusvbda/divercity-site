import Image from 'next/image'
import { Camera, MessageCircle, MapPin, Clock } from 'lucide-react'

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Av.+Tuiuti,+710+Gleba+Patrimônio+Maringa+Maringá'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#212121' }} className="text-white">
      <div className="container-max px-4 py-16 md:px-8 lg:px-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/logo-ball-fundo.png"
                alt="Divercity Park"
                width={64}
                height={64}
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
                  <span className="font-semibold text-white">
                    Segunda a Sábado:
                  </span>{' '}
                  <span className="text-brand-cyan">das 10h às 22h</span>
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Domingos e feriados:
                  </span>{' '}
                  <span className="text-brand-cyan">das 12h às 20h</span>
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
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-cyan block underline underline-offset-2 transition-colors hover:text-white"
                >
                  Av. Tuiuti, 710 – Gleba Patrimônio Maringa, Maringá 87043-720
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
                href="https://www.instagram.com/divercity.park"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
              >
                <Camera size={18} style={{ color: '#FF4F8A' }} />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=5514997569008&text&type=phone_number&app_absent=0"
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
          <p className="font-body text-sm text-white/50">
            © 2024 Divercity Park. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs text-white/40">
            Diversão para toda a família
          </p>
        </div>
      </div>
    </footer>
  )
}
