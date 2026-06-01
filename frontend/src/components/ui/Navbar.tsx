'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/data'

export default function Navbar({ logo }: { logo: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container-max px-4 md:px-8 lg:px-16">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#inicio')}
            className="flex flex-shrink-0 items-center gap-2"
            aria-label="Ir para o início"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt="Divercity Park"
              className="relative top-3 h-30 w-40 object-contain md:h-30 md:w-44 lg:h-30"
            />
          </button>

          {/* Desktop Nav */}
          <ul className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`font-body hover:text-brand-cyan text-sm font-medium transition-colors lg:text-base ${
                    scrolled ? 'text-gray-700' : 'text-white/90'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNavClick('#festas')}
              className="bg-brand-pink font-body hidden items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition-colors hover:bg-pink-600 md:flex"
            >
              Reservar Festa
            </motion.button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`rounded-lg p-2 transition-colors md:hidden ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-3 px-4 py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="font-body hover:text-brand-cyan w-full py-2 text-left font-medium text-gray-700 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavClick('#festas')}
                  className="bg-brand-pink font-body mt-2 w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
                >
                  Reservar Festa
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
