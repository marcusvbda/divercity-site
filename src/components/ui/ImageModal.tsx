'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ImageModalProps {
  src: string
  alt: string
  titulo?: string
  descricao?: string
  onClose: () => void
}

export default function ImageModal({ src, alt, titulo, descricao, onClose }: ImageModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-3xl rounded-3xl overflow-hidden bg-white shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full object-cover max-h-[70vh]"
          />

          {/* Caption (only when titulo is provided) */}
          {titulo && (
            <div className="p-6">
              <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">{titulo}</h3>
              {descricao && (
                <p className="font-body text-gray-600 text-sm leading-relaxed">{descricao}</p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
