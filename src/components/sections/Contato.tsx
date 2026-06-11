'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Camera, MessageCircle } from 'lucide-react'

export default function Contato({ contactSection }: any) {
  const badge        = contactSection?.Section?.badge?.value        ?? ''
  const title        = contactSection?.Section?.title?.value        ?? ''
  const subtitle     = contactSection?.Section?.subtitle?.value     ?? ''
  const formBtnLabel = contactSection?.Section?.formBtnLabel?.value ?? 'Enviar'

  const wppNumber          = contactSection?.Info?.wppNumber?.value          ?? ''
  const address            = contactSection?.Info?.address?.value            ?? ''
  const googleMapsUrl      = contactSection?.Info?.googleMapsUrl?.value      ?? ''
  const weekdaysTime       = contactSection?.Info?.weekdaysTime?.value       ?? ''
  const holidaysTime       = contactSection?.Info?.holidaysTime?.value       ?? ''
  const instagramUrl       = contactSection?.Info?.instagramUrl?.value       ?? ''
  const googleMapsUrlIframe = contactSection?.Info?.googleMapsUrlIframe?.value ?? ''

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
    const url = `https://api.whatsapp.com/send?phone=${wppNumber}&text=${encodeURIComponent(texto)}`
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
            {badge}
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            {title}
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            {subtitle}
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
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: '#FF4F8A18' }}>
                  <MapPin size={22} style={{ color: '#FF4F8A' }} />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-gray-800">Endereço</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body mt-0.5 block text-sm hover:underline"
                    style={{ color: '#FF4F8A' }}
                  >
                    {address}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: '#8E4CCF18' }}>
                  <Clock size={22} style={{ color: '#8E4CCF' }} />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-gray-800">Horário de Funcionamento</p>
                  <div className="font-body mt-0.5 text-sm text-gray-500">
                    <span className="block">Segunda a Sábado: {weekdaysTime}</span>
                    <span className="block">Domingos e feriados: {holidaysTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="mb-8 flex gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform hover:scale-110"
                style={{ backgroundColor: '#FF4F8A18' }}
              >
                <Camera size={22} style={{ color: '#FF4F8A' }} />
              </a>
              <a
                href={`https://api.whatsapp.com/send/?phone=${wppNumber}&text&type=phone_number&app_absent=0`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform hover:scale-110"
                style={{ backgroundColor: '#9AD94B18' }}
              >
                <MessageCircle size={22} style={{ color: '#9AD94B' }} />
              </a>
            </div>

            {/* Map */}
            {googleMapsUrlIframe && (
              <div className="overflow-hidden rounded-2xl shadow-md">
                <iframe
                  src={googleMapsUrlIframe}
                  width="100%"
                  height="208"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização Divercity Park"
                />
              </div>
            )}
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="nome" className="font-body mb-1.5 block text-sm font-medium text-gray-700">
                  Nome *
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`font-body focus:border-brand-cyan focus:ring-brand-cyan/20 w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-colors outline-none focus:ring-2 ${
                    errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.nome && <p className="font-body mt-1 text-xs text-red-500">{errors.nome}</p>}
              </div>

              <div>
                <label htmlFor="mensagem" className="font-body mb-1.5 block text-sm font-medium text-gray-700">
                  Mensagem *
                </label>
                <textarea
                  id="mensagem"
                  rows={5}
                  placeholder="Olá! Gostaria de saber mais sobre as festas..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className={`font-body focus:border-brand-cyan focus:ring-brand-cyan/20 w-full resize-none rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder-gray-400 transition-colors outline-none focus:ring-2 ${
                    errors.mensagem ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}
                />
                {errors.mensagem && <p className="font-body mt-1 text-xs text-red-500">{errors.mensagem}</p>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-brand-pink font-body flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-white shadow-lg shadow-pink-500/30 transition-colors hover:bg-pink-600"
              >
                <MessageCircle size={18} />
                {formBtnLabel}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
