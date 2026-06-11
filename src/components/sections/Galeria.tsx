'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import type { InstagramPost } from '@/app/api/instagram/route'

export default function Galeria() {
  const [posts, setPosts] = useState<InstagramPost[]>([])

  // Duplica os slides para garantir que o loop não abra lacuna
  const slides =
    posts.length > 0 && posts.length < 10 ? [...posts, ...posts] : posts

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    fetch('/api/instagram')
      .then((r) => r.json())
      .then(setPosts)
      .catch(console.error)
  }, [])

  return (
    <section className="section-padding overflow-hidden bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <a
            href="https://www.instagram.com/divercity.park"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-purple font-body mb-3 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-pink-100 to-purple-100 px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
          >
            <Camera size={14} />
            @divercity.park
          </a>
          <h2 className="font-heading mb-4 text-4xl font-bold text-gray-800 md:text-5xl">
            Siga nosso Instagram
          </h2>
          <p className="font-body text-lg text-gray-500">
            Fique por dentro de tudo que acontece no Divercity Park!
          </p>
        </motion.div>

        {Boolean(posts && posts.length) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex cursor-grab active:cursor-grabbing">
                {slides.map((post, i) => {
                  const src =
                    post.media_type === 'VIDEO'
                      ? post.thumbnail_url!
                      : post.media_url
                  return (
                    <div
                      key={`${post.id}-${i}`}
                      className="w-52 flex-none pl-4 sm:w-64 md:w-72"
                    >
                      <motion.a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.04 }}
                        className="relative block aspect-square overflow-hidden rounded-2xl shadow-md"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt="Post Instagram Divercity Park"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity hover:opacity-100">
                          <Camera size={20} className="text-white" />
                        </div>
                      </motion.a>
                    </div>
                  )
                })}

                {/* Skeleton enquanto carrega */}
                {posts.length === 0 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-52 flex-none pl-4 sm:w-64 md:w-72"
                    >
                      <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={scrollPrev}
              className="hover:bg-brand-cyan absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:text-white"
              aria-label="Post anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              className="hover:bg-brand-cyan absolute top-1/2 right-0 z-10 flex h-10 w-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:text-white"
              aria-label="Próximo post"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
