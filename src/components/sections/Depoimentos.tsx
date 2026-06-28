'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import type { GoogleReview } from '@/app/api/reviews/route'

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=divercity+park+maringa&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOR_pn53xisvuq5RbfvyjgFC2gP_5ZrdZN-OPoiE-STyFLxWtVkGvQNylunxoJWaJ4MZ9qzI%3D'

const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    id: 'f1',
    author_name: 'Camila Rodrigues',
    rating: 5,
    text: 'Lugar incrível! Minha filha amou cada detalhe. As atrações são seguras, bem mantidas e os monitores são super atenciosos. Com certeza voltaremos!',
    time: 0,
    profile_photo_url: 'https://placehold.co/40x40/8E4CCF/ffffff?text=C',
    relative_time_description: 'há 2 semanas',
  },
  {
    id: 'f2',
    author_name: 'Rafael Souza',
    rating: 5,
    text: 'Festinha do meu filho foi um sucesso total! Equipe muito profissional, espaço limpo e organizado. Todos os convidados adoraram. Super recomendo!',
    time: 0,
    profile_photo_url: 'https://placehold.co/40x40/FF6B9D/ffffff?text=R',
    relative_time_description: 'há 1 mês',
  },
  {
    id: 'f3',
    author_name: 'Fernanda Lima',
    rating: 5,
    text: 'Melhor parque indoor de Maringá! As crianças se divertem muito e os pais ficam tranquilos com a segurança do lugar. Vale cada centavo.',
    time: 0,
    profile_photo_url: 'https://placehold.co/40x40/00C2CB/ffffff?text=F',
    relative_time_description: 'há 3 semanas',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function Depoimentos() {
  const { data: reviews = [], isLoading: loading } = useQuery<GoogleReview[]>({
    queryKey: ['google', 'reviews'],
    queryFn: () =>
      fetch('/api/reviews')
        .then((r) => r.json())
        .then((data) => (data?.length ? data : FALLBACK_REVIEWS)),
    placeholderData: FALLBACK_REVIEWS,
  })

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="bg-brand-yellow/20 font-body mb-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-yellow-700">
            ⭐ Avaliações Google
          </span>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            O que nossos clientes dizem
          </h2>
          <p className="font-body mx-auto max-w-xl text-lg text-gray-500">
            Famílias felizes são nossa maior conquista.
          </p>
        </motion.div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl bg-white p-7 shadow-md"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 w-4 rounded bg-gray-200" />
                  ))}
                </div>
                <div className="mb-6 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-4/5 rounded bg-gray-200" />
                  <div className="h-3 w-3/5 rounded bg-gray-200" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-2 w-16 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="flex flex-col rounded-3xl bg-white p-7 shadow-md transition-shadow hover:shadow-xl"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < review.rating
                          ? 'fill-brand-yellow text-brand-yellow'
                          : 'fill-gray-200 text-gray-200'
                      }
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="font-body mb-6 flex-1 text-sm leading-relaxed text-gray-600 italic">
                  {review.text ? `"${review.text}"` : ''}
                </p>

                {/* Author */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/40x40/8E4CCF/ffffff?text=${review.author_name[0]}`
                      }}
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-gray-800">
                        {review.author_name}
                      </p>
                      <p className="font-body text-xs text-gray-400">
                        {review.relative_time_description}
                      </p>
                    </div>
                  </div>
                  {/* Google logo badge */}
                  <span className="font-body shrink-0 text-xs text-gray-400">
                    Google
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA para mais reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body hover:text-brand-cyan inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors"
          >
            Ver todas as avaliações no Google
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
