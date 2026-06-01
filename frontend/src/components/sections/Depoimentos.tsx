'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import type { GoogleReview } from '@/app/api/reviews/route'

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=divercity+park+maringa&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOR_pn53xisvuq5RbfvyjgFC2gP_5ZrdZN-OPoiE-STyFLxWtVkGvQNylunxoJWaJ4MZ9qzI%3D'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function Depoimentos() {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => { setReviews(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            ⭐ Avaliações Google
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Famílias felizes são nossa maior conquista.
          </p>
        </motion.div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-md animate-pulse">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="w-4 h-4 rounded bg-gray-200" />
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-3/5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-2 bg-gray-200 rounded w-16" />
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-7 shadow-md hover:shadow-xl transition-shadow flex flex-col"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
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
                <p className="font-body text-gray-600 text-sm leading-relaxed mb-6 italic flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/40x40/8E4CCF/ffffff?text=${review.author_name[0]}`
                      }}
                    />
                    <div>
                      <p className="font-body font-semibold text-gray-800 text-sm">
                        {review.author_name}
                      </p>
                      <p className="font-body text-gray-400 text-xs">
                        {review.relative_time_description}
                      </p>
                    </div>
                  </div>
                  {/* Google logo badge */}
                  <span className="text-xs text-gray-400 font-body shrink-0">Google</span>
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
          className="text-center mt-10"
        >
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-semibold text-gray-500 hover:text-brand-cyan transition-colors"
          >
            Ver todas as avaliações no Google
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
