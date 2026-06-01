'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import type { InstagramPost } from '@/app/api/instagram/route'

export default function Galeria() {
  const [posts, setPosts] = useState<InstagramPost[]>([])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
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
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <a
            href="https://www.instagram.com/divercity.park"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-pink-100 to-purple-100 text-brand-purple font-body font-semibold text-sm mb-3 hover:opacity-80 transition-opacity"
          >
            <Camera size={14} />
            @divercity.park
          </a>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Siga nosso Instagram
          </h2>
          <p className="font-body text-gray-500 text-lg">
            Fique por dentro de tudo que acontece no Divercity Park!
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4 cursor-grab active:cursor-grabbing">
              {posts.map((post) => {
                const src = post.media_type === 'VIDEO' ? post.thumbnail_url! : post.media_url
                return (
                  <div key={post.id} className="flex-none w-52 sm:w-64 md:w-72">
                    <motion.a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.04 }}
                      className="relative rounded-2xl overflow-hidden shadow-md aspect-square block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt="Post Instagram Divercity Park"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                        <Camera size={20} className="text-white" />
                      </div>
                    </motion.a>
                  </div>
                )
              })}

              {/* Skeleton enquanto carrega */}
              {posts.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-none w-52 sm:w-64 md:w-72">
                    <div className="rounded-2xl bg-gray-200 animate-pulse aspect-square" />
                  </div>
                ))}
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-brand-cyan hover:text-white transition-colors z-10"
            aria-label="Post anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-brand-cyan hover:text-white transition-colors z-10"
            aria-label="Próximo post"
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
