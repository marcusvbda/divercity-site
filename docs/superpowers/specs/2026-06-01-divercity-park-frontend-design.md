# Divercity Park — Frontend Boilerplate Design Spec

**Date:** 2026-06-01  
**Project:** Divercity Park Website  
**Location:** `/frontend`  
**Language:** Brazilian Portuguese (100%)

---

## Overview

Single-page website for Divercity Park, an indoor family entertainment center. The design is premium, modern and playful — targeting parents (buyers) while appealing to children (users). Visual identity is sourced directly from the reference images in `docs/images/`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 16 App Router + React Compiler | Framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| shadcn/ui | UI primitives |
| Lucide Icons | Iconography |
| React Hook Form + Zod | Contact form |
| Embla Carousel | Instagram gallery |
| next/image | Optimized images |
| next/font | Google Fonts (Fredoka, Poppins) |
| ESLint + Prettier | Code quality |

---

## Brand Identity

### Colors
```
Cyan:   #12C7C8
Purple: #8E4CCF
Pink:   #FF4F8A
Lime:   #9AD94B
Yellow: #FFD23F
```

### Typography
- **Fredoka** — all headings (h1–h4)
- **Poppins** — body text, labels, buttons

### Visual Language
- Large rounded corners (rounded-2xl / rounded-3xl)
- Soft box shadows
- Glassmorphism card effects
- Floating decorative elements (colored blobs/circles)
- Gradient accents using brand colors
- White and light gray backgrounds (except Footer: dark purple)
- Strong visual hierarchy

---

## Project Structure

```
/frontend
├── src/
│   ├── app/
│   │   ├── layout.tsx          — Root layout (fonts, metadata, globals)
│   │   ├── page.tsx            — Assembles all sections
│   │   └── globals.css         — Tailwind directives + custom CSS vars
│   ├── components/
│   │   ├── ui/
│   │   │   └── Navbar.tsx      — Sticky nav with scroll-aware state
│   │   └── sections/
│   │       ├── Hero.tsx
│   │       ├── Benefits.tsx
│   │       ├── Atracoes.tsx
│   │       ├── PorQueEscolher.tsx
│   │       ├── Festas.tsx
│   │       ├── Precos.tsx
│   │       ├── Galeria.tsx
│   │       ├── Depoimentos.tsx
│   │       ├── Contato.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── data.ts             — All static content (attractions, prices, testimonials)
│   │   └── utils.ts            — cn() helper + misc utilities
│   └── types/
│       └── index.ts            — TypeScript interfaces
├── public/
│   └── logo-ball.png           — Logo copied from docs/images
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Sections

### 1. Navbar
- Sticky, transparent on top → white/blur on scroll
- Logo (left), nav links (center/right), "Reservar Festa" button (pink, rounded-full)
- Mobile: hamburger menu with slide-down panel
- Active section indicator via IntersectionObserver

### 2. Hero
- Full-screen (`min-h-screen`)
- Background: `https://placehold.co/1920x1080` (park image placeholder)
- Subtle vignette/blur overlay on edges
- Large logo centered top
- Headline: **"Diversão para toda a família"** (Fredoka, white, large)
- Subtext emphasizing fun, safety, memorable experiences
- CTAs: "Reservar Festa" (pink filled) + "Ver Atrações" (white outlined)
- Floating decorative elements: colored circles/blobs (cyan, purple, lime, yellow) animated with Framer Motion `y` oscillation

### 3. Benefits
Three cards:
- 🎉 **Festas Incríveis** — festas personalizadas inesquecíveis
- 🎡 **Mais de 10 Atrações** — diversão garantida para todas as idades
- 👨‍👩‍👧 **Área para Pais** — espaço confortável enquanto as crianças se divertem

Cards: white, rounded-2xl, soft shadow, icon + title + description, hover lift.

### 4. Atrações
Section title: "Nossas Atrações"

Attractions (from reference image):
1. Arco do Totem Elétrico
2. Guerreiro Ninja
3. Parede de Escalada
4. Escalada Radical
5. Sala de Festas
6. Pule Aqui!
7. Bar e Petisqueria
8. + mais Atrações (CTA card)

Each card: `https://placehold.co/600x400`, rounded-2xl, overlay with name on bottom, hover scale + shadow lift. Staggered entrance animation.

### 5. Por que Escolher o Divercity Park
Section title: "Por que as famílias escolhem o Divercity Park?"

Six benefit cards with Lucide icons:
1. Segurança — monitoramento e equipe treinada
2. Diversão para Todas as Idades — atrações para crianças e adolescentes
3. Festas Personalizadas — pacotes completos para o aniversário perfeito
4. Localização Conveniente — fácil acesso e estacionamento
5. Alimentação Saborosa — lanchonete completa e área de lounge
6. Atendimento Especializado — equipe dedicada e atenciosa

Grid 2×3 (desktop), 1-col (mobile). Cards: gradient icon bg, white card.

### 6. Festas e Aniversários
Section title: "Festas e Aniversários Inesquecíveis!"

- Background: yellow `#FFD23F` with decorative elements
- Left column: headline, description, bullet list of party features, CTA "Solicitar Orçamento" (pink)
- Right column: 2×2 image grid — `https://placehold.co/400x300` × 4 (birthday setups, decorations, food, celebrations)
- Strong conversion focus

### 7. Preços
Section title: "Preços"

Two sub-sections (from reference):

**Agendamento Feria (Segunda a Sexta)**
| Faixa | Valor |
|-------|-------|
| Até 5 anos | R$45 |
| A partir de 5 anos | R$55 |

**Mais de 5 Anos: Sábado, Domingo e Feriado**
| Faixa | Valor |
|-------|-------|
| Até 5 anos | R$60 |
| A partir de 5 anos | R$70 |
| 5 anos | R$75 |
| A partir de 5 anos | R$85 |
| Até 5 anos | R$90 |
| A partir de 5 anos | R$100 |

> Note: Exact pricing visible in reference image — values above are approximate. Data should be taken from reference exactly. Use `https://placehold.co` for any icon needs.

Cards: rounded-2xl, color accent per tier, hover lift, prominent price display.

### 8. Galeria Instagram
Section title: "Siga nosso Instagram"

- Horizontal Embla Carousel (auto-scroll optional)
- 8–10 placeholder images: `https://placehold.co/400x400`
- Rounded cards, hover scale
- Instagram handle link: @divercitypark

### 9. Depoimentos
Section title: "O que nossos clientes dizem"

Three testimonial cards (from reference image names):
- **Fernanda** — ⭐⭐⭐⭐⭐ — "Festa incrível! Meu filho adorou cada detalhe..."
- **Ricardo** — ⭐⭐⭐⭐⭐ — "Melhor parque indoor da região..."
- **Adriana** — ⭐⭐⭐⭐⭐ — "Atendimento excepcional e estrutura impecável..."

Cards: white, rounded-2xl, shadow, avatar placeholder, name, stars, quote. Staggered entrance.

### 10. Contato
Section title: "Nos manda uma mensagem!"

Two-column layout:
- **Left:** Business info
  - Address: from reference (Divercity Park location)
  - Phone/WhatsApp: from reference
  - Opening hours: from reference
  - Social links
- **Right:** Contact form (React Hook Form + Zod)
  - Nome (required)
  - E-mail (required, email validation)
  - Telefone
  - Mensagem (required, textarea)
  - Submit: "Enviar Mensagem" (pink button)

Form submits to `#` (no backend needed for boilerplate).

### 11. Footer
- Dark purple background `#8E4CCF` (or darker variant)
- Large logo top-left
- Quick links: Início, Atrações, Festas, Preços, Contato
- Social: Instagram, Facebook, WhatsApp icons
- Address + phone
- Google Maps embed placeholder (`https://placehold.co/400x200`)
- Copyright: "© 2024 Divercity Park. Todos os direitos reservados."

---

## Animation Strategy

All sections use `motion.div` with `useInView` for scroll reveal:
```ts
initial={{ opacity: 0, y: 40 }}
animate={inView ? { opacity: 1, y: 0 } : {}}
transition={{ duration: 0.6, ease: "easeOut" }}
```

Staggered grids:
```ts
variants={{ container: { staggerChildren: 0.1 } }}
```

Hero floating elements:
```ts
animate={{ y: [0, -20, 0] }}
transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
```

Navbar scroll effect via `useScroll` — changes background + shadow when `scrollY > 50`.

---

## Data Layer

All static content lives in `src/lib/data.ts`:
- `ATRACOES: Atracao[]`
- `BENEFICIOS: Beneficio[]`
- `PRECOS: PriceGroup[]`
- `DEPOIMENTOS: Depoimento[]`
- `INSTAGRAM_POSTS: string[]` (placeholder URLs)

---

## Performance & SEO

- `next/image` with `sizes` and `priority` on hero image
- All below-fold images lazy loaded
- `next/font` for zero layout shift on fonts
- Metadata in `layout.tsx`: title, description, OpenGraph
- `aria-label` on all interactive elements
- Semantic HTML: `<main>`, `<section>`, `<nav>`, `<footer>`, `<h1>`–`<h3>`
- Smooth scroll: `scroll-behavior: smooth` on `html`

---

## Responsiveness

Mobile-first Tailwind breakpoints:
- Default: 1 column, stacked layout
- `sm` (640px): 2 columns where applicable
- `lg` (1024px): full desktop grid (3–4 cols)
- `xl` (1280px): max-width container centered

---

## Business Data (exact, from reference)

- **Nome:** Divercity Park
- **Endereço:** conforme referência (não inventar)
- **Telefone/WhatsApp:** conforme referência
- **Horário:** conforme referência
- **Preços:** conforme referência (não modificar valores)
- **Instagram:** @divercitypark

---

## Out of Scope (boilerplate)

- Backend/API routes
- Authentication
- CMS integration
- Real image assets (use placehold.co)
- Analytics/tracking
