---
name: react
description: React guidelines for divercity-site. Apply when writing or reviewing React components, hooks, client state, data fetching, forms or animations.
user-invocable: false
---

## Stack

- React 19.2 with React Compiler
- TypeScript 5 (strict)
- TanStack React Query 5 (`src/providers/ReactQueryProvider.tsx`)
- react-hook-form 7 + @hookform/resolvers 5 + Zod 4
- Framer Motion 12
- sonner (toasts), recharts 3 (admin charts), TipTap 3 (contract editor), dnd-kit (sorting), embla-carousel, html5-qrcode / qrcode (tickets)

## Rules

- No `useMemo`, `useCallback` or `memo()` — the React Compiler handles memoization
- Data fetching in Client Components: `useQuery` for GET, `useMutation` for writes, then `queryClient.invalidateQueries` for affected lists. Never `useEffect` + `fetch`
- Query keys: follow the existing keys of the area (grep `queryKey:` nearby) so invalidation keeps working
- Client never imports Prisma or server-only libs; it talks to `src/app/api/**` or server actions
- Forms: follow the pattern of the area. New complex forms use react-hook-form + Zod (schemas in `src/lib/schemas/` when shared with the API)
- Scroll animations: `whileInView` + `viewport={{ once: true, margin: '-80px' }}`. Never `useInView` + conditional `animate` (hydration mismatch)
- Feedback: `toast.success` / `toast.error` from `sonner`
- Do not introduce new state management, date or HTTP libraries
- Shared types live in `src/types/`
