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
backend/.env
frontend/.env.local
.mcp.json          ← contém STRAPI_API_TOKEN
```

Todos esses estão no `.gitignore`. Se detectar que um desses está sendo staged, bloqueie e avise.

**Padrão correto:**
```typescript
// ✅ Correto — lê do ambiente
const token = process.env.STRAPI_API_TOKEN

// ❌ Errado — credencial hardcoded
const token = '8ff2428f3729ceac...'
```

---

## Projeto

Site institucional do **Divercity Park** — parque indoor de diversão infantil.

```
divercity-site/
  frontend/   — Next.js 16 (site público)
  backend/    — Strapi v5 CMS (painel de administração de conteúdo)
  docs/       — Documentação, assets e imagens de referência
```

---

## Stack Frontend

| Tecnologia | Versão | Notas |
|-----------|--------|-------|
| Next.js | **16** App Router | React Compiler ativado, `cacheComponents: true` |
| TypeScript | 5 | strict mode |
| Tailwind CSS | **v4** | CSS-first config via `@theme` em globals.css |
| Framer Motion | 12 | `whileInView` + `viewport` para scroll |
| shadcn/ui | 4 | Componentes em `src/components/ui/` |
| Lucide React | latest | Verificar se o ícone existe antes de usar |

## Stack Backend (Strapi CMS)

| Tecnologia | Versão | Notas |
|-----------|--------|-------|
| Strapi | v5.47.0 | TypeScript, Document Service API |
| SQLite | — | Desenvolvimento local (`.tmp/data.db`) |
| PostgreSQL | — | Produção (cloud) — configurar via env vars |
| `@sensinum/strapi-plugin-mcp` | 1.1.0 | Plugin MCP instalado no Strapi |

**Para iniciar o backend local:**
```bash
cd backend && npm run develop
# Admin: http://localhost:1337/admin
# API:   http://localhost:1337/api
```

---

## Strapi — Content Types

| UID | Tipo | Campos principais |
|-----|------|-------------------|
| `api::atracao.atracao` | Collection | nome, descricao, imagem, cor, ordem |
| `api::preco.preco` | Collection | titulo, subtitulo, cor, ordem, tiers[] |
| `api::depoimento.depoimento` | Collection | nome, estrelas, texto, avatar |
| `api::beneficio.beneficio` | Collection | titulo, descricao, iconeName, gradiente, ordem |
| `api::configuracao-site.configuracao-site` | Single | whatsapp_number, instagram_url, endereco, horarios, tokens de API |

**Componente:** `precos.tier` — label, valor, acompanhante (usado em `api::preco.preco`)

---

## Strapi — Regras

- **Sempre usar Document Service API** (`strapi.documents(uid)`) — Entity Service é deprecated
- Nunca usar `strapi.entityService.*` — Strapi v5 usa `strapi.documents(uid).*`
- Usar `factories.createCoreController/Service/Router` para CRUD padrão
- Invocar a skill `strapi-expert` antes de criar ou modificar qualquer código Strapi
- Rotas administrativas: tipo `admin`, protegidas por `admin::isAuthenticatedAdmin`
- Rotas públicas: tipo `content-api`, com `auth: false` quando necessário

---

## Strapi MCP

O `strapi-mcp` está instalado globalmente e configurado em `.mcp.json`:
- **URL:** `http://localhost:1337`
- **Token:** Configurar `STRAPI_API_TOKEN` no `.mcp.json` após criar um token em Strapi Admin > Settings > API Tokens

Para ativar o MCP, adicione o token no `.mcp.json` e recarregue o Claude Code.

---

## Strapi → Frontend (integração futura)

Os dados em `frontend/src/lib/data.ts` marcados com `// substituir via CMS no futuro` devem ser migrados para chamadas à API do Strapi:

```typescript
// Local (atual)
export const PRECOS: PriceGroup[] = [...]

// CMS (futuro)
const res = await fetch('http://localhost:1337/api/precos?populate=tiers')
const data = await res.json()
```

**Rotas REST do Strapi:**
- `GET /api/atracoes?sort=ordem`
- `GET /api/precos?populate=tiers&sort=ordem`
- `GET /api/depoimentos`
- `GET /api/beneficios?sort=ordem`
- `GET /api/configuracao-site`

---

## Next.js 16 + React Compiler — Regras

- **React Compiler está ativado** — não adicionar `useMemo`, `useCallback` ou `memo()` manualmente; o compiler otimiza automaticamente.
- **`cacheComponents: true` está ativo** — todo dado async em Server Components deve ser cacheado (`'use cache'`) ou estar dentro de `<Suspense>`.
- **`'use cache'`** em funções async que consultam o banco ou APIs externas (ex: `getContentType` em `cms.ts`).
- **Dados dinâmicos de request** (ex: `getServerSession`) devem ser precedidos de `await connection()` do `next/server` para não bloquear prerender.
- **`force-dynamic` não é compatível com `cacheComponents`** — usar `connection()` + `<Suspense>` no lugar.
- **Root layout** envolve `children` com `<Suspense>` para permitir que rotas dinâmicas (admin) façam Partial Prerender.
- **`middleware.ts` foi renomeado para `proxy.ts`** — convenção do Next.js 16.
- **`backend/` está excluído do `tsconfig.json`** — não incluir arquivos Strapi na compilação do frontend.

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
- Imagens de atrações/festas: copiar de `docs/` para `frontend/public/`
- Placeholder para imagens ausentes: `https://placehold.co/600x400/cor/fff?text=Nome`
- Dados parametrizados estão em `frontend/src/lib/data.ts` com comentário `// substituir via CMS no futuro`

---

## Estrutura de Componentes (Frontend)

```
frontend/src/
  app/
    layout.tsx          — fonts, metadata, favicons
    page.tsx            — assembles all sections
    globals.css         — Tailwind @theme + utilities
    api/
      instagram/route.ts — posts do Instagram
      reviews/route.ts   — avaliações do Google
  components/
    ui/
      Navbar.tsx
      ImageModal.tsx
    sections/
      Hero, Benefits, Atracoes, PorQueEscolher,
      Festas, Precos, Galeria, Depoimentos, Contato, Footer
  lib/
    data.ts             — dados estáticos (CMS-ready)
  types/
    index.ts            — TypeScript interfaces
```

---

## MCPs Ativos

| MCP | Status | Uso |
|-----|--------|-----|
| **Figma** (claude.ai) | ✅ Conectado | Design system, layouts |
| **context-mode** | ✅ Conectado | Gerenciar janela de contexto |
| **strapi-mcp** | ⚙️ Configurar token | Gerenciar conteúdo do CMS via Claude |
| **@sensinum/strapi-plugin-mcp** | ⚙️ Instalado no backend | Strapi como servidor MCP |

**Skills disponíveis:** `strapi-expert`, `strapi-v5-expert`, `frontend-design`, `vercel-react-best-practices`

---

## O que NÃO fazer

- Não criar comentários explicando o que o código faz
- Não adicionar features não solicitadas
- Não refatorar código fora do escopo da tarefa
- Não usar `bg-gradient-to-*` (Tailwind v3) — usar `bg-linear-to-*`
- Não usar `flex-shrink-0` — usar `shrink-0`
- Não inventar textos, preços ou informações do negócio
- Não usar `strapi.entityService` (deprecated) — usar `strapi.documents()`
