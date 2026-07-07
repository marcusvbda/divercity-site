# Divercity Park — Regras do Projeto

## ⛔ REGRAS ABSOLUTAS — NUNCA VIOLAR

### 1. Nunca commitar sem ser pedido

**NUNCA faça `git commit` ou `git push` sem o usuário pedir explicitamente.**

- Não commitar ao final de tarefas automaticamente
- Não commitar como parte de um "plano de implementação"
- Apenas executar `git commit` quando o usuário disser "commita", "faz o commit", "commit isso" ou equivalente

### 2. Nunca expor tokens, senhas ou credenciais

**NUNCA escreva tokens, API keys, senhas ou segredos em:**

- Arquivos de código-fonte (`.ts`, `.tsx`, `.js`, etc.)
- Arquivos versionados (qualquer arquivo que vai para o git)
- Mensagens de commit
- Logs ou console.log de produção
- Comentários no código

**Regra prática:** Se um valor começa com `sk-`, `eyJ`, é um hash longo ou parece uma senha — vai para `.env` / `.env.local`, nunca no código.

**Arquivos que NUNCA devem ir para o git:**

```
.env
.env.local
.mcp.json
```

Todos esses estão no `.gitignore`. Se detectar que um desses está sendo staged, bloqueie e avise.

**Padrão correto:**

```typescript
// ✅ Correto — lê do ambiente
const token = process.env.INSTAGRAM_ACCESS_TOKEN

// ❌ Errado — credencial hardcoded
const token = 'eyJhbGci...'
```

---

## Projeto

Site institucional do **Divercity Park** — parque indoor de diversão infantil.

```
divercity-site/
  src/        — Next.js 16 (site público)
  prisma/     — Schema EAV + seed do CMS
  docs/       — Documentação, assets e imagens de referência
```

---

## Stack

| Tecnologia         | Versão            | Notas                                                 |
| ------------------ | ----------------- | ----------------------------------------------------- |
| Next.js            | **16** App Router | React Compiler ativado, `cacheComponents: true`       |
| TypeScript         | 5                 | strict mode                                           |
| Tailwind CSS       | **v4**            | CSS-first config via `@theme` em globals.css          |
| Framer Motion      | 12                | `whileInView` + `viewport` para scroll                |
| shadcn/ui          | 4                 | Componentes em `src/components/ui/`                   |
| Lucide React       | latest            | Verificar se o ícone existe antes de usar             |
| Prisma             | 7                 | `prisma.config.ts` + `@prisma/adapter-pg`, schema EAV |
| Supabase           | —                 | PostgreSQL + Auth + Storage                           |
| TanStack Query     | 5                 | `@tanstack/react-query` — obrigatório para fetch      |

---

## CMS — Arquitetura EAV

O CMS é um schema EAV customizado no Supabase/PostgreSQL via Prisma. 6 tabelas:

| Tabela                            | Descrição                                                          |
| --------------------------------- | ------------------------------------------------------------------ |
| `content_types`                   | Tipos de conteúdo (NavBar, Hero, Footer…)                          |
| `content_components`              | Componentes de cada tipo (Section, Media, CTAs…)                   |
| `component_fields`                | Campos de cada componente                                          |
| `component_field_values`          | Valores simples ou referência a instance                           |
| `component_instances`             | Instâncias de templates reutilizáveis (General/Cta, General/Link…) |
| `component_instance_field_values` | Valores dos campos de cada instância                               |

**Para popular o banco:**

```bash
npx tsx prisma/seed.ts
```

**Função de leitura:** `getContentType(name)` em `src/lib/cms.ts` — retorna objeto aninhado `{ ComponentName: { fieldName: { id, value } } }`.

**ContentTypes existentes:**

- `NavBar` — Logo, Actions (actionBtn CTA), Menus (menuItems links)
- `Hero` — Content (title, subtitle), Media (bgImage, image), Actions (primaryCta, secondaryCta)
- `Attractions` — Section (badge, title, subtitle), Content (Attraction[] múltiplo)
- `BenefitsSection` — Section (badge, title, subtitle), Content (Benefit[] múltiplo)
- `PartySection` — Section (badge, title, description, features[]), Media (images[]), CTAs (ctaBudget, ctaPrices)
- `PriceSection` — Section (badge, title, subtitle), Content (prices[] múltiplo, disclaimers[])
- `AdvancePurchaseSection` — Section (title, subtitle), Content (features[] múltiplo, disclaimer), Actions (cta)
- `ContactSection` — Section (badge, title, subtitle, formBtnLabel), Info (wppNumber, address, googleMapsUrl, weekdaysTime, holidaysTime, instagramUrl, googleMapsUrlIframe)
- `Footer` — Info (logoFooter, weekdaysTime, holidaysTime, googleMapsUrl, address, instagramUrl, wppNumber)

**Templates reutilizáveis (General):**

- `General/Link` — label, href
- `General/Cta` — label, href, color, bgColor, border, hoverColor, hoverBgColor, hoverBorder
- `General/Attraction` — name, description, image, color, sort
- `General/Benefit` — title, description, iconName
- `General/Feature` — label, iconName, color
- `General/Price` — title, subtitle, color

---

## Next.js 16 + React Compiler — Regras

- **React Compiler está ativado** — não adicionar `useMemo`, `useCallback` ou `memo()` manualmente; o compiler otimiza automaticamente.
- **`cacheComponents: true` está ativo** — todo dado async em Server Components deve ser cacheado (`'use cache'`) ou estar dentro de `<Suspense>`.
- **`'use cache'`** em funções async que consultam o banco ou APIs externas (ex: `getContentType` em `cms.ts`).
- **Dados dinâmicos de request** (ex: `getServerSession`) devem ser precedidos de `await connection()` do `next/server` para não bloquear prerender.
- **`force-dynamic` não é compatível com `cacheComponents`** — usar `connection()` + `<Suspense>` no lugar.
- **Root layout** envolve `children` com `<Suspense>` para permitir que rotas dinâmicas (admin) façam Partial Prerender.
- **`middleware.ts` foi renomeado para `proxy.ts`** — convenção do Next.js 16.

---

## Convenções Tailwind v4

- Cores da marca via CSS vars: `bg-brand-cyan`, `text-brand-pink`, etc.
- Gradientes: `bg-linear-to-r` (não `bg-gradient-to-r`)
- `shrink-0` (não `flex-shrink-0`)
- `min-h-52` (não `min-h-[208px]`)

---

## Animações (regra anti-hydration)

**Sempre usar `whileInView` + `viewport` para scroll reveals:**

```tsx
// ✅ Correto
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
>

// ❌ Errado — causa hydration mismatch
const isInView = useInView(ref, ...)
<motion.div animate={isInView ? { opacity: 1 } : {}}>
```

---

## Dados e Conteúdo

- **NUNCA inventar dados de negócio** (endereço, telefone, preços, atrações)
- Todo conteúdo vem de `docs/plan.md` ou de instrução explícita do usuário
- Imagens: armazenadas no Supabase Storage (`vcwreoyzynyinmyuzvnr.supabase.co/storage/v1/object/public/site/`)
- Placeholder para imagens ausentes: `https://placehold.co/600x400/cor/fff?text=Nome`

---

## Estrutura de Componentes

```
src/
  app/
    layout.tsx          — fonts, metadata, favicons
    page.tsx            — monta todas as seções
    globals.css         — Tailwind @theme + utilities
    api/
      instagram/route.ts — posts do Instagram (INSTAGRAM_ACCESS_TOKEN)
      reviews/route.ts   — avaliações do Google (GOOGLE_PLACES_API_KEY)
  components/
    ui/
      Navbar.tsx
      ImageModal.tsx
      cta.tsx
    sections/
      Hero, PorQueEscolher, Atracoes, Festas,
      Precos, Galeria, Depoimentos, Contato, Footer
  lib/
    cms.ts      — getContentType() — leitura do CMS
    prisma.ts   — instância do PrismaClient
    helpers.ts  —  scrollTo
  types/
    index.ts    — TypeScript interfaces
```

---

## MCPs Ativos

| MCP                   | Status       | Uso                          |
| --------------------- | ------------ | ---------------------------- |
| **Figma** (claude.ai) | ✅ Conectado | Design system, layouts       |
| **context-mode**      | ✅ Conectado | Gerenciar janela de contexto |
| **Supabase**          | ✅ Conectado | Banco, storage, auth         |

**Skills disponíveis:** `supabase`, `frontend-design`, `vercel-react-best-practices`

---

## Fetching de Dados — Regra Obrigatória

**NUNCA use `useEffect` + `fetch` para buscar dados em Client Components.**

Sempre usar `@tanstack/react-query`:

- **GET** → `useQuery`
- **POST / PUT / DELETE / PATCH** → `useMutation`

```tsx
// ✅ Correto
const { data, isLoading } = useQuery({
  queryKey: ['chave'],
  queryFn: () => fetch('/api/rota').then((r) => r.json()),
})

const mutation = useMutation({
  mutationFn: (body) =>
    fetch('/api/rota', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
})

// ❌ Errado
useEffect(() => {
  fetch('/api/rota').then((r) => r.json()).then(setData)
}, [])
```

O `ReactQueryProvider` já está configurado em `src/providers/ReactQueryProvider.tsx`.

---

## shadcn/ui — Regra Obrigatória

**Antes de criar qualquer componente de UI, verificar se o shadcn/ui já tem um equivalente.**

Os componentes instalados estão em `src/components/ui/`. Consultar também a [documentação do shadcn](https://ui.shadcn.com/docs/components) para componentes disponíveis mas não instalados (instalar via `npx shadcn@latest add <componente>`).

Exemplos do que já existe e **não deve ser recriado**:

| Necessidade              | Usar                          |
| ------------------------ | ----------------------------- |
| Botão                    | `Button` de `ui/button`       |
| Input / Textarea         | `Input`, `Textarea`           |
| Loading / pulse          | `Skeleton` de `ui/skeleton`   |
| Badge / tag              | `Badge` de `ui/badge`         |
| Modal / drawer           | `Sheet`, `Drawer`             |
| Dropdown                 | `DropdownMenu`                |
| Tooltip                  | `Tooltip`                     |
| Select / Combobox        | `Select`                      |
| Tabs                     | `Tabs`                        |

---

## O que NÃO fazer

- Não criar comentários explicando o que o código faz
- Não adicionar features não solicitadas
- Não refatorar código fora do escopo da tarefa
- Não usar `bg-gradient-to-*` (Tailwind v3) — usar `bg-linear-to-*`
- Não usar `flex-shrink-0` — usar `shrink-0`
- Não inventar textos, preços ou informações do negócio
- Não usar `useEffect` + `fetch` — usar React Query (`useQuery` / `useMutation`)
- Não recriar componentes que o shadcn/ui já oferece
