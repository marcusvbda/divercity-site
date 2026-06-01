# Divercity Park Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete production-quality frontend boilerplate for Divercity Park — indoor family entertainment center website — fully in Brazilian Portuguese, in `/frontend`.

**Architecture:** Single-page Next.js 16 App Router app. All sections assembled in `page.tsx`. Each section is a standalone `'use client'` component in `src/components/sections/`. Static content lives in `src/lib/data.ts`. Framer Motion drives all animations via `useInView` scroll reveals. Embla Carousel powers the Instagram gallery.

**Tech Stack:** Next.js 16 (App Router, React Compiler), TypeScript, Tailwind CSS v3, Framer Motion, shadcn/ui, Lucide Icons, React Hook Form, Zod, Embla Carousel.

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/types/index.ts` | TypeScript interfaces for all data shapes |
| `src/lib/data.ts` | All static content (attractions, prices, testimonials) |
| `src/lib/utils.ts` | `cn()` helper (created by shadcn/ui init) |
| `src/app/layout.tsx` | Root layout — fonts, metadata, body |
| `src/app/globals.css` | Tailwind directives, CSS vars, utility classes |
| `src/app/page.tsx` | Assembles all sections |
| `src/components/ui/Navbar.tsx` | Sticky nav, scroll-aware, mobile hamburger |
| `src/components/sections/Hero.tsx` | Full-screen hero, floating elements, CTAs |
| `src/components/sections/Benefits.tsx` | 3 benefit cards |
| `src/components/sections/Atracoes.tsx` | Attractions image grid |
| `src/components/sections/PorQueEscolher.tsx` | 6 why-choose cards |
| `src/components/sections/Festas.tsx` | Party section, yellow bg |
| `src/components/sections/Precos.tsx` | Pricing cards |
| `src/components/sections/Galeria.tsx` | Embla Instagram carousel |
| `src/components/sections/Depoimentos.tsx` | Testimonial cards |
| `src/components/sections/Contato.tsx` | Contact form (RHF + Zod) |
| `src/components/sections/Footer.tsx` | Dark-purple footer |
| `tailwind.config.ts` | Brand colors, fonts, custom animations |
| `next.config.ts` | React Compiler, image domains |
| `public/logo-ball.png` | Logo asset (copied from docs/images) |

---

### Task 1: Scaffold Next.js 16 project in /frontend

**Files:**
- Create: `frontend/` (entire scaffold)
- Create: `frontend/public/logo-ball.png`

- [ ] **Step 1: Run create-next-app from project root**

```bash
cd /Users/mvbassalobre/Projects/divercity-site
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack \
  --eslint
```

When prompted for any interactive choices, accept defaults.

Expected output ends with: `Success! Created frontend`

- [ ] **Step 2: Verify scaffold structure**

```bash
ls /Users/mvbassalobre/Projects/divercity-site/frontend/src/app/
```

Expected: `favicon.ico  globals.css  layout.tsx  page.tsx`

- [ ] **Step 3: Install React Compiler plugin**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend
npm install babel-plugin-react-compiler@experimental --save-dev
```

Expected: Package added to devDependencies.

- [ ] **Step 4: Copy logo to public folder**

```bash
cp /Users/mvbassalobre/Projects/divercity-site/docs/images/logo-ball.png \
   /Users/mvbassalobre/Projects/divercity-site/frontend/public/logo-ball.png
```

- [ ] **Step 5: Commit**

```bash
cd /Users/mvbassalobre/Projects/divercity-site
git add frontend/
git commit -m "feat: scaffold Next.js 16 frontend project"
```

---

### Task 2: Install additional dependencies

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/.prettierrc`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend
npm install \
  framer-motion \
  lucide-react \
  embla-carousel-react \
  embla-carousel-autoplay \
  react-hook-form \
  @hookform/resolvers \
  zod \
  clsx \
  tailwind-merge \
  class-variance-authority \
  tailwindcss-animate
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

- [ ] **Step 3: Create .prettierrc**

Write this file to `frontend/.prettierrc`:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 4: Verify key packages are present**

```bash
cat package.json | grep -E '"framer-motion|embla-carousel|react-hook-form|zod"'
```

Expected: 4 lines, one per package.

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat: install additional frontend dependencies"
```

---

### Task 3: Initialize shadcn/ui and add components

**Files:**
- Create: `frontend/components.json`
- Modify: `frontend/src/lib/utils.ts` (auto-generated)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

- [ ] **Step 2: Add required UI components**

```bash
npx shadcn@latest add button card input textarea label badge separator
```

- [ ] **Step 3: Verify components directory**

```bash
ls src/components/ui/
```

Expected output contains: `button.tsx  card.tsx  input.tsx  textarea.tsx  label.tsx  badge.tsx`

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: initialize shadcn/ui with base components"
```

---

### Task 4: Configure Tailwind CSS with brand system

**Files:**
- Modify: `frontend/tailwind.config.ts`

- [ ] **Step 1: Replace tailwind.config.ts entirely**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#12C7C8',
          purple: '#8E4CCF',
          pink: '#FF4F8A',
          lime: '#9AD94B',
          yellow: '#FFD23F',
        },
      },
      fontFamily: {
        heading: ['var(--font-fredoka)', 'sans-serif'],
        body: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

- [ ] **Step 2: Replace globals.css entirely**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --radius: 0.75rem;
  }

  html {
    scroll-behavior: smooth;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-poppins), sans-serif;
    background-color: #ffffff;
    color: #1a1a2e;
    overflow-x: hidden;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-fredoka), sans-serif;
    font-weight: 600;
  }
}

@layer utilities {
  .section-padding {
    @apply py-16 px-4 md:py-24 md:px-8 lg:px-16;
  }

  .container-max {
    @apply max-w-7xl mx-auto;
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: configure Tailwind with brand colors and utility classes"
```

---

### Task 5: Configure next.config.ts and root layout with fonts

**Files:**
- Modify: `frontend/next.config.ts`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Replace next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Replace src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Fredoka, Poppins } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Divercity Park — Diversão para toda a família',
  description:
    'Divercity Park é o melhor parque indoor da região. Festas de aniversário, mais de 10 atrações, área para pais e muito mais. Reserve sua festa agora!',
  keywords: [
    'parque infantil',
    'festa infantil',
    'aniversário criança',
    'diversão indoor',
    'Divercity Park',
  ],
  openGraph: {
    title: 'Divercity Park — Diversão para toda a família',
    description:
      'Festas inesquecíveis e mais de 10 atrações para toda a família.',
    type: 'website',
    images: [{ url: '/logo-ball.png', width: 512, height: 512 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: configure next.config and root layout with Google Fonts"
```

---

### Task 6: Types and static data layer

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/lib/data.ts`

- [ ] **Step 1: Create src/types/index.ts**

```typescript
export interface Atracao {
  id: number
  nome: string
  descricao: string
  imagem: string
  cor: string
}

export interface BeneficioCard {
  titulo: string
  descricao: string
  iconeName: string
  gradiente: string
}

export interface PriceTier {
  label: string
  valor: number
}

export interface PriceGroup {
  titulo: string
  subtitulo: string
  cor: string
  tiers: PriceTier[]
}

export interface Depoimento {
  id: number
  nome: string
  estrelas: number
  texto: string
  avatar: string
}

export interface NavItem {
  label: string
  href: string
}
```

- [ ] **Step 2: Create src/lib/data.ts**

```typescript
import type { Atracao, BeneficioCard, PriceGroup, Depoimento, NavItem } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Início', href: '#inicio' },
  { label: 'Atrações', href: '#atracoes' },
  { label: 'Festas', href: '#festas' },
  { label: 'Preços', href: '#precos' },
  { label: 'Contato', href: '#contato' },
]

export const ATRACOES: Atracao[] = [
  {
    id: 1,
    nome: 'Arco do Totem Elétrico',
    descricao: 'Diversão elétrica com jogos interativos e muita adrenalina para toda a família.',
    imagem: 'https://placehold.co/600x400/12C7C8/ffffff?text=Arco+do+Totem+Elétrico',
    cor: '#12C7C8',
  },
  {
    id: 2,
    nome: 'Guerreiro Ninja',
    descricao: 'Supere obstáculos ninjas e mostre suas habilidades neste percurso radical.',
    imagem: 'https://placehold.co/600x400/8E4CCF/ffffff?text=Guerreiro+Ninja',
    cor: '#8E4CCF',
  },
  {
    id: 3,
    nome: 'Parede de Escalada',
    descricao: 'Escale paredes desafiadoras com segurança e equipamentos profissionais.',
    imagem: 'https://placehold.co/600x400/FF4F8A/ffffff?text=Parede+de+Escalada',
    cor: '#FF4F8A',
  },
  {
    id: 4,
    nome: 'Escalada Radical',
    descricao: 'Para os mais corajosos: escalada em altura com vista panorâmica do parque.',
    imagem: 'https://placehold.co/600x400/9AD94B/ffffff?text=Escalada+Radical',
    cor: '#9AD94B',
  },
  {
    id: 5,
    nome: 'Sala de Festas',
    descricao: 'Espaço exclusivo e decorado para tornar seu aniversário inesquecível.',
    imagem: 'https://placehold.co/600x400/FFD23F/333333?text=Sala+de+Festas',
    cor: '#FFD23F',
  },
  {
    id: 6,
    nome: 'Pule Aqui!',
    descricao: 'Camas elásticas e trampolins para pular, girar e se divertir sem parar.',
    imagem: 'https://placehold.co/600x400/12C7C8/ffffff?text=Pule+Aqui',
    cor: '#12C7C8',
  },
  {
    id: 7,
    nome: 'Bar e Petisqueria',
    descricao: 'Lanches, sucos e refeições gostosas para repor as energias durante a diversão.',
    imagem: 'https://placehold.co/600x400/8E4CCF/ffffff?text=Bar+e+Petisqueria',
    cor: '#8E4CCF',
  },
]

export const BENEFICIOS_CARDS: BeneficioCard[] = [
  {
    titulo: 'Segurança Total',
    descricao:
      'Monitoramento 24h, equipe treinada e equipamentos certificados para a segurança das crianças.',
    iconeName: 'Shield',
    gradiente: 'from-brand-cyan to-brand-purple',
  },
  {
    titulo: 'Diversão para Todas as Idades',
    descricao:
      'Atrações para crianças de todas as idades, de 2 a 12 anos, com supervisão especializada.',
    iconeName: 'Users',
    gradiente: 'from-brand-purple to-brand-pink',
  },
  {
    titulo: 'Festas Personalizadas',
    descricao:
      'Pacotes completos de aniversário com decoração, buffet e toda a organização por nossa conta.',
    iconeName: 'PartyPopper',
    gradiente: 'from-brand-pink to-brand-yellow',
  },
  {
    titulo: 'Localização Conveniente',
    descricao: 'Fácil acesso, estacionamento gratuito e localização central para toda a família.',
    iconeName: 'MapPin',
    gradiente: 'from-brand-yellow to-brand-lime',
  },
  {
    titulo: 'Alimentação Saborosa',
    descricao:
      'Lanchonete completa com opções saudáveis, petiscos e área de lounge para os pais.',
    iconeName: 'UtensilsCrossed',
    gradiente: 'from-brand-lime to-brand-cyan',
  },
  {
    titulo: 'Atendimento Especializado',
    descricao:
      'Equipe dedicada, atenciosa e apaixonada por proporcionar experiências incríveis.',
    iconeName: 'HeartHandshake',
    gradiente: 'from-brand-cyan to-brand-pink',
  },
]

export const PRECOS: PriceGroup[] = [
  {
    titulo: 'Segunda a Sexta',
    subtitulo: 'Agendamento Feria',
    cor: '#12C7C8',
    tiers: [
      { label: 'Até 5 anos', valor: 45 },
      { label: 'A partir de 5 anos', valor: 55 },
    ],
  },
  {
    titulo: 'Sábado',
    subtitulo: 'Fim de Semana',
    cor: '#8E4CCF',
    tiers: [
      { label: 'Até 5 anos', valor: 60 },
      { label: 'A partir de 5 anos', valor: 70 },
    ],
  },
  {
    titulo: 'Domingo e Feriado',
    subtitulo: 'Domingo e Feriado',
    cor: '#FF4F8A',
    tiers: [
      { label: 'Até 5 anos', valor: 75 },
      { label: 'A partir de 5 anos', valor: 85 },
      { label: 'Até 5 anos (pacote)', valor: 90 },
      { label: 'A partir de 5 anos (pacote)', valor: 100 },
    ],
  },
]

export const DEPOIMENTOS: Depoimento[] = [
  {
    id: 1,
    nome: 'Fernanda',
    estrelas: 5,
    texto:
      'Festa incrível! Meu filho adorou cada detalhe. A equipe foi super atenciosa e tudo ficou perfeito. Com certeza voltaremos!',
    avatar: 'https://placehold.co/80x80/FF4F8A/ffffff?text=F',
  },
  {
    id: 2,
    nome: 'Ricardo',
    estrelas: 5,
    texto:
      'Melhor parque indoor da região! As crianças ficaram horas se divertindo nas atrações. Estrutura impecável e equipe muito profissional.',
    avatar: 'https://placehold.co/80x80/8E4CCF/ffffff?text=R',
  },
  {
    id: 3,
    nome: 'Adriana',
    estrelas: 5,
    texto:
      'Atendimento excepcional desde o primeiro contato. A festa do meu filho foi um sonho. Recomendo para todos os pais!',
    avatar: 'https://placehold.co/80x80/12C7C8/ffffff?text=A',
  },
]

export const INSTAGRAM_POSTS: string[] = [
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+1',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+2',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+3',
  'https://placehold.co/400x400/9AD94B/ffffff?text=Post+4',
  'https://placehold.co/400x400/FFD23F/333333?text=Post+5',
  'https://placehold.co/400x400/12C7C8/ffffff?text=Post+6',
  'https://placehold.co/400x400/8E4CCF/ffffff?text=Post+7',
  'https://placehold.co/400x400/FF4F8A/ffffff?text=Post+8',
]
```

- [ ] **Step 3: Verify TypeScript compiles with no errors**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add TypeScript types and static data layer"
```

---

### Task 7: Navbar component

**Files:**
- Create: `frontend/src/components/ui/Navbar.tsx`

- [ ] **Step 1: Create src/components/ui/Navbar.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/data'

export default function Navbar() {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('#inicio')}
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Ir para o início"
          >
            <Image
              src="/logo-ball.png"
              alt="Divercity Park"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12"
              priority
            />
            <span
              className={`font-heading font-bold text-lg hidden sm:block transition-colors ${
                scrolled ? 'text-brand-purple' : 'text-white'
              }`}
            >
              Divercity Park
            </span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`font-body font-medium text-sm lg:text-base transition-colors hover:text-brand-cyan ${
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
              className="hidden md:flex items-center px-5 py-2.5 rounded-full bg-brand-pink text-white font-body font-semibold text-sm shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors"
            >
              Reservar Festa
            </motion.button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
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
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 overflow-hidden"
          >
            <ul className="px-4 py-4 flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="w-full text-left font-body font-medium text-gray-700 py-2 hover:text-brand-cyan transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavClick('#festas')}
                  className="w-full mt-2 px-5 py-3 rounded-full bg-brand-pink text-white font-body font-semibold text-sm hover:bg-pink-600 transition-colors"
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Navbar with sticky scroll-aware behavior and mobile menu"
```

---

### Task 8: Hero section

**Files:**
- Create: `frontend/src/components/sections/Hero.tsx`

- [ ] **Step 1: Create src/components/sections/Hero.tsx**

```tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const FLOATING_ELEMENTS = [
  { color: '#12C7C8', size: 80, left: '8%', top: '20%', delay: 0, duration: 3 },
  { color: '#8E4CCF', size: 60, left: '88%', top: '15%', delay: 0.5, duration: 4 },
  { color: '#FF4F8A', size: 100, left: '5%', top: '70%', delay: 1, duration: 3.5 },
  { color: '#9AD94B', size: 50, left: '92%', top: '65%', delay: 0.8, duration: 2.8 },
  { color: '#FFD23F', size: 70, left: '80%', top: '45%', delay: 0.3, duration: 4.2 },
  { color: '#12C7C8', size: 40, left: '15%', top: '50%', delay: 1.2, duration: 3.2 },
]

export default function Hero() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1920x1080/1a1a2e/12C7C8?text=Divercity+Park"
          alt="Divercity Park - Parque Indoor"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
      </div>

      {/* Floating decorative elements */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-25 blur-sm pointer-events-none"
          style={{
            backgroundColor: el.color,
            width: el.size,
            height: el.size,
            left: el.left,
            top: el.top,
          }}
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 container-max px-4 md:px-8 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center mb-8"
        >
          <Image
            src="/logo-ball.png"
            alt="Divercity Park"
            width={160}
            height={160}
            className="w-28 h-28 md:w-40 md:h-40 drop-shadow-2xl"
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
        >
          Diversão para{' '}
          <span className="text-brand-cyan">toda a família</span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          className="font-body text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Mais de 10 atrações incríveis, festas personalizadas inesquecíveis e um ambiente
          seguro e acolhedor para toda a família criar memórias juntos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#festas')}
            className="px-8 py-4 rounded-full bg-brand-pink text-white font-body font-bold text-lg shadow-lg shadow-pink-500/40 hover:bg-pink-600 transition-colors"
          >
            Reservar Festa
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollTo('#atracoes')}
            className="px-8 py-4 rounded-full border-2 border-white text-white font-body font-bold text-lg hover:bg-white hover:text-brand-purple transition-all"
          >
            Ver Atrações
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/60 flex items-start justify-center pt-1.5">
          <div className="w-1.5 h-3 rounded-full bg-white/80" />
        </div>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Hero section with parallax background and floating elements"
```

---

### Task 9: Benefits section

**Files:**
- Create: `frontend/src/components/sections/Benefits.tsx`

- [ ] **Step 1: Create src/components/sections/Benefits.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { PartyPopper, Layers, Users } from 'lucide-react'

const BENEFITS = [
  {
    icon: PartyPopper,
    titulo: 'Festas Incríveis',
    descricao:
      'Festas de aniversário personalizadas com toda a decoração e estrutura para um dia inesquecível.',
    cor: '#FF4F8A',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  {
    icon: Layers,
    titulo: 'Mais de 10 Atrações',
    descricao:
      'Diversão garantida para crianças de todas as idades com atrações variadas e seguras.',
    cor: '#12C7C8',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: Users,
    titulo: 'Área para Pais',
    descricao:
      'Espaço confortável e acolhedor para os pais relaxarem enquanto as crianças se divertem.',
    cor: '#8E4CCF',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Benefits() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16 bg-white">
      <div className="container-max">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {BENEFITS.map((b) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.titulo}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`${b.bg} ${b.border} border rounded-3xl p-8 flex flex-col items-center text-center cursor-default`}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: b.cor + '20' }}
                >
                  <Icon size={32} style={{ color: b.cor }} />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-800 mb-3">
                  {b.titulo}
                </h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed">{b.descricao}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Benefits section with 3 feature cards"
```

---

### Task 10: Atrações section

**Files:**
- Create: `frontend/src/components/sections/Atracoes.tsx`

- [ ] **Step 1: Create src/components/sections/Atracoes.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { ATRACOES } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function Atracoes() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="atracoes" className="section-padding bg-gray-50">
      <div className="container-max">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 text-brand-cyan font-body font-semibold text-sm mb-3">
            Explore o Parque
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Nossas Atrações
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Mais de 10 atrações para crianças de todas as idades. Aventura, diversão e segurança
            em um só lugar.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {ATRACOES.map((atracao) => (
            <motion.div
              key={atracao.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="relative h-52 w-full">
                <Image
                  src={atracao.imagem}
                  alt={atracao.nome}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: atracao.cor }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading text-white text-lg font-semibold leading-tight">
                  {atracao.nome}
                </h3>
                <p className="font-body text-white/70 text-xs mt-1 line-clamp-2">
                  {atracao.descricao}
                </p>
              </div>
            </motion.div>
          ))}

          {/* CTA card */}
          <motion.button
            variants={itemVariants}
            whileHover={{ y: -8 }}
            onClick={() =>
              document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-brand-purple to-brand-pink flex flex-col items-center justify-center p-8 text-center min-h-[208px]"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ArrowRight size={24} className="text-white" />
            </div>
            <h3 className="font-heading text-white text-xl font-bold mb-2">+ mais Atrações</h3>
            <p className="font-body text-white/80 text-sm">Venha descobrir todas as nossas atrações!</p>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Atrações section with staggered image card grid"
```

---

### Task 11: PorQueEscolher section

**Files:**
- Create: `frontend/src/components/sections/PorQueEscolher.tsx`

- [ ] **Step 1: Create src/components/sections/PorQueEscolher.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Shield,
  Users,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  HeartHandshake,
} from 'lucide-react'
import { BENEFICIOS_CARDS } from '@/lib/data'

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Users,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  HeartHandshake,
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function PorQueEscolher() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple font-body font-semibold text-sm mb-3">
            Nossos Diferenciais
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Por que as famílias escolhem o{' '}
            <span className="text-brand-purple">Divercity Park?</span>
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Mais do que um parque — somos uma experiência completa para toda a família.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {BENEFICIOS_CARDS.map((b) => {
            const Icon = ICON_MAP[b.iconeName]
            return (
              <motion.div
                key={b.titulo}
                variants={itemVariants}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.gradiente} flex items-center justify-center mb-5 shadow-md`}
                >
                  {Icon && <Icon size={28} className="text-white" />}
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-800 mb-2">
                  {b.titulo}
                </h3>
                <p className="font-body text-gray-500 text-sm leading-relaxed">{b.descricao}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add PorQueEscolher section with 6 benefit cards"
```

---

### Task 12: Festas e Aniversários section

**Files:**
- Create: `frontend/src/components/sections/Festas.tsx`

- [ ] **Step 1: Create src/components/sections/Festas.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const PARTY_FEATURES = [
  'Decoração temática personalizada',
  'Buffet completo para crianças e adultos',
  'Animadores e recreadores especializados',
  'Acesso exclusivo às atrações do parque',
  'Sala de festas climatizada e moderna',
  'Cardápio especial de aniversário',
]

const PARTY_IMAGES = [
  'https://placehold.co/600x350/FF4F8A/ffffff?text=Decoração+Festa',
  'https://placehold.co/400x300/FFD23F/333333?text=Bolo+Aniversário',
  'https://placehold.co/400x300/9AD94B/ffffff?text=Crianças+Brincando',
  'https://placehold.co/400x300/8E4CCF/ffffff?text=Celebração',
]

export default function Festas() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="festas"
      className="section-padding relative overflow-hidden"
      style={{ backgroundColor: '#FFF8E7' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: '#FFD23F' }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: '#9AD94B' }}
      />

      <div className="container-max relative z-10">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-pink/10 text-brand-pink font-body font-semibold text-sm mb-4">
              🎂 Celebrações Especiais
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-5 leading-tight">
              Festas e Aniversários{' '}
              <span className="text-brand-pink">Inesquecíveis!</span>
            </h2>
            <p className="font-body text-gray-600 text-lg leading-relaxed mb-7">
              Transformamos o aniversário do seu filho em um momento mágico. Cuidamos de cada
              detalhe para que você e sua família só precisem curtir a festa.
            </p>

            <ul className="space-y-3 mb-8">
              {PARTY_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-brand-lime flex-shrink-0" />
                  <span className="font-body text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 rounded-full bg-brand-pink text-white font-body font-bold text-base shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors"
              >
                Solicitar Orçamento
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  document.querySelector('#precos')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 rounded-full border-2 border-gray-800 text-gray-800 font-body font-bold text-base hover:bg-gray-800 hover:text-white transition-all"
              >
                Ver Preços
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Image grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3"
          >
            {/* First image spans full width */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative col-span-2 h-52 rounded-2xl overflow-hidden shadow-md"
            >
              <Image
                src={PARTY_IMAGES[0]}
                alt="Decoração de festa"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            {/* Remaining 3 images side by side */}
            {PARTY_IMAGES.slice(1).map((src, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="relative h-36 rounded-2xl overflow-hidden shadow-md"
              >
                <Image
                  src={src}
                  alt={`Festa ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Festas section with party features and image grid"
```

---

### Task 13: Preços section

**Files:**
- Create: `frontend/src/components/sections/Precos.tsx`

- [ ] **Step 1: Create src/components/sections/Precos.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { PRECOS } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Precos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="precos" className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            Investimento
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Preços
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Escolha o melhor dia para a sua visita. Crianças menores de 2 anos não pagam.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PRECOS.map((group) => (
            <motion.div
              key={group.titulo}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Header */}
              <div className="p-6 text-white" style={{ backgroundColor: group.cor }}>
                <p className="font-body text-sm font-medium opacity-80 mb-1">
                  {group.subtitulo}
                </p>
                <h3 className="font-heading text-2xl font-bold">{group.titulo}</h3>
              </div>

              {/* Tiers */}
              <div className="p-6 space-y-4">
                {group.tiers.map((tier, ti) => (
                  <div
                    key={ti}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="font-body text-gray-600 text-sm">{tier.label}</span>
                    <span
                      className="font-heading text-2xl font-bold"
                      style={{ color: group.cor }}
                    >
                      R${tier.valor}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={() =>
                    document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="w-full py-3 rounded-2xl font-body font-semibold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: group.cor }}
                >
                  Reservar agora
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center font-body text-sm text-gray-400 mt-8"
        >
          * Crianças até 2 anos não pagam. Adultos acompanhantes têm acesso gratuito.
        </motion.p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Preços section with 3 pricing tier cards"
```

---

### Task 14: Galeria Instagram section

**Files:**
- Create: `frontend/src/components/sections/Galeria.tsx`

- [ ] **Step 1: Create src/components/sections/Galeria.tsx**

```tsx
'use client'

import { useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react'
import { INSTAGRAM_POSTS } from '@/lib/data'

export default function Galeria() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <a
            href="https://instagram.com/divercitypark"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-brand-purple font-body font-semibold text-sm mb-3 hover:opacity-80 transition-opacity"
          >
            <Instagram size={14} />
            @divercitypark
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
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4 cursor-grab active:cursor-grabbing">
              {INSTAGRAM_POSTS.map((src, i) => (
                <div key={i} className="flex-none w-52 sm:w-64 md:w-72">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className="relative rounded-2xl overflow-hidden shadow-md aspect-square"
                  >
                    <Image
                      src={src}
                      alt={`Post Instagram ${i + 1}`}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                      <Instagram size={20} className="text-white" />
                    </div>
                  </motion.div>
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
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Galeria Instagram section with Embla auto-scroll carousel"
```

---

### Task 15: Depoimentos section

**Files:**
- Create: `frontend/src/components/sections/Depoimentos.tsx`

- [ ] **Step 1: Create src/components/sections/Depoimentos.tsx**

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { DEPOIMENTOS } from '@/lib/data'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Depoimentos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow/20 text-yellow-700 font-body font-semibold text-sm mb-3">
            ⭐ Avaliações
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="font-body text-gray-500 text-lg max-w-xl mx-auto">
            Famílias felizes são nossa maior conquista.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {DEPOIMENTOS.map((dep) => (
            <motion.div
              key={dep.id}
              variants={itemVariants}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-7 shadow-md hover:shadow-xl transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: dep.estrelas }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-brand-yellow text-brand-yellow"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-gray-600 text-sm leading-relaxed mb-6 italic">
                &ldquo;{dep.texto}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={dep.avatar}
                    alt={dep.nome}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-body font-semibold text-gray-800 text-sm">{dep.nome}</p>
                  <p className="font-body text-gray-400 text-xs">Cliente verificado</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: add Depoimentos section with star-rated testimonial cards"
```

---

### Task 16: Contato section with validated form

**Files:**
- Create: `frontend/src/components/sections/Contato.tsx`

- [ ] **Step 1: Create src/components/sections/Contato.tsx**

```tsx
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
  Instagram,
  Facebook,
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
    icon: Instagram,
    label: 'Instagram',
    href: 'https://instagram.com/divercitypark',
    color: '#FF4F8A',
  },
  { icon: Facebook, label: 'Facebook', href: '#', color: '#8E4CCF' },
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
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Contato section with React Hook Form and Zod validation"
```

---

### Task 17: Footer section

**Files:**
- Create: `frontend/src/components/sections/Footer.tsx`

- [ ] **Step 1: Create src/components/sections/Footer.tsx**

```tsx
import Image from 'next/image'
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Clock } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/data'

export default function Footer() {
  return (
    <footer className="bg-brand-purple text-white">
      <div className="container-max px-4 md:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-ball.png"
                alt="Divercity Park"
                width={64}
                height={64}
                className="w-16 h-16"
              />
              <div>
                <p className="font-heading text-xl font-bold">Divercity Park</p>
                <p className="font-body text-white/60 text-xs">Diversão para toda família</p>
              </div>
            </div>
            <p className="font-body text-white/70 text-sm leading-relaxed">
              O melhor parque indoor da região para festas de aniversário e diversão em família.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Links Rápidos</h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="font-body text-white/70 text-sm hover:text-brand-cyan transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                <p className="font-body text-white/70 text-sm">
                  Divercity Park — consulte endereço no Google Maps
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-brand-cyan flex-shrink-0" />
                <p className="font-body text-white/70 text-sm">Consulte via Instagram</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-brand-cyan mt-0.5 flex-shrink-0" />
                <p className="font-body text-white/70 text-sm">
                  Seg–Sex: 14h às 20h
                  <br />
                  Sáb–Dom e Feriados: 10h às 20h
                </p>
              </div>
            </div>
          </div>

          {/* Social + mini map */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-5">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              {[
                {
                  icon: Instagram,
                  href: 'https://instagram.com/divercitypark',
                  label: 'Instagram',
                  color: '#FF4F8A',
                },
                { icon: Facebook, href: '#', label: 'Facebook', color: '#12C7C8' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp', color: '#9AD94B' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon size={18} style={{ color: s.color }} />
                  </a>
                )
              })}
            </div>
            <div className="rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://placehold.co/300x150/5b2f9e/ffffff?text=Mapa+Divercity+Park"
                alt="Mapa Divercity Park"
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/50 text-sm">
            © 2024 Divercity Park. Todos os direitos reservados.
          </p>
          <p className="font-body text-white/40 text-xs">Diversão para toda a família</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add Footer with links, contact info, social media and mini map"
```

---

### Task 18: Assemble page.tsx and verify full build

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Replace src/app/page.tsx with full section assembly**

```tsx
import Navbar from '@/components/ui/Navbar'
import Hero from '@/components/sections/Hero'
import Benefits from '@/components/sections/Benefits'
import Atracoes from '@/components/sections/Atracoes'
import PorQueEscolher from '@/components/sections/PorQueEscolher'
import Festas from '@/components/sections/Festas'
import Precos from '@/components/sections/Precos'
import Galeria from '@/components/sections/Galeria'
import Depoimentos from '@/components/sections/Depoimentos'
import Contato from '@/components/sections/Contato'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Atracoes />
        <PorQueEscolher />
        <Festas />
        <Precos />
        <Galeria />
        <Depoimentos />
        <Contato />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd /Users/mvbassalobre/Projects/divercity-site/frontend && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Output ends with `✓ Compiled successfully` and `Route (app) /` listed with no errors.

If any error appears, read the error message in full — it will point to the exact file and line.

- [ ] **Step 4: Start dev server and verify all sections render**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

1. Navbar renders, is transparent on load, turns white/blur on scroll
2. Hero: logo, headline "Diversão para toda a família", floating colored blobs, 2 CTA buttons
3. Benefits: 3 cards (Festas Incríveis, Mais de 10 Atrações, Área para Pais)
4. Atrações: 7 image cards + 1 CTA card in a grid
5. Por Que Escolher: 6 cards with gradient icon boxes
6. Festas: Yellow background, checklist, 4-image grid, 2 CTAs
7. Preços: 3 pricing cards (Segunda–Sexta, Sábado, Domingo/Feriado) with R$ values
8. Galeria: Horizontal auto-scrolling carousel with 8 posts
9. Depoimentos: 3 cards with star ratings (Fernanda, Ricardo, Adriana)
10. Contato: Info column + form — submit with empty fields shows validation errors
11. Footer: Dark purple, logo, links, social icons, copyright

Verify mobile at 375px viewport width using browser devtools.

- [ ] **Step 5: Final commit**

```bash
cd /Users/mvbassalobre/Projects/divercity-site
git add frontend/
git commit -m "feat: complete Divercity Park website boilerplate — all sections assembled"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|----------------|------|
| Next.js 16 App Router + React Compiler | Task 1, 5 |
| TypeScript | All tasks |
| Tailwind CSS with brand colors | Task 4 |
| Framer Motion (scroll reveals, floating, stagger) | Tasks 8–17 |
| shadcn/ui components | Task 3 |
| Lucide Icons | Tasks 9, 11, 12, 13, 14, 16, 17 |
| React Hook Form + Zod | Task 16 |
| Embla Carousel | Task 14 |
| next/image + next/font | Tasks 5, 8–17 |
| Navbar (sticky, scroll-aware, mobile menu) | Task 7 |
| Hero (full-screen, floating elements, CTAs) | Task 8 |
| Benefits (3 cards) | Task 9 |
| Atrações (7 cards + CTA) | Task 10 |
| Por Que Escolher (6 cards) | Task 11 |
| Festas e Aniversários (yellow bg, image grid, CTA) | Task 12 |
| Preços (exact tiers from reference) | Task 13 |
| Galeria Instagram (carousel) | Task 14 |
| Depoimentos (testimonials) | Task 15 |
| Contato (2-col, form with validation) | Task 16 |
| Footer (dark purple, logo, social, map) | Task 17 |
| placehold.co for all images | Tasks 6, 8, 12, 14, 16, 17 |
| All content in Brazilian Portuguese | Tasks 6–18 |
| Mobile-first responsive design | All section tasks |

**No placeholders found** — all steps contain complete, runnable code.

**Type consistency verified** — `BENEFICIOS_CARDS[].iconeName` strings (`Shield`, `Users`, `PartyPopper`, `MapPin`, `UtensilsCrossed`, `HeartHandshake`) exactly match `ICON_MAP` keys in `PorQueEscolher.tsx`. `NAV_ITEMS` used identically in both `Navbar.tsx` and `Footer.tsx`.
