# Plano — Compra antecipada de ingressos

Spec: [`spec.md`](./spec.md). Alvo: `## Mudanças pendentes` (5 itens). O resto do spec é contexto e invariantes a preservar.

## Diagnóstico (resumo)

| Estado | Qtd | Itens |
| --- | --- | --- |
| Ausente | 4 | Rename "preços → valores" (admin); seed que não regrava valores; webhook atômico; escape de HTML no e-mail |
| Parcial / Divergente | 1 | Validação de acompanhante no servidor (hoje só a tela exige a decisão; o servidor aceita `.some` de acompanhantes vinculados) |
| Alinhado | restante de 2.1 a 2.11 | não entra no plano |
| Não verificável | 2 | valores cadastrados no banco; config do Stripe/Resend |

Decisões do usuário (já gravadas em `spec.md`):

- Só os 5 itens de `## Mudanças pendentes` entram. As demais diferenças entre spec e código (seção 2.4 "todas as rotas dependem da feature", 2.8 "em uso/finalizado", colunas de 2.10 etc.) são erros do spec e ficam para `/update-feature-spec ticket-in-advance`.
- A trava `FEATURES_DEV_ONLY_LOCK` (`src/lib/features.ts:34-38`) **não é tocada**. Está documentada em "Pontos em aberto" do spec.
- Rename: admin de passaportes + página compartilhada `/admin/services` (inclui `ServiceForm` e `services/new`). Landing, seed do CMS, Content API, `DashboardContent.tsx:97` e telas de festa (`PartyForm`, `PartyContractTab`) ficam fora.

Regras do projeto que valem em todas as fases (`CLAUDE.md` e `.claude/skills/engineering-standards`): não commitar; não ler `.env*`; **não rodar seed, migrate nem script `prisma/*.ts`** (o banco do `.env.local` é o real); sem comentários explicando o código; texto ao usuário em pt-BR; manter o estilo local de cada arquivo (alguns usam aspas duplas e ponto e vírgula, outros não); não reformatar arquivos inteiros.

Validação padrão em toda fase: `npx tsc --noEmit` limpo e `npx eslint <arquivos alterados>` sem erros novos nas linhas alteradas.

---

- [ ] Fase 1 — Rename "preços" → "valores" nos textos do admin

**Camadas:** UI. **Agente:** `frontend`.

**Requisito atendido:** spec, `## Mudanças pendentes` → "Texto "valores" no lugar de "preços"".

**Origem:** "nos textos visíveis do admin de passaportes e da página compartilhada `/admin/services`, trocar "Preço(s)" por "Valor(es)": item "Preços" da sidebar e do breadcrumb, título e descrições de `/admin/services` e da aba Salão, descrição da aba Passaportes, descrição de `/admin/passport-types/new` e de `/admin/services/new`, e os rótulos "Preço dia de semana (R$)" e "Preço fim de semana (R$)" do formulário de serviço".

**Gap -> estado desejado:** hoje os textos abaixo dizem "Preço(s)"; devem dizer "Valor(es)", trocando só a palavra e mantendo o resto da frase.

| Arquivo | Linha | De | Para |
| --- | --- | --- | --- |
| `src/components/admin/layout/nav-config.ts` | 138 | `label: 'Preços'` | `label: 'Valores'` |
| `src/components/admin/layout/Header.tsx` | 23 | `services: 'Preços'` | `services: 'Valores'` |
| `src/app/admin/(panel)/services/page.tsx` | 65 | "Preços usados no orçamento e na reserva de festas" | "Valores usados no orçamento e na reserva de festas" |
| `src/app/admin/(panel)/services/page.tsx` | 114 | `<h1 ...>Preços</h1>` | `<h1 ...>Valores</h1>` |
| `src/app/admin/(panel)/services/page.tsx` | 116 | "Preços do salão de festas e dos passaportes" | "Valores do salão de festas e dos passaportes" |
| `src/app/admin/(panel)/services/PassportTypesTab.tsx` | 81 | "Preços por duração, usados na compra antecipada e na vitrine do site" | "Valores por duração, usados na compra antecipada e na vitrine do site" |
| `src/app/admin/(panel)/services/ServiceForm.tsx` | 79 | "Preço dia de semana (R$)" | "Valor dia de semana (R$)" |
| `src/app/admin/(panel)/services/ServiceForm.tsx` | 93 | "Preço fim de semana (R$)" | "Valor fim de semana (R$)" |
| `src/app/admin/(panel)/services/new/page.tsx` | 34 | "Cadastre um novo serviço/produto e seus preços" | "Cadastre um novo serviço/produto e seus valores" |
| `src/app/admin/(panel)/passport-types/new/page.tsx` | 34 | "Cadastre uma duração e seus preços para a compra antecipada" | "Cadastre uma duração e seus valores para a compra antecipada" |

Antes de editar, rodar `grep -rniE "pre[çc]os?" src/app/admin src/components/admin` e confirmar que não sobrou outro texto visível nesses mesmos arquivos. Os números de linha podem ter mudado; manda a busca.

**Fora de escopo (não alterar):** nomes de código (`PricesPage`, `PriceFieldName`, `priceFields`, `weekdayPrice`, rota `/admin/services`, `id`/âncora), comentários (`src/proxy.ts:6`, `src/lib/ticket-pricing.ts:55-56`), `DashboardContent.tsx:97`, `PartyForm.tsx:416`, `PartyContractTab.tsx:304`, landing (`src/lib/data.ts`, `prisma/seed.ts`), `src/lib/content-api/entities.ts`.

**Migration:** não. **Contrato:** não precisa de `contract.md` (só texto).

**Critério de pronto:** nenhuma ocorrência de "Preço(s)" nos textos visíveis dos 6 arquivos da tabela e nos dois de `nav-config.ts`/`Header.tsx`; nada mais mudou.

**Como verificar:** `npx tsc --noEmit`; `npx eslint` nos 8 arquivos; no `npm run dev` abrir `/admin/services` (sidebar, breadcrumb "Valores", título, descrição, aba Passaportes), `/admin/services/new` (labels dos dois valores e descrição), `/admin/passport-types/new` (descrição).

**Ações do usuário:** nenhuma.

Arquivos alterados:

---

- [ ] Fase 2 — Seed não sobrescreve os valores dos passaportes fixos

**Camadas:** dados (seed). **Agente:** `backend`.

**Requisito atendido:** spec, 2.1 ("Os valores vêm do banco (cadastrados pelo admin), não do código").

**Origem:** "Seed não sobrescreve valores: o `upsert` dos passaportes fixos … em `prisma/seed.ts` só cria; rodar o seed de novo não pode regravar os quatro valores editados pelo admin."

**Gap -> estado desejado:** `prisma/seed.ts` (bloco "Valores fixos dos passaportes", `passportTypesData` e o `for` logo abaixo, perto da linha 1496) faz `prisma.passportType.upsert({ where: { key }, update: { weekdayChildPrice, weekendChildPrice, weekdayCompanionPrice, weekendCompanionPrice }, create: data })`. O `update` regrava os valores a cada execução. Deve ser `update: {}`, mantendo `create: data` e o `console.log`. Remover a desestruturação `const { weekdayChildPrice, … } = data` se ficar sem uso. Não mudar os valores de `passportTypesData`.

**Migration:** não. **Contrato:** não.

**Critério de pronto:** o `update` do upsert não escreve nenhum campo; `create` e `where` iguais; nenhuma variável sem uso.

**Como verificar:** `npx tsc --noEmit`; `npx eslint prisma/seed.ts` (reportar erros pré-existentes sem corrigir). **Não executar o seed.**

**Ações do usuário:** nenhuma. (Se quiser conferir, só ele roda o seed.)

Arquivos alterados:

---

- [ ] Fase 3 — Webhook do Stripe marca `payment_failed` de forma atômica

**Camadas:** API. **Agente:** `backend`.

**Requisito atendido:** spec, 2.5 ("marcam o pedido como `payment_failed`, só se estiver em `pending_payment`").

**Origem:** "Webhook atômico: `checkout.session.async_payment_failed` e `checkout.session.expired` só marcam `payment_failed` se o pedido ainda estiver em `pending_payment`, na mesma operação (`updateMany` condicionado), sem ler antes; um pedido `paid` nunca volta para `payment_failed`."

**Gap -> estado desejado:** `src/app/api/webhooks/stripe/route.ts` (função `markOrderAsFailed`, linhas 7-13) faz `findUnique` e depois `update({ where: { id: orderId } })` sem condição. Se `finalizeOrderPayment` gravar `paid` entre as duas chamadas, o `update` sobrescreve para `payment_failed`. Trocar por um único `prisma.ticketOrder.updateMany({ where: { id: orderId, status: 'pending_payment' }, data: { status: 'payment_failed' } })`, mantendo o `if (!orderId) return`. Mesmo padrão de `src/lib/tickets/finalize-payment.ts`. O restante do handler (assinatura, eventos, `{ received: true }`) não muda. Manter aspas duplas e ponto e vírgula do arquivo.

**Migration:** não. **Contrato:** não.

**Critério de pronto:** `markOrderAsFailed` tem uma única chamada ao banco, condicionada ao status; sem `findUnique`.

**Como verificar:** `npx tsc --noEmit`; `npx eslint src/app/api/webhooks/stripe/route.ts`. Para testar o fluxo real, o usuário pode usar o Stripe CLI (`stripe trigger checkout.session.expired`) contra o `npm run dev`; ver o pedido ir de `pending_payment` a `payment_failed` e um pedido `paid` permanecer `paid`.

**Ações do usuário:** teste de pagamento no Stripe de teste, se quiser validar.

Arquivos alterados:

---

- [ ] Fase 4 — Servidor valida a decisão e o vínculo do acompanhante gratuito

**Camadas:** regra de negócio / API. **Agente:** `backend`.

**Requisito atendido:** spec, 2.3 (acompanhante gratuito: "a tela exige decidir"; "exige os dados de 1 acompanhante vinculado").

**Origem:** "Acompanhante validado no servidor: o `POST /api/tickets/checkout` recusa (400) criança com menos de 60 meses sem `hasCompanion` definido; o quote continua aceitando (a tela consulta o valor antes da decisão). Quote e checkout recusam (400) mais de 1 acompanhante vinculado à mesma criança e acompanhante vinculado a criança sem `hasCompanion = true`."

**Gap -> estado desejado:** em `src/lib/ticket-pricing.ts`, `priceOrder(input)`:

1. Decisão obrigatória só no checkout. Hoje uma criança com menos de 60 meses (`ageMonths < COMPANION_ELIGIBLE_MAX_AGE_MONTHS`) com `hasCompanion === undefined` passa. Adicionar um segundo parâmetro opcional `options?: { requireCompanionDecision?: boolean }`. Quando `true`, criança elegível com `hasCompanion === undefined` lança `TicketPricingError` com mensagem em pt-BR, no padrão das existentes (premissa de texto: `Informe se "${child.name}" terá acompanhante`). `src/app/api/tickets/checkout/route.ts:26` passa `{ requireCompanionDecision: true }`; `src/app/api/tickets/quote/route.ts:21` continua sem a opção. **Motivo:** `useTicketCart.ts` (`canQuote`, linhas ~106-115) dispara o quote assim que nome, data e passaporte estão preenchidos, antes de o usuário decidir "com/sem acompanhante"; recusar no quote faria o painel de resumo exibir erro durante o preenchimento.
2. Exatamente 1 acompanhante vinculado por criança. O laço final (`for (const child of pricedChildren)`, que usa `pricedCompanions.some((c) => c.linkedChild === child)`) deve contar os acompanhantes vinculados: 0 mantém a mensagem atual `Informe os dados do acompanhante gratuito de "${child.name}"`; mais de 1 lança `TicketPricingError` (premissa de texto: `"${child.name}" só pode ter 1 acompanhante gratuito vinculado`). Vale para quote e checkout. Hoje 2 vinculados à mesma criança dão 200 no quote e 500 no checkout (unique `linkedChildId`).
3. Vínculo a criança sem `hasCompanion = true` já é recusado pelo código (`Não é possível vincular um acompanhante gratuito a "{nome}" nessas condições`, `ticket-pricing.ts` ~linhas 102-113); **não mexer**, só manter.

Não alterar: o limite de 1 acompanhante do grupo no schema Zod (`src/lib/schemas/tickets.ts`), `computeChildUnitPrice`, a regra dos 60 meses, o cálculo de idade, nem o formato de resposta de `TicketPricingError` (400 com `{ error: string }`). Não mexer na UI.

**Migration:** não. **Contrato:** não cria endpoint nem altera o formato de resposta; a UI não muda.

**Critério de pronto:** (a) checkout com criança de menos de 60 meses sem `hasCompanion` responde 400 com a mensagem; (b) o mesmo payload no quote continua 200; (c) 2 acompanhantes com o mesmo `linkedChildIndex` respondem 400 no quote e no checkout, sem 500; (d) os fluxos válidos (com acompanhante, sem acompanhante com termo, 60 meses ou mais, acompanhante do grupo) seguem iguais.

**Como verificar:** `npx tsc --noEmit`; `npx eslint src/lib/ticket-pricing.ts src/app/api/tickets/checkout/route.ts`; chamadas de API no `npm run dev` (com a feature habilitada, só funciona em `NODE_ENV=development` por causa da trava): `POST /api/tickets/quote` e `POST /api/tickets/checkout` com os payloads (a), (b) e (c) acima; conferir também uma compra normal pela tela `/compra-antecipada` até a etapa de revisão (o quote não pode exibir erro ao escolher "Com acompanhante" depois de preencher a criança). O checkout cria pedido `pending_payment` no banco real: usar só os payloads que devem falhar na validação, ou aprovar um teste no Stripe de teste.

**Ações do usuário:** decidir se aprova as duas mensagens novas de erro (premissas); opcional, teste de pagamento no Stripe de teste.

Arquivos alterados:

---

- [ ] Fase 5 — Escapar HTML do e-mail de confirmação

**Camadas:** integração (Resend). **Agente:** `backend`.

**Requisito atendido:** spec, 2.6 (conteúdo do e-mail).

**Origem:** "E-mail sem HTML injetado: nomes digitados pelo cliente (responsável, crianças, acompanhantes) passam por escape no HTML do e-mail de confirmação."

**Gap -> estado desejado:** `src/lib/email/send-ticket-confirmation.ts`, função `buildEmailHtml`, interpola texto digitado pelo cliente sem escape. Não existe helper de escape no projeto (`grep escapeHtml` em `src` não acha nada). Criar um helper local no mesmo arquivo (`escapeHtml`, trocando `& < > " '`) e aplicá-lo, dentro de `buildEmailHtml`, em: `params.guardianName` (saudação "Olá, …!"), `params.guardianPhone` e `params.guardianWhatsapp` (aviso "Sem acompanhante … Contato"), `c.name`, `c.companionName` e `c.passportTypeName` nas linhas de crianças, `c.name` nas linhas de acompanhantes adicionais, e nos blocos de ticket `t.holderName` (parágrafo e `alt` da imagem), `t.passportTypeName` e `t.companionIncluded.name`. Não escapar valores gerados pelo servidor (`t.shortCode`, `qrCodeCid`, `confirmationUrl`, valores de `currency(...)`). Assunto, anexos, `contentId` e o texto fixo do e-mail não mudam. Manter aspas duplas e ponto e vírgula do arquivo.

**Migration:** não. **Contrato:** não.

**Critério de pronto:** nenhum dado digitado pelo cliente entra no HTML sem passar por `escapeHtml`; um nome como `<b>Ana</b> & "Cia"` aparece literalmente no e-mail.

**Como verificar:** `npx tsc --noEmit`; `npx eslint src/lib/email/send-ticket-confirmation.ts`. O envio real depende de `RESEND_API_KEY` e `RESEND_FROM_EMAIL` e de um pedido pago; o usuário pode validar com uma compra de teste no Stripe de teste e abrir o e-mail recebido.

**Ações do usuário:** compra de teste se quiser ver o e-mail renderizado (envia e-mail real).

Arquivos alterados:

---

## Depois de executar

- `/exec-phase ticket-in-advance 1` (independente das demais). As fases 2, 3, 4 e 5 também são independentes entre si; todas podem rodar juntas (`/exec-phase ticket-in-advance 1-5`).
- `/update-feature-spec ticket-in-advance` para mover os 5 itens de `## Mudanças pendentes` para o estado atual e corrigir as divergências do diagnóstico que ficaram de fora do plano (2.4, 2.8, 2.9, 2.10, seção 1 e referências quebradas da seção 3).
