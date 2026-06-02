'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Camera, MessageCircle } from 'lucide-react'

interface ContatoProps {
  config: any
  badge?: string
  titulo?: string
  subtitulo?: string
  ctaLabel?: string
}

export default function Contato({
  config,
  badge,
  titulo,
  subtitulo,
  ctaLabel,
}: ContatoProps) {
  const [nome, setNome] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [errors, setErrors] = useState<{ nome?: string; mensagem?: string }>({})

  const businessInfo = [
    {
      icon: MapPin,
      label: 'Endereço',
      value: config.endereco,
      href: config.google_maps_url,
      color: '#FF4F8A',
    },
    {
      icon: Clock,
      label: 'Horário de Funcionamento',
      value: `${config.horario_semana}\n${config.horario_feriado}`,
      href: null,
      color: '#8E4CCF',
    },
  ]

  const socialLinks = [
    {
      icon: Camera,
      label: 'Instagram',
      href: config.instagram_url,
      color: '#FF4F8A',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://api.whatsapp.com/send/?phone=${config.whatsapp_number}&text&type=phone_number&app_absent=0`,
      color: '#9AD94B',
    },
  ]

  const validate = () => {
    const e: { nome?: string; mensagem?: string } = {}
    if (nome.trim().length < 2) e.nome = 'Nome deve ter pelo menos 2 caracteres'
    if (mensagem.trim().length < 10)
      e.mensagem = 'Mensagem deve ter pelo menos 10 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!validate()) return
    const texto = `Olá! Meu nome é ${nome.trim()}. ${mensagem.trim()}`
    const url = `https://api.whatsapp.com/send?phone=${config.whatsapp_number}&text=${encodeURIComponent(texto)}`
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
          className="mb-12 text-center"
        >
          <span className="bg-brand-cyan/10 text-brand-cyan font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
            {badge ?? 'Fale Conosco'}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {titulo ?? 'Nos manda uma mensagem!'}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {subtitulo ??
              'Estamos aqui para tirar todas as suas dúvidas e ajudar a planejar a festa perfeita.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Business info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-8 space-y-6">
              {businessInfo.map((info) => {
                const Icon = info.icon
                return (
                  <div key={info.label} className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: info.color + '18' }}
                    >
                      <Icon size={22} style={{ color: info.color }} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold text-gray-800">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-body mt-0.5 text-sm hover:underline"
                          style={{ color: info.color }}
                        >
                          {info.value
                            .split('\n')
                            .map((line: string, i: number) => (
                              <span key={i} className="block">
                                {line}
                              </span>
                            ))}
                        </a>
                      ) : (
                        <div className="font-body mt-0.5 text-sm text-gray-500">
                          {info.value
                            .split('\n')
                            .map((line: string, i: number) => (
                              <span key={i} className="block">
                                {line}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Social */}
            <div className="mb-8 flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform hover:scale-110"
                    style={{ backgroundColor: s.color + '18' }}
                  >
                    <Icon size={22} style={{ color: s.color }} />
                  </a>
                )
              })}
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl shadow-md">
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
                <label
                  htmlFor="nome"
                  className="font-body mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Nome *
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`font-body focus:border-brand-cyan focus:ring-brand-cyan/20 w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-colors outline-none focus:ring-2 ${
                    errors.nome
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.nome && (
                  <p className="font-body mt-1 text-xs text-red-500">
                    {errors.nome}
                  </p>
                )}
              </div>

              {/* Mensagem */}
              <div>
                <label
                  htmlFor="mensagem"
                  className="font-body mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  rows={5}
                  placeholder="Olá! Gostaria de saber mais sobre as festas..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className={`font-body focus:border-brand-cyan focus:ring-brand-cyan/20 w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-colors outline-none focus:ring-2 ${
                    errors.mensagem
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.mensagem && (
                  <p className="font-body mt-1 text-xs text-red-500">
                    {errors.mensagem}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-pink font-body flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-lg shadow-pink-500/30 transition-colors hover:bg-pink-600"
              >
                <MessageCircle size={18} />
                {ctaLabel ?? 'Enviar pelo WhatsApp'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
