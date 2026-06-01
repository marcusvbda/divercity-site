# Divercity Park — Regras do Projeto

## ⛔ REGRA MAIS IMPORTANTE

**NUNCA faça `git commit` ou `git push` sem o usuário pedir explicitamente.**

Isso inclui:
- Não commitar ao final de tarefas automaticamente
- Não commitar como parte de um "plano de implementação"
- Não usar `--amend` sem pedir
- Apenas executar `git commit` quando o usuário disser literalmente "commita", "faz o commit", "commit isso" ou equivalente

---

## Projeto

Site institucional do **Divercity Park** — parque indoor de diversão infantil.

- Frontend: `frontend/` — Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion
- Documentação e assets: `docs/`
- Backend (futuro): `backend/`

---

## Stack

| Tecnologia | Versão | Notas |
|-----------|--------|-------|
| Next.js | 16 App Router | React Compiler ativado |
| TypeScript | 5 | strict mode |
| Tailwind CSS | **v4** | CSS-first config via `@theme` em globals.css |
| Framer Motion | 12 | `whileInView` + `viewport` para scroll (não `useInView` + `animate`) |
| shadcn/ui | 4 | Componentes em `src/components/ui/` |
| Lucide React | latest | Verificar se o ícone existe antes de usar |

---

## Convenções Tailwind v4

- Cores da marca via CSS vars: `bg-brand-cyan`, `text-brand-pink`, etc. (definidas no `@theme` de globals.css)
- Gradientes: `bg-linear-to-r` (não `bg-gradient-to-r`)
- `shrink-0` (não `flex-shrink-0`)
- `min-h-52` (não `min-h-[208px]`) — usar escala Tailwind quando possível

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
- Dados parametrizados para CMS futuro ficam em `frontend/src/lib/data.ts` com comentário `// substituir via CMS no futuro`

---

## Estrutura de Componentes

```
frontend/src/
  app/
    layout.tsx        — fonts, metadata, favicons
    page.tsx          — assembles all sections
    globals.css       — Tailwind @theme + utilities
  components/
    ui/
      Navbar.tsx
      ImageModal.tsx  — modal reutilizável para ampliar imagens
    sections/
      Hero.tsx
      Benefits.tsx
      Atracoes.tsx
      PorQueEscolher.tsx
      Festas.tsx
      Precos.tsx
      Galeria.tsx
      Depoimentos.tsx
      Contato.tsx
      Footer.tsx
  lib/
    data.ts           — todos os dados estáticos (CMS-ready)
  types/
    index.ts          — TypeScript interfaces
```

---

## Dados CMS-Ready

Os seguintes dados estão em `data.ts` com variável exportada e comentário CMS:
- `WHATSAPP_NUMBER` — número do WhatsApp de contato
- `PRECOS` — tabela de preços com tiers por duração
- `PRICE_DISCLAIMERS` — regras de acompanhantes e descontos
- `ATRACOES` — atrações do parque com imagens e descrições
- `NAV_ITEMS` — links de navegação

---

## MCPs Recomendados

| MCP | Uso |
|-----|-----|
| **Figma** (claude.ai/Figma) | Design system, inspecionar layouts, gerar componentes a partir de designs |
| **context-mode** | Gerenciar janela de contexto em sessões longas |
| **Strapi** (futuro) | Quando o backend CMS for integrado |

---

## O que NÃO fazer

- Não criar comentários explicando o que o código faz (os nomes já explicam)
- Não adicionar features não solicitadas
- Não refatorar código fora do escopo da tarefa
- Não usar `bg-gradient-to-*` (é Tailwind v3) — usar `bg-linear-to-*`
- Não usar `flex-shrink-0` — usar `shrink-0`
- Não inventar textos, preços ou informações do negócio
