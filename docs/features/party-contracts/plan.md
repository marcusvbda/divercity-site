# Plano — party-contracts

Spec: [docs/features/party-contracts/spec.md](spec.md) (alvo: `## Mudanças pendentes`)

## Diagnóstico (spec × código)

| Estado | Qtd | Itens |
| --- | --- | --- |
| Implementado e alinhado | 0 | — |
| Parcial / divergente | 1 | Navegação entre steps no portal: o "Voltar" do passo 2 só aparece com `unfilledVars > 0` e some após o refetch; o `PUT /api/client/contract/[hash]` só grava chaves vazias, então o cliente não consegue corrigir |
| Ausente | 8 | Valor do contrato; informações adicionais; status de pagamento; variáveis `contrato_*`; colunas na Agenda; tipo por variável extra (persistência, escolha no formulário/popover, input tipado + formatação no documento) |
| Não verificável | 1 | Preço do serviço `party_salon` cadastrado no banco (default do valor depende dele) |

## Premissas (assumidas, não confirmadas pelo usuário)

- **P1.** Tipo padrão de variável extra sem tipo (modelos/variáveis existentes) = `text`.
- **P2.** O tipo persiste em `ContractTemplate.variableTypes Json @default("{}")` (`{ [variavel]: "text" | "time" | "number" | "date" }`); só guarda chaves que existem em `variables`. Os contratos leem o tipo do modelo da festa (sem snapshot).
- **P3.** Formato salvo em `fieldValues`: date = `YYYY-MM-DD` (valor do `<input type="date">`), time = `HH:mm`, number = inteiro em string, text = livre. No documento: date → `dd/mm/aaaa`, time → `HH:mm`, number → inteiro sem separador de milhar. Valor que não bate com o formato do tipo (ex.: salvo antes da troca de tipo) sai **como está**.
- **P4.** Reserva pública (`/orcamento`) e contratos existentes: `value = null`, `paymentStatus = unpaid`, `additionalInfo = null`. Na aba "Contrato", se `value` for `null`, o input vem preenchido com o preço do salão pela data da festa (sugestão, só grava ao salvar).
- **P5.** Valor e informações adicionais travam quando o contrato está `signed`/`completed`/`cancelled`; o status de pagamento continua editável em qualquer status.
- **P6.** O preço do salão sai de `GET /api/party-budget/quote?date=<ISO>&paymentOption=salon_only` (campo `salonPrice`), que já existe. Em "Nova festa", ele é recalculado ao trocar a data enquanto o admin não tiver editado o valor manualmente.
- **P7.** Variáveis padrão novas: `contrato_valor` (BRL, `R$ 1.234,56`), `contrato_status_pagamento` ("Não pago" / "Parcial" / "Pago") e `contrato_informacoes_adicionais`. `isDefaultVariable` passa a reconhecer o prefixo `contrato_`. Risco: um modelo que já use uma variável extra chamada `contrato_*` passa a tratá-la como padrão.
- **P8.** Portal: navegação livre entre os passos 1 ↔ 2 ↔ 3 até a assinatura, inclusive em `in_review`. O próximo "Assinar" cria um envelope novo com os valores atualizados, como já acontece hoje.
- **P9.** "Variáveis que o cliente preencheu" ficam registradas em `Contract.clientFilledKeys String[] @default([])`. Se o admin alterar depois uma chave que o cliente preencheu, ela continua editável pelo cliente.
- **P10.** Status de pagamento = enum `ContractPaymentStatus { unpaid partial paid }`, rótulos "Não pago" / "Parcial" / "Pago".

## Fases

- [ ] Fase 1 — Dados: campos de pagamento, tipos de variável e chaves preenchidas pelo cliente

  - **Camadas / agente:** dados · `backend`
  - **Requisitos:** campos do contrato (valor, informações adicionais, status de pagamento); persistência do tipo de variável; base para a navegação do portal.
  - **Origem:** Mudanças pendentes, "Ao criar um contrato no admin, o usuário deve informar o **valor do contrato**", "Deve haver um campo de texto longo (textarea) **Informações adicionais**", "Deve haver um **status de pagamento** selecionável", "cada variável adicional (extra) deve permitir escolher o **tipo de input**" e "No step 1 o cliente pode editar **somente as variáveis extras que ele mesmo preencheu**".
  - **Gap → desejado:**
    - `prisma/schema.prisma`:
      - novo `enum ContractPaymentStatus { unpaid partial paid }`;
      - `Contract` ganha `value Decimal? @db.Decimal(10, 2)`, `additionalInfo String?`, `paymentStatus ContractPaymentStatus @default(unpaid)` e `clientFilledKeys String[] @default([])`;
      - `ContractTemplate` ganha `variableTypes Json @default("{}")`.
    - `src/types/parties.ts`:
      - `ContractPaymentStatus` e `ContractVariableType = 'text' | 'time' | 'number' | 'date'`;
      - `Contract` ganha `value?: string | null`, `additionalInfo?: string | null`, `paymentStatus`, `clientFilledKeys: string[]`;
      - `ContractTemplate` ganha `variableTypes: Record<string, ContractVariableType>`.
    - `src/lib/schemas/parties.ts`: `ContractPaymentStatusSchema = z.enum(['unpaid','partial','paid'])` e `ContractVariableTypeSchema = z.enum(['text','time','number','date'])` exportados, com os tipos inferidos.
  - **Migration:** sim. Escrever o SQL **manualmente** em `prisma/migrations/<timestamp>_contract_payment_and_variable_types/migration.sql`, só com o enum e as 5 colunas novas. **Atenção (schema drift):** `Contract.docusignEnvelopeId` está no schema, mas nenhuma migration o cria. Não deixar o `prisma migrate dev` gerar um `ADD COLUMN "docusignEnvelopeId"` junto, e não rodar migration no banco (regra do projeto). Rodar `npx prisma generate`.
  - **Contrato:** não.
  - **Critério de pronto:** schema e migration com os 5 campos e o enum; client gerado; tipos e schemas zod exportados; `tsc` sem erros novos.
  - **Como verificar:** `npx prisma validate`, `npx prisma generate`, `npx tsc --noEmit`, eslint em `src/types/parties.ts` e `src/lib/schemas/parties.ts`; revisar o SQL da migration.
  - **Ação do usuário:** aplicar a migration no Supabase (`npx prisma migrate deploy` ou SQL editor).

  Arquivos alterados:

- [ ] Fase 2 — Variáveis padrão `contrato_*` e render compartilhado do documento

  - **Camadas / agente:** regra/API · `backend`
  - **Requisitos:** os três dados viram variáveis padrão nos modelos; formatação por tipo no documento (date `dd/mm/aaaa`, number inteiro, time `HH:mm`); trocar o tipo não altera valores salvos.
  - **Origem:** Mudanças pendentes, "Os três dados viram **variáveis padrão** disponíveis nos modelos de contrato", "Formato no documento do contrato: date `dd/mm/aaaa`, number como número inteiro, time `HH:mm`" e "Trocar o tipo de uma variável não altera valores já salvos".
  - **Gap → desejado:**
    - `src/lib/contract-defaults.ts`:
      - `isDefaultVariable` aceita também o prefixo `contrato_`;
      - nova `buildContractValues(contract)` que devolve `contrato_valor` (BRL via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, convertendo `Decimal` do Prisma ou string com `Number(String(v))`; vazio se `null`), `contrato_status_pagamento` (rótulo P10) e `contrato_informacoes_adicionais` (texto, vazio se `null`).
    - Novo `src/lib/contract-render.ts` (isomórfico, sem Prisma):
      - `formatVariableValue(value, type)` segue P3;
      - `renderContractBody(body, values, types, { highlightMissing })` substitui `{{var}}`;
      - com `highlightMissing`, uma variável extra vazia vira o `<span class="bg-amber-100 text-amber-700 rounded px-1 font-mono text-xs">{{var}}</span>` atual, e uma variável padrão vazia vira `''`;
      - sem `highlightMissing`, vira `''`;
      - `formatVariableValue` só se aplica às variáveis extras com tipo; as padrão saem como vêm.
    - `src/app/api/client/contract/[hash]/sign/route.ts`: monta o HTML com `renderContractBody(contract.body, { ...buildDefaultValues(party), ...buildContractValues(contract), ...fieldValues }, party.contractTemplate.variableTypes, { highlightMissing: false })`.
    - `src/app/api/admin/contract-variables/route.ts`: a resposta ganha `contrato: [{ key, variable, label }]` com lista fixa (`contrato_valor` "Valor do contrato", `contrato_status_pagamento` "Status de pagamento", `contrato_informacoes_adicionais` "Informações adicionais").
  - **Migration:** não.
  - **Contrato:** não (o consumo na UI acontece nas fases 4 e 5, que seguem o formato descrito aqui).
  - **Critério de pronto:** o `sign` gera o HTML com `contrato_*` e valores tipados formatados; `GET /api/admin/contract-variables` devolve o grupo `contrato`; funções puras exportadas.
  - **Como verificar:** `npx tsc --noEmit`; eslint nos arquivos; `curl localhost:3000/api/admin/contract-variables` com `npm run dev`; checagem manual de `formatVariableValue('2026-12-05','date') === '05/12/2026'`, `('14:30','time') === '14:30'`, `('12','number') === '12'`, `('05/12/2026','date') === '05/12/2026'` (legado sai como está).
  - **Ação do usuário:** nenhuma.

  Arquivos alterados:

- [ ] Fase 3 — API de valor, informações adicionais e status de pagamento

  - **Camadas / agente:** API · `backend`
  - **Requisitos:** valor obrigatório na criação pelo admin; editável depois na aba "Contrato"; status com 3 estados; informações adicionais obrigatórias se Parcial.
  - **Origem:** Mudanças pendentes, "São informados no formulário **Nova festa** e editáveis depois na **aba Contrato**", "**Valor do contrato:** obrigatório em Nova festa", "**Status de pagamento:** três estados" e "**Informações adicionais:** ... com status **Parcial** passa a ser **obrigatório**".
  - **Gap → desejado:**
    - `src/lib/schemas/parties.ts`:
      - `ContractPaymentSchema = z.object({ value: z.number().min(0, 'Valor inválido'), paymentStatus: ContractPaymentStatusSchema, additionalInfo: z.string().trim().optional().nullable() })` com refine `paymentStatus !== 'partial' || !!additionalInfo` (mensagem "Descreva a negociação do pagamento parcial", path `additionalInfo`);
      - `CreatePartySchema = PartySchema.extend({ contract: ContractPaymentSchema })`;
      - `UpdateContractPaymentSchema` = mesmos campos, com `value` aceitando `null`.
    - `POST /api/admin/parties` (`src/app/api/admin/parties/route.ts`): valida com `CreatePartySchema` (400 `flatten()`) e grava `value`, `paymentStatus` e `additionalInfo` (string vazia vira `null`) no `contract.create`. O `PUT /api/admin/parties/[id]` continua com `PartySchema` (sem os campos).
    - Novo `PATCH /api/admin/contracts/[id]/payment` (`src/app/api/admin/contracts/[id]/payment/route.ts`):
      - 400 `flatten()`; 404 "Contrato não encontrado";
      - se o contrato estiver `signed`/`completed`/`cancelled` e `value` ou `additionalInfo` diferirem do atual: 403 "Valor e informações adicionais não podem ser alterados após a assinatura" (P5); `paymentStatus` sempre aceito, mas o refine do Parcial vale contra o `additionalInfo` final;
      - responde o contrato atualizado.
    - `POST /api/party-budget/reservations`: sem mudança (defaults do banco, P4).
  - **Migration:** não (depende da Fase 1).
  - **Contrato:** **sim**. Criar `docs/features/party-contracts/contract.md` com o payload do `POST /api/admin/parties` (`contract: { value, paymentStatus, additionalInfo }`), o `PATCH /api/admin/contracts/[id]/payment` (request, respostas, erros e mensagens) e os campos novos de `Contract` nas respostas de `GET /api/admin/parties` e `GET /api/admin/parties/[id]` (`value` vem como string decimal). Fazer isso antes da Fase 4.
  - **Critério de pronto:** criar festa sem `contract.value` → 400; com Parcial e sem info → 400; `PATCH` em contrato `signed` mudando só o `paymentStatus` → 200; mudando o valor → 403.
  - **Como verificar:** `npx tsc --noEmit`; eslint; com `npm run dev`, `curl -X POST /api/admin/parties` e `curl -X PATCH /api/admin/contracts/<id>/payment` nos cenários acima (banco de dev com a migration aplicada).
  - **Ação do usuário:** migration da Fase 1 aplicada.

  Arquivos alterados:

- [ ] Fase 4 — UI de valor, informações adicionais e status de pagamento (Nova festa, aba Contrato, Agenda, painel de variáveis)

  - **Camadas / agente:** UI · `frontend` (ler `docs/features/party-contracts/contract.md` antes)
  - **Requisitos:** campos em "Nova festa" (valor pré-preenchido com o preço do salão pela data e editável) e na aba "Contrato"; colunas na Agenda; variáveis `contrato_*` no painel do modelo.
  - **Origem:** Mudanças pendentes, "O campo já vem preenchido com o **preço do salão** cadastrado em Preços ... e o admin pode alterá-lo manualmente", "São informados no formulário **Nova festa** e editáveis depois na **aba Contrato**", "Valor e status de pagamento aparecem como **colunas na Agenda**" e "Os três dados viram **variáveis padrão** disponíveis nos modelos".
  - **Gap → desejado:**
    - `src/app/admin/(panel)/parties/PartyForm.tsx`:
      - nova prop `mode: 'create' | 'edit'` (Nova festa passa `create`, aba Dados passa `edit`);
      - só em `create`, novo card **"4. Valor e pagamento"** com:
        - "Valor do contrato *" (input numérico em R$, obrigatório, ≥ 0);
        - "Status de pagamento" (Select do kit admin: Não pago / Parcial / Pago, padrão Não pago);
        - "Informações adicionais" (`Textarea` do kit admin, opcional, com rótulo "*" e obrigatório quando Parcial; placeholder sobre a negociação/formas de pagamento);
      - default do valor via `useQuery` em `/api/party-budget/quote?date=<ISO da data+início>&paymentOption=salon_only` → `salonPrice` (P6); recalcula ao trocar a data/horário até o admin editar o campo;
      - se a consulta falhar, o campo fica vazio, com ajuda "Não foi possível obter o preço do salão; informe o valor.";
      - `PartyFormData` ganha `contract?: { value, paymentStatus, additionalInfo }`.
    - `src/app/admin/(panel)/parties/new/page.tsx`: passa `mode="create"`. Na aba Dados (`src/app/admin/(panel)/parties/[id]/page.tsx`), passa `mode="edit"`.
    - `src/app/admin/(panel)/parties/[id]/PartyContractTab.tsx`:
      - novo card **"Valor e pagamento"** acima de "Variáveis do Contrato", com os mesmos 3 campos e o botão "Salvar pagamento" (`useMutation` → `PATCH /api/admin/contracts/[id]/payment`; toasts "Pagamento salvo" / `error` ou "Erro ao salvar pagamento"; invalida `['admin','parties',partyId]`);
      - com `value === null`, o input vem com o preço do salão pela data da festa (P4);
      - em `signed`/`completed`/`cancelled`, valor e informações ficam desabilitados e só o status edita (P5);
      - o preview passa a incluir `buildContractValues(contract)` nos valores e a usar `renderContractBody` (Fase 2) com `highlightMissing: true`.
    - `src/app/admin/(panel)/parties/page.tsx` (Agenda, lista): colunas **"Valor"** (`contract.value` em BRL ou "—") e **"Pagamento"** (Badge do kit admin: Não pago `outline`, Parcial `secondary`, Pago `default`; "—" sem contrato), depois de "Contrato".
    - `src/app/admin/(panel)/contract-templates/TemplateForm.tsx`: o tipo `ContractVariables` ganha `contrato` e o painel "Variáveis padrão disponíveis" ganha a aba **"Contrato"**.
    - `src/app/c/[hash]/ClientPortal.tsx`: o preview passa a incluir `buildContractValues(contract)` e a usar `renderContractBody` (sem tipos ainda; os tipos entram na Fase 5).
  - **Migration:** não.
  - **Contrato:** consome `contract.md` (Fase 3).
  - **Critério de pronto:**
    - criar festa com valor sugerido e editado, status Parcial e informação → aparece na aba Contrato e na Agenda;
    - em contrato assinado, só o status edita;
    - `{{contrato_valor}}` aparece formatado no preview do admin e do portal.
  - **Como verificar:** `npx tsc --noEmit`; eslint nos arquivos; `npm run dev` → `/admin/parties/new`, `/admin/parties/<id>` (aba Contrato), `/admin/parties` (Lista), `/admin/contract-templates/new` (aba Contrato no painel), `/c/<token>`.
  - **Ação do usuário:** conferir se o serviço `party_salon` está cadastrado em `/admin/services` (sem ele a sugestão fica vazia).

  Arquivos alterados:

- [ ] Fase 5 — Tipo de input por variável extra (modelo, editor, portal e aba Contrato)

  - **Camadas / agente:** API + UI · `backend` (schema/rotas de modelo) → `frontend` (editor, formulário, inputs)
  - **Requisitos:** escolher o tipo (text/time/number/date) no formulário do modelo e no popover "Variável extra"; o tipo vale no portal e no editor da aba "Contrato"; formatação no documento; trocar o tipo não altera valores salvos.
  - **Origem:** Mudanças pendentes, "cada variável adicional (extra) deve permitir escolher o **tipo de input**", "A escolha do tipo é feita no formulário do modelo e no popover Variável extra do editor", "Os tipos devem ser bem básicos: **input text**, **input time**, **input number** e **input date**", "O tipo vale para o portal do cliente e também para o editor de variáveis na aba Contrato do admin" e "Trocar o tipo de uma variável não altera valores já salvos".
  - **Gap → desejado (backend):**
    - `ContractTemplateSchema` ganha `variableTypes: z.record(z.string(), ContractVariableTypeSchema).optional()`;
    - `POST /api/admin/contract-templates` e `PUT /api/admin/contract-templates/[id]` gravam `variableTypes` filtrado às chaves de `variables` extraídas (P2);
    - o `PUT` **não** mexe em `fieldValues` por causa do tipo; a propagação atual de `body`/`fieldValues` continua igual.
  - **Gap → desejado (frontend):**
    - `src/components/admin/tiptap-editor.tsx`:
      - o popover "Variável extra" ganha um Select **"Tipo"** (Texto / Hora / Número / Data, padrão Texto) abaixo do nome;
      - nova prop opcional `onInsertVariable?: (name: string, type: ContractVariableType) => void`, chamada ao inserir.
    - `TemplateForm.tsx`:
      - estado `variableTypes` (inicial de `defaultValues.variableTypes ?? {}`), atualizado por `onInsertVariable`;
      - no alerta "Variáveis extras detectadas", cada variável vira uma linha com o badge `{{var}}` e um Select de tipo;
      - envia `variableTypes` no submit; `ContractTemplateInput` já inclui o campo pelo schema.
    - Páginas `contract-templates/[id]/page.tsx` e `new/page.tsx`: repassam `variableTypes` em `defaultValues` e no payload, se necessário.
    - `PartyContractTab.tsx` → `VariablesEditor` recebe `types` e renderiza `<Input type="text|time|number|date">` (number com `step={1}` e `inputMode="numeric"`); valor salvo fora do formato do tipo aparece num input texto com o valor atual, para não ser apagado (P3).
    - `ClientPortal.tsx`: passo 1 com o mesmo input tipado; o preview (passos 2 e assinado) usa `renderContractBody(..., party.contractTemplate.variableTypes)`.
    - Extrair o mapa de rótulos dos tipos (Texto/Hora/Número/Data) para um único lugar, por exemplo `src/lib/contract-render.ts`.
  - **Migration:** não (depende da Fase 1).
  - **Contrato:** **sim**. Atualizar `contract.md` com `variableTypes` no request/resposta de `POST`/`PUT`/`GET /api/admin/contract-templates[/id]` antes do `frontend`.
  - **Critério de pronto:**
    - criar uma variável Data pelo popover → o tipo aparece selecionado no alerta;
    - salvar → reabrir mantém o tipo;
    - no portal e na aba Contrato aparece o date picker; o preview mostra `dd/mm/aaaa`;
    - trocar o tipo para Texto não altera o valor salvo.
  - **Como verificar:** `npx tsc --noEmit`; eslint; `npm run dev` → `/admin/contract-templates/<id>`, `/admin/parties/<id>` (aba Contrato), `/c/<token>`; conferir o HTML enviado no `sign` (log temporário ou envelope de teste no DocuSign demo).
  - **Ação do usuário:** revisar os tipos das variáveis extras dos modelos existentes (todos começam como Texto).

  Arquivos alterados:

- [ ] Fase 6 — Navegação entre steps no portal do cliente

  - **Camadas / agente:** API + UI · `backend` (PUT do cliente) → `frontend` (`ClientPortal`)
  - **Requisitos:** o cliente navega entre os passos e consegue voltar do passo 2 ao 1 para corrigir; edita só as variáveis extras que ele mesmo preencheu (mais as vazias); valores do admin protegidos.
  - **Origem:** Mudanças pendentes, "o cliente deve conseguir **navegar entre os steps**", "estando na revisão do contrato (step 2), se notar algo errado ... deve conseguir voltar" e "No step 1 o cliente pode editar **somente as variáveis extras que ele mesmo preencheu** (mais as que ainda estão vazias)".
  - **Gap → desejado (backend):** `PUT /api/client/contract/[hash]` (`src/app/api/client/contract/[hash]/route.ts`):
    - recusa `signed`/`completed`/`cancelled` (403 "Contrato já assinado" / "Esta reserva foi cancelada"; também festa `cancelled`);
    - chave editável = variável extra do modelo (`party.contractTemplate.variables`, sem `isDefaultVariable`) **e** (valor atual vazio **ou** chave em `clientFilledKeys`); demais chaves são ignoradas;
    - grava os valores aceitos e acrescenta as chaves preenchidas a `clientFilledKeys` (sem duplicar);
    - responde o contrato atualizado;
    - mantém 400 (zod), 404 `Not found` e 403 "Link indisponível".
  - **Gap → desejado (frontend):** `src/app/c/[hash]/ClientPortal.tsx`:
    - `editableVars` = variáveis extras com valor vazio ou em `clientFilledKeys`; o passo 1 lista essas, com inputs **pré-preenchidos** com os valores salvos (estado local inicializado a partir do contrato, mantido ao ir e voltar);
    - o passo 1 só é pulado se `editableVars` estiver vazio; nesse caso o fluxo tem 2 passos e o "Passo X de N" se ajusta;
    - o passo 2 tem **"Voltar"** sempre que `editableVars.length > 0`, e o passo 3 tem "Voltar" para o 2 (já existe);
    - o salvar do passo 1 checa `r.ok` (erro mostra a mensagem da API ou "Erro ao salvar seus dados") e invalida `['client','contract',hash]`;
    - substituir o `useEffect` que força o passo 2 por uma derivação (passo inicial calculado quando o contrato carrega), seguindo a skill `react`;
    - vale em `draft`/`pending`/`in_review` (P8).
  - **Migration:** não (usa `clientFilledKeys` da Fase 1).
  - **Contrato:** **sim**. Atualizar `contract.md` com as regras novas do `PUT /api/client/contract/[hash]` antes do `frontend`.
  - **Critério de pronto:**
    - preencher o passo 1 → revisar → "Voltar" → valores aparecem e podem ser alterados → "Continuar" mostra o preview atualizado;
    - um recarregamento da página mantém a edição possível;
    - variável preenchida pelo admin não aparece no passo 1, e um `PUT` com ela é ignorado.
  - **Como verificar:** `npx tsc --noEmit`; eslint; `npm run dev` → `/c/<token>` com um contrato `draft` cujo modelo tenha 2 variáveis extras, uma preenchida pelo admin na aba Contrato; `curl -X PUT /api/client/contract/<token>` tentando sobrescrever a variável do admin.
  - **Ação do usuário:** nenhuma.

  Arquivos alterados:
