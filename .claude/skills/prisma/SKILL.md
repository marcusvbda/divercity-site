---
name: prisma
description: Prisma 7 + Supabase Postgres guidelines for divercity-site. Apply when touching prisma/schema.prisma, migrations, seed, src/lib/prisma.ts, the CMS EAV tables, or any query using the Prisma client.
user-invocable: false
---

## Stack

- Prisma 7 with `prisma.config.ts` (loads `.env.local`), `@prisma/adapter-pg` + `pg` Pool (`max: 1`, serverless)
- Client generated to `src/generated/prisma` (gitignored) — import from `@/generated/prisma/client`
- Runtime uses `DATABASE_URL` (pooler); migrations use `DIRECT_URL`
- Models: CMS EAV (`ContentType`, `ContentComponent`, `ComponentField`, `ComponentFieldValue`, `ComponentInstance`, `ComponentInstanceFieldValue`), `Customer`, `ContractTemplate`, `Party`, `Guest`, `Contract`, `Setting`, `Service`, `User`, `PassportType`, `TicketOrder`, `TicketChild`, `TicketCompanion`

## Safety (critical)

The `.env.local` database is the real one. Without explicit user approval, never run:

- `prisma migrate dev | deploy | reset | resolve`, `prisma db push | execute | seed`
- `npx tsx prisma/seed.ts` or any `prisma/*.ts` script
- write SQL through the Supabase MCP

Allowed: `npx prisma validate`, `npx prisma generate`, `npx prisma format`, `npx prisma migrate diff ... --script` (read-only).

## Schema changes

1. Copy the current schema outside the repo before editing: `cp prisma/schema.prisma <scratchpad>/schema.before.prisma`
2. Edit `prisma/schema.prisma`
3. `npx prisma migrate diff --from-schema <scratchpad>/schema.before.prisma --to-schema prisma/schema.prisma --script`
4. Save the output as `prisma/migrations/<YYYYMMDDHHMMSS>_<snake_name>/migration.sql` (timestamp after the latest existing one)
5. Make it safe for existing rows: defaults for new NOT NULL columns, explicit backfill, no DROP of populated columns/tables unless the spec says so
6. `npx prisma validate` and `npx prisma generate`
7. Report to the user that the migration must be applied (they run it)

## Queries

- Always `import { prisma } from '@/lib/prisma'`
- Use `select`/`include` to return only what the caller needs; never return password hashes or tokens
- Multi-step writes that must be consistent go in `prisma.$transaction`
- Server Component reads go through a `'use cache'` function with `cacheTag`, and mutations invalidate that tag
- CMS content is read with `getContentType(name)` (`src/lib/cms.ts`); new CMS content types/fields are added through `prisma/seed.ts` patterns — editing the seed is fine, running it requires approval
