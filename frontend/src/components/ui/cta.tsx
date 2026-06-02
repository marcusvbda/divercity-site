'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function CtaButton({ className, onClick, cta, children }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'font-body rounded-full border-2 px-8 py-4 text-lg font-bold transition-all hover:border-[var(--hover-border)] hover:bg-[var(--hover-bg-color)] hover:text-[var(--hover-color)]',
        className
      )}
      style={
        {
          backgroundColor: cta?.bgColor,
          color: cta?.color,
          border: cta?.border ?? 'none',
          '--hover-border': cta?.hoverBorder ?? cta?.border ?? 'none',
          '--hover-color': cta?.hoverColor ?? cta?.color,
          '--hover-bg-color': cta?.hoverBgColor ?? cta?.bgColor,
        } as any
      }
    >
      {children}
    </motion.button>
  )
}
