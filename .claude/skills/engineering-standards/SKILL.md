---
name: engineering-standards
description: Engineering standards, scope control and validation commands for divercity-site. Apply when writing, reviewing, or refactoring any code in this project.
user-invocable: false
---

# Engineering Standards — divercity-site

## Project Context

- Next.js 16 fullstack (App Router + API routes + server actions) on Vercel
- PostgreSQL on Supabase via Prisma 7; auth via next-auth v4 (roles `admin`, `operator`)
- Public site for Divercity Park (indoor kids park) + admin + on-site operations area
- Production site — assume real customers and real payments (Stripe) at all times

## Absolute Rules (from CLAUDE.md)

- Never `git commit` / `git push` unless the user explicitly asks. A hook blocks it.
- Never write credentials in code, versioned files, logs or comments. Read from `process.env`.
- Never read or edit `.env`, `.env.local`, `.mcp.json`.
- Never invent business data (prices, address, phone, hours, attractions, institutional copy).
- Never run DB-writing commands (`prisma migrate dev|deploy|reset`, `db push`, `db execute`, seed, `prisma/*.ts` scripts, write SQL through Supabase MCP) without explicit user approval. The `.env.local` DB is the real one.

## Core Principles

- Code in English; user-facing text in Portuguese (pt-BR)
- No comments explaining what the code does
- Do not modify anything outside the explicit scope of the request
- No implicit refactors, renames or convenience improvements
- Preserve existing behavior
- Match the local style of the file being edited (some files use double quotes + semicolons, others don't)

## Mindset

- Stability over elegance
- Predictability over cleverness
- Minimal change surface
- Reuse what exists (components, lib clients, schemas, types) before creating

## Security

- Never trust client-side data — validate with Zod on the server, recompute prices server-side
- Protect admin API routes with `requireRole` from `src/lib/authz.ts`
- Do not log sensitive data (tokens, CPF, payment data)
- Verify webhook signatures

## Non-Goals

- No dependency changes unless the spec asks
- No test framework setup (the project has none)
- No dark mode (not used in this project)
- No stylistic rewrites

## Validation (run before reporting a task as done)

Baseline: `tsc` is clean; `eslint` has pre-existing errors in files outside most tasks.

1. `npx tsc --noEmit` — must stay clean.
2. `npx eslint <changed files>` — no new errors/warnings in changed lines. Pre-existing errors in untouched lines: report, don't fix.
3. Prettier (`.prettierrc`: no semi, single quotes, es5 trailing comma, tailwind plugin):
   - New files: `npx prettier --write <file>`.
   - Existing files: do **not** reformat the whole file. Keep the file's local style and only format what you changed.
4. If `prisma/schema.prisma` changed: `npx prisma validate` and `npx prisma generate`, and a migration file exists under `prisma/migrations/`.
5. If the change touches caching (`'use cache'`, Suspense boundaries), `next.config.ts`, `proxy.ts` or route segment config: `npm run build`. If the build fails for environment reasons (DB/network), report it instead of working around it.
6. UI changes: list the routes to check in the browser (`npm run dev`, port 3000).

## Final Rule

If it was not explicitly requested, do not do it.
