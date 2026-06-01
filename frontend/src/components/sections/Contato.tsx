'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Phone,
  Clock,
  Camera,
  Globe,
  MessageCircle,
  Send,
} from 'lucide-react'

const contatoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um e-mail válido'),
  telefone: z.string().optional(),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
})

type ContatoFormData = z.infer<typeof contatoSchema>

const BUSINESS_INFO = [
  {
    icon: MapPin,
    label: 'Endereço',
    value: 'Divercity Park — consulte o endereço no Google Maps',
    color: '#FF4F8A',
  },
  {
    icon: Phone,
    label: 'Telefone / WhatsApp',
    value: 'Consulte nosso número no Instagram @divercitypark',
    color: '#12C7C8',
  },
  {
    icon: Clock,
    label: 'Horário de Funcionamento',
    value: 'Seg–Sex: 14h às 20h | Sáb–Dom e Feriados: 10h às 20h',
    color: '#8E4CCF',
  },
]

const SOCIAL_LINKS = [
  {
    icon: Camera,
    label: 'Instagram',
    href: 'https://instagram.com/divercitypark',
    color: '#FF4F8A',
  },
  { icon: Globe, label: 'Facebook', href: '#', color: '#8E4CCF' },
  { icon: MessageCircle, label: 'WhatsApp', href: '#', color: '#9AD94B' },
]

export default function Contato() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContatoFormData>({ resolver: zodResolver(contatoSchema) })

  const onSubmit = async (data: ContatoFormData) => {
    await new Promise((r) => setTimeout(r, 800))
    console.log('Form submitted:', data)
    setSubmitted(true)
    reset()
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="contato" className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Business info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
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
                      <p className="font-body font-semibold text-gray-800 text-sm">
                        {info.label}
                      </p>
                      <p className="font-body text-gray-500 text-sm mt-0.5">{info.value}</p>
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

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://placehold.co/600x250/e5e7eb/9ca3af?text=Mapa+-+Divercity+Park"
                alt="Localização Divercity Park"
                className="w-full h-52 object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center mb-4">
                  <Send size={28} className="text-brand-lime" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">
                  Mensagem enviada!
                </h3>
                <p className="font-body text-gray-500">
                  Em breve entraremos em contato. Obrigado!
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Nome */}
                <div>
                  <label
                    htmlFor="nome"
                    className="block font-body font-medium text-gray-700 text-sm mb-1.5"
                  >
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    {...register('nome')}
                    className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 ${
                      errors.nome ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.nome && (
                    <p className="font-body text-red-500 text-xs mt-1">{errors.nome.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-body font-medium text-gray-700 text-sm mb-1.5"
                  >
                    E-mail *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.email && (
                    <p className="font-body text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label
                    htmlFor="telefone"
                    className="block font-body font-medium text-gray-700 text-sm mb-1.5"
                  >
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    {...register('telefone')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label
                    htmlFor="mensagem"
                    className="block font-body font-medium text-gray-700 text-sm mb-1.5"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    rows={4}
                    placeholder="Olá! Gostaria de saber mais sobre as festas..."
                    {...register('mensagem')}
                    className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors resize-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 ${
                      errors.mensagem
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  {errors.mensagem && (
                    <p className="font-body text-red-500 text-xs mt-1">
                      {errors.mensagem.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl bg-brand-pink text-white font-body font-bold text-base shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar Mensagem
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
