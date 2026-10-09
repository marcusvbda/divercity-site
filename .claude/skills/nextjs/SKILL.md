---
name: nextjs
description: Next.js 16 guidelines for divercity-site. Apply when working with routing, pages, layouts, API routes, server actions, server/client components, caching, proxy.ts, images or next.config.
user-invocable: false
---

## Stack

- Next.js 16.3 (App Router) with `reactCompiler: true` and `cacheComponents: true`
- React 19.2
- next-auth v4 (`src/lib/auth.ts`, `src/lib/authz.ts`, `src/proxy.ts`)
- Deployed on Vercel (`vercel.json` has a daily cron hitting `/api/cron`)

This Next.js version has breaking changes vs. training data. Before using an API you are not sure about, read the guide in `node_modules/next/dist/docs/01-app/`.

## Layout

- `src/app/page.tsx` — public home, assembles `src/components/sections/*`
- `src/app/orcamento`, `src/app/compra-antecipada`, `src/app/c/[hash]` — public flows
- `src/app/admin/**` — admin (role `admin`) and `admin/operacao/**` (roles `admin` + `operator`)
- `src/app/api/**/route.ts` — API routes (`admin/`, `tickets/`, `party-budget/`, `client/`, `webhooks/`, `cms/`, `cron/`, ...)
- `src/proxy.ts` — replaces `middleware.ts` (Next 16). Guards `/admin/**`; operator allow-list in `OPERATOR_ALLOWED_PREFIXES`

## Rules

- Server Components by default; `'use client'` only for interaction/state/hooks
- `cacheComponents: true`:
  - async DB/API reads used by Server Components go in a function with `'use cache'` + `cacheTag(...)` (see `src/lib/cms.ts`), or render inside `<Suspense>`
  - request-time data (`getServerSession`, `cookies()`, `headers()`) must be preceded by `await connection()` from `next/server`
  - never `export const dynamic = 'force-dynamic'`
  - after mutations that affect cached content, `revalidateTag(tag, {})` (see `src/app/admin/actions.ts`)
- Root layout wraps `children` in `<Suspense>` — keep it
- API routes: `requireRole([...])` first for protected routes, Zod `safeParse` for input, `NextResponse.json(body, { status })`
- Use `next/image`; new remote hosts require `next.config.ts` changes — only if the spec asks
- Do not modify `next.config.ts`, `proxy.ts` matcher or auth config unless the task requires it
- Commands: `npm run dev`, `npm run build` (runs `prisma generate` first), `npm run lint`
