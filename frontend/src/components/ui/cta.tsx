'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function CtaButton({
  className,
  onClick,
  bgColor,
  color,
  border,
  hoverBorder,
  hoverColor,
  hoverBgColor,
  children,
}: any) {
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
          backgroundColor: bgColor,
          color,
          border: border ?? 'none',
          '--hover-border': hoverBorder ?? border ?? 'none',
          '--hover-color': hoverColor ?? color,
          '--hover-bg-color': hoverBgColor ?? bgColor,
        } as any
      }
    >
      {children}
    </motion.button>
  )
}
