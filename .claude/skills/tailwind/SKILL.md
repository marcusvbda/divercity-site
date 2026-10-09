---
name: tailwind
description: Tailwind CSS v4 guidelines for divercity-site. Apply when writing or reviewing class names, layout, responsive design, brand colors, typography or animations.
user-invocable: false
---

## Stack

- Tailwind CSS v4, CSS-first config via `@theme inline` in `src/app/globals.css` (no `tailwind.config.js`)
- `tw-animate-css`, `shadcn/tailwind.css`
- prettier-plugin-tailwindcss sorts classes

## Design Tokens

- Public site only — brand colors: `brand-cyan` (#12C7C8), `brand-purple` (#8E4CCF), `brand-pink` (#FF4F8A), `brand-lime` (#9AD94B), `brand-yellow` (#FFD23F) — e.g. `bg-brand-cyan`, `text-brand-pink`
- Public site fonts: `font-heading` (Fredoka), `font-body` (Poppins, default on `<body>`)
- shadcn semantic tokens: `background`, `foreground`, `primary`, `muted`, `accent`, `destructive`, `border`, `ring`, `sidebar-*`, `chart-1..5`
- Logged-in screens (`/admin/**`): Geist font and the template's semantic tokens only; no `brand-*`, `font-heading`, `gray-*` or framer-motion there
- Utilities: `section-padding`, `container-max` (public site sections)

## Rules

- Gradients: `bg-linear-to-r` (never `bg-gradient-to-*`)
- `shrink-0` (never `flex-shrink-0`)
- Prefer scale classes over arbitrary values (`min-h-52`, not `min-h-[208px]`)
- `cn()` for conditional classes
- Mobile-first responsive (`sm:`, `md:`, `lg:`); public pages are mostly viewed on phones
- No dark mode variants — the project does not use dark mode
- Do not add new tokens to `@theme` unless the task asks for it
