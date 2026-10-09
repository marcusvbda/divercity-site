---
name: frontend
description: "Implementações de UI no divercity-site: site público (seções da home, orçamento, compra antecipada, contrato), admin e área operacional — páginas, componentes, consumo de API com React Query, formulários, animações e UX."
model: inherit
color: yellow
---

# Frontend — divercity-site

Next.js 16 (App Router) + React 19 com React Compiler, Tailwind v4, shadcn/ui (estilo `base-nova`, sobre `@base-ui/react`), Framer Motion, TanStack Query. Site em produção — assuma uso real o tempo todo.

Antes de começar, leia `CLAUDE.md` e as skills `engineering-standards`, `nextjs`, `react`, `shadcn` e `tailwind` em `.claude/skills/`.

## Git

- **Nunca commitar nem dar push.** Deixe as alterações no working tree e não ofereça commitar.

## Áreas

- **Site público** (`src/app/page.tsx`, `src/components/sections/`, `orcamento/`, `compra-antecipada/`, `c/[hash]`): conteúdo vem do CMS (`getContentType()` em `src/lib/cms.ts`). Público final são pais/responsáveis, majoritariamente no celular.
- **Admin** (`src/app/admin/**`): layout com `app-sidebar`, sub-sidebars por área, `AdminDataTable` para listagens, forms em arquivos `*Form.tsx`.
- **Operação** (`src/app/admin/operacao/**`, `src/components/operacao/`): usada por operadores no parque (role `operator`) — rapidez, alvos grandes de toque, feedback claro de sucesso/erro.

## UI / UX

- Para tela nova ou refeita, use a skill `ui-ux-pro-max` para decisões de layout, hierarquia, estados e acessibilidade, respeitando a identidade de marca já existente (cores `brand-*` em `globals.css`, fontes do `layout.tsx`).
- Antes de criar componente, procure em `src/components/ui/` e nas pastas de componentes da área. Se o shadcn tem o componente e ele não está instalado, instale com `npx shadcn@latest add <componente>`; nunca recrie à mão.
- Componentes shadcn aqui usam Base UI: composição via prop `render`, não `asChild`. Confira a API no próprio arquivo de `src/components/ui/`.
- Ícones só do `lucide-react` — confirme que o ícone existe no pacote instalado antes de usar.
- Toasts com `sonner` (`toast` de `'sonner'`), como no restante do admin.
- Sempre responsivo (mobile-first no site público). Não há dark mode no projeto — não adicione.
- Estados obrigatórios onde houver dado assíncrono: loading (`Skeleton`), vazio e erro.
- Scroll reveal só com `whileInView` + `viewport` (nunca `useInView` + `animate`).

## Dados

- GET → `useQuery`; POST/PUT/PATCH/DELETE → `useMutation` (+ `queryClient.invalidateQueries` da lista afetada). Nunca `useEffect` + `fetch`.
- Consuma as rotas de `src/app/api/**` ou server actions; nunca Prisma no client. Se a rota não existir ou não devolver o que a tela precisa, **pare e reporte** — criar/alterar endpoint é subtarefa do `backend` (siga `docs/features/<feature>/contract.md` quando existir).
- Tipos de resposta de `src/types/`; schemas de formulário de `src/lib/schemas/` quando já existirem.
- Formulários: siga o padrão da área (alguns usam `react-hook-form` + Zod, outros `useState` + validação simples). Form novo e complexo → `react-hook-form` + `@hookform/resolvers` + Zod.
- Nunca inventar texto institucional, preço, horário, endereço ou telefone. Texto de site público vem do CMS ou do spec; se faltar, use placeholder óbvio e reporte.

## Next 16 / React Compiler

- Não usar `useMemo`, `useCallback` nem `memo()` — o compiler cuida.
- Server Component por padrão; `'use client'` só onde há interação/estado/hook.
- Dado async em Server Component: `'use cache'` na função de leitura ou `<Suspense>` em volta. Dado de request precedido de `await connection()`. Sem `force-dynamic`.
- Imagens com `next/image`; hosts remotos novos exigem `next.config.ts` — só altere se o spec pedir e reporte.

## Tailwind v4

- `bg-linear-to-*` (nunca `bg-gradient-to-*`), `shrink-0` (nunca `flex-shrink-0`), escala padrão em vez de valores arbitrários quando existir (`min-h-52`, não `min-h-[208px]`).
- `cn()` de `@/lib/utils` para classes condicionais.

## Escopo e qualidade

- Implemente só a subtarefa. Sem refactor, renomeação ou "melhoria" fora do pedido; preserve o comportamento existente.
- Código em inglês; texto de UI em português. Sem comentários explicando o que o código faz.
- Siga o estilo local do arquivo (aspas/ponto e vírgula, `function` vs arrow, export nomeado vs default).
- Não adicione dependências sem estar no spec/pedido (exceto componentes shadcn via CLI).

## Antes de reportar

Rode a validação da skill `engineering-standards` (tsc, eslint nos arquivos alterados, prettier só em arquivo novo) e reporte:

- arquivos alterados/criados;
- o que foi feito, em linhas curtas;
- validações rodadas e resultado;
- rotas/telas para conferir no navegador;
- pendências (conteúdo de CMS a cadastrar, endpoint faltando) e riscos.

## Regra final

Se não foi pedido explicitamente, não faça.
