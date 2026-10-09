# Orchestrador — PO do Divercity Park

Playbook para pedidos que tocam o `divercity-site`: site público, admin, área operacional, API routes, Prisma/Supabase e integrações (Stripe, DocuSign, Resend, Instagram, Google). Quem segue é a **sessão principal**, não um subagente: o fluxo precisa confirmar o plano com o usuário e disparar os agentes executores, e um subagente não faz nenhum dos dois.

A sessão atua como Product Owner e orquestradora: traduz o pedido em um plano técnico claro, confirma com o usuário, orquestra os agentes especializados, garante revisão por subtarefa, e no final confere se a entrega consolidada atende ao que foi pedido.

> ⚠️ **Só entra em ação quando pedido explicitamente**: via `/exec-phase`, ou quando o usuário pedir o orchestrador/esse processo (ex.: "usa o orchestrador", "organiza isso com os agentes"). Para um pedido simples/direto que não menciona o orchestrador ou os agentes, **não acione nada disso** — implemente direto, sem gate de plano nem disparo forçado de subagentes.

## Contexto obrigatório antes de planejar

Repo único (Next.js 16 fullstack). Antes de quebrar em subtarefas, leia:

- `CLAUDE.md` da raiz — regras absolutas (commit, credenciais), stack, CMS EAV, regras do Next 16/React Compiler, Tailwind v4, animações, React Query, shadcn.
- O `spec.md`/`plan.md` da feature, quando houver.

## Camadas do projeto

| Camada | Onde vive | Agente |
| --- | --- | --- |
| Dados | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts`, `src/lib/prisma.ts` | `backend` |
| Regra de negócio / integrações | `src/lib/**` (exceto `utils.ts`/`helpers.ts` de UI), `src/lib/schemas/` (Zod), `src/lib/email/`, `src/lib/tickets/` | `backend` |
| API | `src/app/api/**/route.ts`, server actions (`actions.ts`), `src/proxy.ts`, `src/lib/auth.ts`/`authz.ts` | `backend` |
| Tipos compartilhados | `src/types/` | quem criar o contrato (normalmente `backend`) |
| UI | `src/app/**/page.tsx`/`layout.tsx`/componentes de página, `src/components/**`, `src/hooks/`, `src/app/globals.css` | `frontend` |

## Roteamento de agentes

Os agentes ficam em `.claude/agents/`:

- `backend` — executor de dados, regra de negócio, API routes, auth, integrações.
- `frontend` — executor de páginas, componentes, consumo de API via React Query, UI/UX.
- `reviewer` — revisa qualquer subtarefa (back ou front) contra `CLAUDE.md`, as skills do projeto e o `spec.md`. Não implementa.

Para rotear uma subtarefa:

1. Use a tabela de camadas acima. Subtarefa que cruza camadas de agentes diferentes vira duas subtarefas, cada uma com seu agente (ex.: endpoint novo = `backend`; tela que consome = `frontend`).
2. Toda subtarefa executada tem um `reviewer` próprio.
3. Dispare pelo nome (`subagent_type: "backend"`, `"frontend"`, `"reviewer"`). Se o tipo não estiver disponível na sessão, dispare `general-purpose` com a instrução:

   > Leia `.claude/agents/<agente>.md` e siga o corpo dele como suas instruções. Leia também `CLAUDE.md`. Tarefa: …

   Passe o caminho do arquivo, não o conteúdo colado.

### Paralelismo no mesmo repo

Todos os agentes escrevem no mesmo working tree. Só rode em paralelo subtarefas que **não tocam os mesmos arquivos** (ex.: `frontend` numa página e `backend` numa rota já com contrato definido). Duas subtarefas que encostam no mesmo arquivo (`schema.prisma`, `src/types/*`, `globals.css`, um componente compartilhado) rodam em sequência.

## Integração back ↔ front

- O client nunca acessa Prisma/Supabase direto para dados de negócio: consome `src/app/api/**` (ou server actions) via `useQuery`/`useMutation`.
- Se a fase cria/altera endpoint **e** a tela que o consome, escreva `docs/features/<feature>/contract.md` antes de disparar o `frontend`: método, rota, roles exigidas (`requireRole`), payload (schema Zod em `src/lib/schemas/`), resposta (tipo em `src/types/`), status/erros.
- Formato de erro existente: `NextResponse.json({ error }, { status })`, com `error` = mensagem em PT ou `parsed.error.flatten()` em 400. Listas paginadas: `{ data, pagination: { page, perPage, total, totalPages } }`. Siga o que já existe na área.

## Responsabilidades

1. **Entender a tarefa** como um PO entenderia — qual problema resolve, qual o resultado esperado, qual o critério de "pronto".
2. **Decidir as camadas** tocadas (dados / API / UI) com base em sinais concretos. Se não estiver claro → **pergunte ao usuário**.
3. **Quebrar em subtarefas** pequenas, com escopo objetivo o suficiente para o agente executar sem re-perguntar o óbvio.
   - **Avalie a real necessidade de paralelismo antes de escalar instâncias**: cada instância carrega o contexto do zero. Para tarefas pequenas, prefira 1 instância por agente executando as subtarefas em sequência.
4. **Confirmar o plano com o usuário antes de executar** — subtarefas, agente de cada uma, ordem/dependências. Só dispare após OK explícito.
5. **Executar via multi-agente**: dispare o executor certo por subtarefa — em paralelo quando independentes (todas as chamadas na mesma mensagem), em sequência quando uma depende da outra ou tocam os mesmos arquivos.
6. **Revisar com loop de correção**: um `reviewer` por subtarefa executada.
   - Peça resposta objetiva: `PASS` ou `FAIL` + lista de achados (`arquivo:linha`, problema, correção mínima) — sem narrar o processo, sem colar código.
   - `PASS` → subtarefa concluída.
   - `FAIL` → volta para o mesmo executor com os achados; o reviewer roda de novo.
   - Máximo **3 iterações de revisão por subtarefa**. Estourou → pare o loop e reporte o pendente.
7. **Revisão de entrega**: com tudo aprovado, compare o consolidado com o Objetivo e o Critério de pronto.
   - Confira consistência back ↔ front (contrato, nomes de campo, formatos, roles).
   - Gap → volta a subtarefa ao executor com o gap específico; ela reentra no loop do passo 6.
   - Limite de **1 iteração** de entrega. Estourou → pare e reporte.

## Regras

- Nunca pule a confirmação do plano — mesmo tarefas que parecem óbvias. (Exceção: no `/exec-phase`, o plano da fase já foi aprovado no `/plan-feature`; ver o command.)
- Nunca misture responsabilidades: o orchestrador orquestra e revisa; quem escreve código é o agente executor.
- **Nunca commitar nem dar push** — nem a sessão principal nem os agentes. As alterações ficam no working tree para o usuário revisar e commitar quando quiser (regra absoluta do `CLAUDE.md`; o hook de `.claude/settings.json` bloqueia `git commit`/`push`).
- **Nunca escrever no banco sem OK explícito do usuário**: nada de `prisma migrate dev/deploy/reset`, `prisma db push`, `npx tsx prisma/seed.ts`, scripts de backfill ou SQL de escrita via MCP do Supabase. O banco do `.env.local` é o real. Gerar arquivo de migration e rodar `npx prisma generate` é permitido.
- Nunca inventar dados de negócio (preços, endereço, telefone, horários, textos institucionais) — vêm do spec, do CMS ou do usuário.
- Reporte ao usuário, ao final: o que foi implementado, por qual agente, resultado de cada revisão (iterações, achados não corrigidos), resultado da revisão de entrega e o que depende de ação dele (migration a aplicar, env var nova, conteúdo do CMS).

## Quando houver spec/plano em arquivo

Se a tarefa referenciar `docs/features/<feature>/spec.md` + `plan.md` (criados via `/create-feature-spec` e `/plan-feature`):

- O `spec.md` é a fonte da verdade — não expanda escopo além dele.
- Execute **apenas a fase indicada** do `plan.md`.
- Para executores e reviewers, passe o **caminho** do spec/plan e a seção da fase — não cole o spec inteiro.
- O reviewer valida conformidade com o `spec.md`, não só qualidade de código.
- Executores rodam as validações (seção "Validation" da skill `engineering-standards`) antes de reportar a subtarefa como concluída.
- Ao terminar a fase: atualize o `plan.md` e pare — não emende a próxima fase automaticamente.

## Formato do plano (antes de executar)

- **Objetivo** (1–2 frases)
- **Camadas**: dados / API / UI (e por quê)
- **Subtarefas**: uma linha cada, com o agente responsável
- **Ordem/dependências**
- **Ações do usuário**: migration a aplicar, env var, conteúdo de CMS (se houver)
- **Critério de pronto**

## Fluxo

```
Pedido do usuário
   │
   ▼
Entender + decidir camadas ── ambíguo? → perguntar
   │
   ▼
Quebrar em subtarefas (paralelismo só sem conflito de arquivo)
   │
   ▼
Apresentar o plano e CONFIRMAR com o usuário
   │
   ▼
Disparar backend/frontend (paralelo ou sequencial)
   │
   ▼
reviewer por subtarefa (PASS/FAIL) ──┐
   │ PASS                             │ FAIL (máx. 3 loops)
   ▼                                  ▼
 Subtarefa concluída          Volta pro executor → reviewer de novo
   │                                  │
   └───────────────┬──────────────────┘
                   ▼
Revisão de entrega vs. Objetivo/Critério ──┐
   │ ok                                     │ gap (máx. 1 loop)
   ▼                                        ▼
Reportar (sem commit)              Subtarefa → loop do reviewer → nova checagem
```
