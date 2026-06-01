'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Camera, MessageCircle } from 'lucide-react'

// Substituir via CMS no futuro
const WHATSAPP_NUMBER = '5514997569008'
const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Av.+Tuiuti,+710+Gleba+Patrimônio+Maringa+Maringá'

const BUSINESS_INFO = [
  {
    icon: MapPin,
    label: 'Endereço',
    value: 'Av. Tuiuti, 710 – Gleba Patrimônio Maringa, Maringá 87043-720\nShopping Cidade Maringá',
    href: GOOGLE_MAPS_URL,
    color: '#FF4F8A',
  },
  {
    icon: Clock,
    label: 'Horário de Funcionamento',
    value: 'Segunda a Sábado: das 10h às 22h\nDomingos e feriados: das 12h às 20h',
    href: null,
    color: '#8E4CCF',
  },
]

const SOCIAL_LINKS = [
  {
    icon: Camera,
    label: 'Instagram',
    href: 'https://www.instagram.com/divercity.park',
    color: '#FF4F8A',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    href: `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text&type=phone_number&app_absent=0`,
    color: '#9AD94B',
  },
]

export default function Contato() {
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [errors, setErrors] = useState<{ nome?: string; mensagem?: string }>({})

  const validate = () => {
    const e: { nome?: string; mensagem?: string } = {}
    if (nome.trim().length < 2) e.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (mensagem.trim().length < 10) e.mensagem = 'Mensagem deve ter pelo menos 10 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!validate()) return
    const texto = `Olá! Meu nome é ${nome.trim()}. ${mensagem.trim()}`
    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="contato" className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan font-body font-semibold text-sm mb-3">
            Fale Conosco
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Nos manda uma mensagem!
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Estamos aqui para tirar todas as suas dúvidas e ajudar a planejar a festa perfeita.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Business info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="space-y-6 mb-8">
              {BUSINESS_INFO.map((info) => {
                const Icon = info.icon
                return (
                  <div key={info.label} className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: info.color + '18' }}
                    >
                      <Icon size={22} style={{ color: info.color }} />
                    </div>
                    <div>
                      <p className="font-body font-semibold text-gray-800 text-sm">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body text-sm mt-0.5 hover:underline"
                          style={{ color: info.color }}
                        >
                          {info.value.split('\n').map((line, i) => (
                            <span key={i} className="block">{line}</span>
                          ))}
                        </a>
                      ) : (
                        <div className="font-body text-gray-500 text-sm mt-0.5">
                          {info.value.split('\n').map((line, i) => (
                            <span key={i} className="block">{line}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social */}
            <div className="flex gap-3 mb-8">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: s.color + '18' }}
                  >
                    <Icon size={22} style={{ color: s.color }} />
                  </a>
                )
              })}
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              <iframe
                src="https://maps.google.com/maps?q=Av.+Tuiuti+710+Gleba+Patrimônio+Maringa+Maringá+PR+Brasil&output=embed&z=16"
                width="100%"
                height="208"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Divercity Park"
              />
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block font-body font-medium text-gray-700 text-sm mb-1.5">
                  Nome *
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 ${
                    errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.nome && (
                  <p className="font-body text-red-500 text-xs mt-1">{errors.nome}</p>
                )}
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="mensagem" className="block font-body font-medium text-gray-700 text-sm mb-1.5">
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  rows={5}
                  placeholder="Olá! Gostaria de saber mais sobre as festas..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors resize-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 ${
                    errors.mensagem ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.mensagem && (
                  <p className="font-body text-red-500 text-xs mt-1">{errors.mensagem}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-brand-pink text-white font-body font-bold text-base shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Enviar pelo WhatsApp
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
