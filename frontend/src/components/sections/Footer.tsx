import Image from 'next/image'
import { Camera, Globe, MessageCircle, MapPin, Phone, Clock } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/data'

export default function Footer() {
  return (
    <footer className="bg-brand-purple text-white">
      <div className="container-max px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-ball.png"
                alt="Divercity Park"
                width={64}
                height={64}
                className="w-16 h-16"
              />
              <div>
                <p className="font-heading text-xl font-bold">Divercity Park</p>
                <p className="font-body text-white/60 text-xs">Diversão para toda família</p>
              </div>
            </div>
            <p className="font-body text-white/70 text-sm leading-relaxed">
              O melhor parque indoor da região para festas de aniversário e diversão em família.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Links Rápidos</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="font-body text-white/70 text-sm hover:text-brand-cyan transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-cyan mt-0.5 shrink-0" />
                <p className="font-body text-white/70 text-sm">
                  Divercity Park — consulte endereço no Google Maps
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-brand-cyan shrink-0" />
                <p className="font-body text-white/70 text-sm">Consulte via Instagram</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-brand-cyan mt-0.5 shrink-0" />
                <p className="font-body text-white/70 text-sm">
                  Seg–Sex: 14h às 20h
                  <br />
                  Sáb–Dom e Feriados: 10h às 20h
                </p>
              </div>
            </div>
          </div>

          {/* Social + mini map */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              {[
                {
                  icon: Camera,
                  href: 'https://instagram.com/divercitypark',
                  label: 'Instagram',
                  color: '#FF4F8A',
                },
                { icon: Globe, href: '#', label: 'Facebook', color: '#12C7C8' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp', color: '#9AD94B' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon size={18} style={{ color: s.color }} />
                  </a>
                )
              })}
            </div>
            <div className="rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://placehold.co/300x150/5b2f9e/ffffff?text=Mapa+Divercity+Park"
                alt="Mapa Divercity Park"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/50 text-sm">
            © 2024 Divercity Park. Todos os direitos reservados.
          </p>
          <p className="font-body text-white/40 text-xs">Diversão para toda a família</p>
        </div>
      </div>
    </footer>
  )
}
