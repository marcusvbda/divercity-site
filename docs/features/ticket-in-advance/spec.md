# Compra antecipada de ingressos

> Estado atual, descrito a partir do código. Este documento descreve o que o sistema faz hoje; o que o usuário quiser mudar entra em `## Mudanças pendentes`.

## 1. O que é

Fluxo de compra antecipada de passaportes do parque, com pagamento online (Stripe), entrega de QR Code e código curto por e-mail/tela, e operação de entrada (check-in) e saída (check-out) pelos operadores usando esse código.

Atores:

- **Público:** compra em `/compra-antecipada` e consulta o comprovante em `/compra-antecipada/confirmacao/[shortCode]`. Sem login.
- **`operator` e `admin`:** operam em `/admin/operacao` (validar, check-in, check-out, listagem).
- **`admin`:** além disso, gerencia os tipos de passaporte em `/admin/passport-types`.

O `proxy.ts` restringe `operator` a `/admin/login` e `/admin/operacao`; qualquer outra rota sob `/admin` é só `admin`.

## 2. Requisitos (estado atual)

### 2.1 Dados

- **`PassportType`**: `key` (opcional e único; preenchido nos passaportes fixos do sistema: `passport_30min`, `passport_1h`, `passport_2h`, `passport_3h`), `name`, `durationMinutes`, quatro preços (`weekdayChildPrice`, `weekendChildPrice`, `weekdayCompanionPrice`, `weekendCompanionPrice`), `active` (padrão `true`), `sort`. Os valores vêm do banco (cadastrados pelo admin), não do código.
- **`TicketOrder`**: `shortCode` único, `status`, dados do responsável (`guardianName`, `guardianEmail`, `guardianPhone`, `guardianWhatsapp`), `totalAmount`, `stripeCheckoutSessionId` (único), `stripePaymentIntentId`, `paidAt`. O pedido guarda só a compra e o pagamento; entrada, saída e tempo vivem em cada ticket (`TicketPass`).
- **`TicketChild`**: `name`, `birthDate`, `passportTypeId`, `isPNE`, `unitPrice`, `hasCompanion` (nulo/true/false), `unaccompaniedTermsAcceptedAt`.
- **`TicketCompanion`**: `name`, `phone`, `isFree`, `linkedChildId` (único, vincula o acompanhante gratuito a uma criança), `passportTypeId`, `unitPrice` (padrão 0).
- **`TicketPass`** (um por ticket, tabela `ticket_passes`): `orderId` (cascade), `shortCode` único, `kind` (`child` | `group_companion`), `childId` e `companionId` (únicos, opcionais), `status` (`TicketPassStatus`: `not_used`, `checked_in`, `checked_out`; padrão `not_used`), `contractedDurationMinutes`, `checkedInAt/ById`, `checkedOutAt/ById`, `overtimeMinutes`. Cada criança tem um ticket; o acompanhante do grupo (sem vínculo com criança) também. O acompanhante gratuito vinculado a uma criança não tem ticket: entra pelo ticket da criança.
- **Status do pedido** (`TicketOrderStatus`): `pending_payment`, `paid`, `payment_failed`, `cancelled`. Rótulos no admin: "Aguardando pagamento", "Pago", "Pagamento falhou", "Cancelada". Status de ticket: "Aguardando entrada", "Em uso no parque", "Finalizado".
- Não existe fluxo no código que leve um pedido a `cancelled` (o status existe e é tratado nas telas, mas nada o grava).

### 2.2 Código curto e QR Code

- Há dois tipos de código: o **código do ticket** (um por criança e um por acompanhante do grupo; é o que o QR Code codifica e o que libera a entrada) e o **código da compra** (`TicketOrder.shortCode`, usado só no link da confirmação e na busca de Ingressos; em "Validar ticket" ele não libera entrada).
- `shortCode` tem 6 caracteres do alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem 0/O/1/I/L), gerado com unicidade verificada no banco nas duas tabelas (`ticket_orders` e `ticket_passes`, para um código nunca valer pelas duas coisas, e também entre os códigos do mesmo pedido), até 10 tentativas; depois lança erro.
- Buscas por código normalizam com `trim` + maiúsculas.
- O QR Code codifica apenas o código do ticket em texto puro (PNG de 320 px, correção de erro M). O leitor operacional trata o valor lido igual à digitação manual.

### 2.3 Regras de elegibilidade (a precificação está em [`pricing`](../pricing/spec.md))

Os preços, descontos e o total são calculados pelo `priceOrder` e descritos em [`../pricing/spec.md`](../pricing/spec.md) (seções 2.1 a 2.3). Aqui ficam as regras de compra:

- Aceita `visitDayType` `weekday` ou `weekend` (na tela: "Segunda a quinta (exceto feriados)" e "Sexta a domingo e feriados"); define qual preço é usado.
- **Acompanhante gratuito:** só para criança com menos de 60 meses (4 anos). Para essas crianças a tela exige decidir "Com acompanhante" ou "Sem acompanhante":
  - **Com acompanhante** (`hasCompanion = true`): exige os dados de 1 acompanhante vinculado (nome obrigatório, telefone opcional), `isFree = true`, preço 0. Deve ter mais de 18 anos, comprovado na entrada.
  - **Sem acompanhante** (`hasCompanion = false`): exige aceite do Termo de Responsabilidade (`unaccompaniedTermsAccepted`); o aceite é gravado em `unaccompaniedTermsAcceptedAt`. Na entrada, a criança é sinalizada com os contatos do responsável.
  - Enviar `hasCompanion` para criança com 60 meses ou mais é erro.
- **Acompanhante do grupo (pago):** a compra precisa ter no mínimo 1 criança. Pode haver no máximo **1** acompanhante sem vínculo com criança, acompanhando o grupo todo (mais de 1 é erro 400 "Só é permitido 1 acompanhante do grupo por compra", validado também no schema do quote); exige nome e `passportTypeId`. Tem ticket completo próprio (ver 2.1). É apenas entrada no parque, sem direito aos brinquedos (texto da tela).
- Só passaportes `active` são aceitos; passaporte inexistente/inativo é erro.
- **Duração contratada** de cada ticket = `durationMinutes` do **próprio passaporte** (da criança, ou do passaporte escolhido para o acompanhante do grupo); `TicketPass.contractedDurationMinutes` é gravado no checkout.
- Erros de regra (`TicketPricingError`) voltam como HTTP 400 com mensagem em português.

### 2.4 API pública

- Todas as rotas desta seção e a página `/compra-antecipada` dependem da feature **Compra antecipada** (ver 2.11).
- `GET /api/tickets/passport-types`: lista os passaportes ativos (ordem `sort`, depois `durationMinutes`), preços como string com 2 casas. Lê de `getActivePassportTypes()` (`src/lib/passport-types.ts`), com cache de tag `passport-types` (`cacheLife('max')`), invalidada pelas APIs de admin de passaportes.
- `POST /api/tickets/quote`: se a feature estiver desativada, 403 "Compra antecipada indisponível no momento."; valida com `TicketQuoteRequestSchema` e devolve crianças (com `ageMonths`, `unitPrice`), acompanhantes e `total` (cálculo em [`pricing`](../pricing/spec.md)). 400 em validação ou regra.
- `POST /api/tickets/checkout`: se a feature estiver desativada, 403 "Compra antecipada indisponível no momento."; valida com `TicketOrderCreateSchema` (exige ao menos 1 criança; `guardianName`, `guardianEmail` válido, `guardianPhone`, `guardianWhatsapp` obrigatórios), recalcula o preço e:
  1. se o Stripe não estiver configurado, responde 503 "Pagamento indisponível no momento. Tente novamente mais tarde.";
  2. cria, em transação, `TicketOrder` (`pending_payment`), crianças, acompanhantes e um `TicketPass` por criança e pelo acompanhante do grupo (cada um com código próprio e a duração do seu passaporte);
  3. cria a sessão de Checkout do Stripe (`mode: payment`, moeda BRL, métodos `card` e `pix`, PIX expira em 3600 s, `customer_email` = e-mail do responsável, `metadata.orderId`), com uma linha por criança ("Passaporte - {nome}") e por acompanhante pago ("Acompanhante - {nome}"); itens de valor 0 ficam de fora;
  4. grava `stripeCheckoutSessionId` e devolve `{ checkoutUrl, shortCode }`;
  5. falha ao criar a sessão: 500 "Não foi possível iniciar o pagamento. Tente novamente mais tarde." (o pedido `pending_payment` já criado permanece no banco).
  - `success_url`: `{NEXT_PUBLIC_APP_URL}/compra-antecipada/confirmacao/{shortCode}?session_id=...`; `cancel_url`: `{NEXT_PUBLIC_APP_URL}/compra-antecipada`.
- `GET /api/tickets/confirmation/[shortCode]`: público, identifica o pedido só pelo código.
  - 404 "Compra não encontrada" se não existir.
  - Se `pending_payment`, consulta a sessão no Stripe e, se `payment_status = paid`, finaliza o pagamento antes de responder.
  - `pending_payment` e `payment_failed` devolvem só `{ status }`.
  - Demais status devolvem dados do responsável, total, crianças e acompanhantes (resumo de pagamento) e `tickets[]`: por ticket, `shortCode`, `kind`, titular, passaporte, `contractedDurationMinutes`, `status`, `qrCodeDataUrl` (do código do ticket), `isPNE`, `unitPrice` e `companionIncluded` (acompanhante gratuito vinculado). Crianças vêm antes do acompanhante do grupo. Contrato em [`contract.md`](contract.md).

### 2.5 Pagamento (Stripe)

- `POST /api/webhooks/stripe`: exige header `stripe-signature` e valida a assinatura (400 se ausente ou inválida; 400 se o Stripe não estiver configurado). Responde sempre `{ received: true }` após processar; erros no processamento só vão para o log.
  - `checkout.session.completed` com `payment_status = paid` e `checkout.session.async_payment_succeeded`: chamam `finalizeOrderPayment`.
  - `checkout.session.async_payment_failed` e `checkout.session.expired`: marcam o pedido como `payment_failed`, só se estiver em `pending_payment`.
- `finalizeOrderPayment` é o ponto único e idempotente de confirmação: só age em `pending_payment` ou `payment_failed`; faz `updateMany` condicionado ao status (atômico), gravando `status = paid`, `paidAt` e `stripePaymentIntentId`; só quem efetiva a transição dispara o e-mail.
- Um pedido `payment_failed` pode virar `paid` se o pagamento for confirmado depois.
- Não há reembolso, cancelamento de pedido nem expiração de pedidos pendentes no código.

### 2.6 E-mail de confirmação (Resend)

- Enviado depois de confirmado o pagamento, para `guardianEmail`, assunto `Sua compra Divercity Park — código {shortCode}`.
- Conteúdo: um bloco por ticket (titular, passaporte, duração contratada contada a partir do check-in, "1 acompanhante incluso: {nome}" quando houver, QR Code inline com `contentId` `ticket-qrcode-{shortCode do ticket}` e código curto), lista de crianças (PNE, acompanhante gratuito ou aviso de "sem acompanhante" com contatos), acompanhantes adicionais, total pago, aviso de documento com foto da criança e link para o comprovante online (usa o código da compra).
- Se `RESEND_API_KEY` ou `RESEND_FROM_EMAIL` faltarem, apenas registra erro no log e não envia (o pedido fica `paid`).
- O código não confere o retorno de `resend.emails.send`: uma falha de envio não é tratada nem registrada, e como o status já é `paid`, uma nova chamada não reenvia o e-mail. Não há reenvio manual.

### 2.7 Tela pública de compra (`/compra-antecipada`)

- Página com NavBar/Footer do CMS; título, subtítulo, `features` e `disclaimer` vêm do ContentType `AdvancePurchaseSection` do CMS, com fallback de título "Compre antecipadamente" e subtítulo "Evite filas e garanta sua diversão!". Selo fixo "Ambiente 100% seguro".
- Checkout em 3 etapas: **Crianças** → **Acompanhantes e dados** → **Revisão e pagamento**.
  1. **Crianças:** escolher o dia da visita (padrão "Segunda a quinta (exceto feriados)"); para cada criança: nome, data de nascimento (exibe a idade), tipo de passaporte, checkbox PNE (rotulado -50%) e, se tiver menos de 60 meses, a escolha "Com acompanhante"/"Sem acompanhante" (com campos do acompanhante ou aceite do Termo). Dá para adicionar/remover crianças (mínimo 1). Ao avançar, valida e bloqueia se houver criança elegível sem decisão ou sem termo aceito.
  2. **Acompanhantes e dados:** 1 acompanhante do grupo opcional (nome, telefone, duração do ingresso; o botão de adicionar some depois de 1 e `addExtraCompanion` ignora a chamada se já existir) e dados do responsável (nome, e-mail, telefone, WhatsApp).
  3. **Revisão:** avisos (documento com foto; acompanhante gratuito deve provar mais de 18 anos; criança sem acompanhante), resumo do valor, `disclaimer` do CMS e botão "Pagar {total}", que redireciona ao Stripe. Texto: "Pagamento seguro via Stripe — cartão de crédito ou PIX."
- O valor é calculado via `POST /api/tickets/quote` com debounce de 500 ms; o botão de pagar só habilita com o orçamento pronto. Há resumo lateral (desktop) ou embutido na etapa 3 (mobile).
- Estados: carregando tipos de passaporte (spinner), erro ao carregar ("Não foi possível carregar os tipos de passaporte. Recarregue a página."), erro de etapa e erro de checkout exibidos em caixa vermelha.
- A busca de dados usa React Query (`useQuery` para passaportes, `useMutation` para quote e checkout).
- A seção `CompraAntecipada` da home usa o CTA do CMS, com fallback `href` `compra-antecipada`, e só é renderizada com a feature ativa (ver 2.11).

### 2.8 Tela de confirmação (`/compra-antecipada/confirmacao/[shortCode]`)

- `noindex`. Faz polling de 2 s enquanto o status for `pending_payment`.
- Estados: carregando; erro/compra não encontrada (botão "Tentar novamente"); "Processando pagamento..." (após 60 s mostra texto de demora e que o e-mail será enviado); `payment_failed` ("Pagamento não foi concluído", link para voltar à compra); pago/em uso/finalizado ("Pagamento confirmado!").
- Pago: uma lista de cartões, um por ticket (empilhados no celular), cada um com titular, passaporte, duração, PNE, "1 acompanhante incluso: {nome}" quando houver, QR Code, código do ticket copiável e "Salvar QR Code" (download PNG `ingresso-{código do ticket}.png`); aviso de documento com foto, resumo da compra (total, crianças, acompanhantes, avisos de acompanhante gratuito e de termo) e mensagem de que o código de cada ticket é usado também na saída. Pedido `cancelled` não tem tela (página vazia).

### 2.9 Operação (`operator` e `admin`)

- Menu `/admin/operacao`: "Visão geral", "Validar ticket", "Ingressos".
- **Visão geral:** contadores por ticket: "No parque agora" (tickets `checked_in`), "Aguardando entrada" (tickets `not_used` de pedidos `paid`), "Check-ins hoje" e "Check-outs hoje" (por `checkedInAt`/`checkedOutAt`, desde 00:00 do dia no servidor).
- **Validar ticket** (`/admin/operacao/validar`): campo de código do ticket (maiúsculas, até 12 caracteres) e leitor de QR Code por câmera; ambos levam a `/admin/operacao/validar/[shortCode]`.
- **Tela do ticket** (`/validar/[shortCode]`): carrega `GET /api/tickets/operate/[shortCode]`, que busca só em tickets (o código da compra dá 404 "Ticket não encontrado. Confira o código."). Mostra código, titular (criança ou acompanhante do grupo), status, a compra e o responsável, valor do ticket, tempo contratado e a conferência: para criança, data de nascimento, idade, passaporte, PNE e acompanhante; destaque "Este ticket tem 1 acompanhante incluso: {nome}" com lembrete de conferir +18 anos (documento com foto) quando há acompanhante gratuito vinculado; alerta "SEM acompanhante" com data do aceite do termo e contatos do responsável quando for o caso. Um bloco "Outros tickets desta compra" lista código, titular e status de cada um, com link.
  - Pedido `pending_payment`, `payment_failed` ou `cancelled` mostra bloqueio e esconde o check-in.
  - Ticket `not_used` de pedido `paid`: botão de check-in com confirmação (`window.confirm`).
  - `checked_in`: cronômetro em tempo real (atualização por segundo; refetch a cada 30 s), entrada, tempo contratado do ticket, término previsto, tempo restante ou excedente; botão de check-out com tela de confirmação exibindo tempo utilizado e, se houver, excedente ("cobrar à parte no caixa", exato e em minutos iniciados).
  - `checked_out`: resumo (tempo contratado, total utilizado, excedente) e mensagem se há ou não algo a cobrar.
  - Check-in e check-out de um ticket não alteram os outros tickets da compra.
- **Check-in** (`POST .../check-in`): `updateMany` atômico em `TicketPass` só a partir de `not_used` e com o pedido `paid`, gravando `checkedInAt` e `checkedInById`; senão 409 com mensagem por motivo (compra não paga, falhou, cancelada, "Check-in já realizado para este ticket.", "Este ticket já foi finalizado (check-out já realizado).").
- **Check-out** (`POST .../check-out`): só a partir de `checked_in`; calcula `elapsedMinutes` (arredondado) e `overtimeMinutes = max(0, elapsed - contractedDurationMinutes do ticket)`, grava `checkedOutAt`, `checkedOutById` e `overtimeMinutes` (`updateMany` atômico); senão 409 com mensagem pelo status. O código não calcula nem cobra valor do excedente.
- **Ingressos** (`/admin/operacao/ingressos`, `GET /api/tickets/operate`): lista paginada **por compra** (padrão 15 por página, máximo 100, ordenada por `createdAt` desc na tela; a API aceita `sort` por `createdAt`, `guardianName`, `status`, `totalAmount`). Cada compra é um cartão (código da compra, responsável, telefone, pagamento, quantidade de tickets, data) com uma linha por ticket (titular, código, status, tempo em uso/previsão de saída, excedente e atalho "Validar"). Filtros por pagamento (`payment`) e por status de ticket (`ticketStatus`: compras com ao menos um ticket nesse status); busca por código da compra, código de qualquer ticket, nome, e-mail ou telefone do responsável.
- Todas as APIs de operação exigem `admin` ou `operator` (401 sem login, 403 sem permissão).

### 2.10 Admin de passaportes (`admin`)

- A lista fica na aba "Passaportes" de `/admin/services?tab=passaportes` (`PassportTypesTab`): colunas nome (com selo "Fixo" e "Inativo"), duração e os quatro preços (segunda a quinta; sexta a domingo e feriados). `/admin/passport-types` só redireciona para essa aba; `/admin/passport-types/new` e `/[id]` continuam sendo o formulário (nome, duração em minutos, quatro preços, checkbox ativo) e voltam para a aba depois de salvar.
- Passaporte **fixo** (com `key`): o formulário desabilita duração e "Ativo" ("Passaporte fixo do sistema: não pode ser desativado nem ter a duração alterada."), a lista esconde o botão de remover, e a API recusa: PUT com `active = false` (400 "Passaporte fixo não pode ser desativado."), PUT com duração diferente (400 "A duração de um passaporte fixo não pode ser alterada.") e DELETE (403 "Este passaporte é fixo do sistema e não pode ser removido, apenas editado.").
- API `/api/admin/passport-types` (GET paginado, padrão 50 por página, máximo 100, busca por nome; POST) e `/[id]` (GET, PUT, DELETE), só `admin`; PUT e DELETE respondem 404 se o passaporte não existir. Validação: nome obrigatório, duração inteira > 0, preços ≥ 0. POST, PUT e DELETE invalidam a tag `passport-types`.
- DELETE é bloqueado (403) se o passaporte já foi usado em alguma criança de pedido ("Desative-o em vez disso."). A verificação considera só `TicketChild`, não `TicketCompanion`.

### 2.11 Controle pela feature "Compra antecipada"

- A compra antecipada é ligada e desligada pelo admin em `/admin/settings/features` (feature `advance_purchase`, tabela `features`; ver [`site-settings`](../site-settings/spec.md)). Sem linha no banco, a feature é ativa. A variável de ambiente `ADVANCE_PURCHASE_ENABLED` não existe mais.
- Com a feature desativada:
  - a seção `CompraAntecipada` some da home;
  - `/compra-antecipada` responde 404 (`notFound()`);
  - `POST /api/tickets/quote` e `POST /api/tickets/checkout` respondem 403 "Compra antecipada indisponível no momento.";
  - continuam funcionando: a confirmação (`/compra-antecipada/confirmacao/[shortCode]`), `GET /api/tickets/confirmation/[shortCode]`, `GET /api/tickets/passport-types`, o webhook do Stripe e a operação em `/admin/operacao`.

## 3. Anexos e referências

- Precificação (preços, descontos, total, quote): [`../pricing/spec.md`](../pricing/spec.md).
- Spec legado (anterior ao fluxo SDD, não reconciliado com este): `docs/ticket-in-advance/specs.md`. Comentários do código citam "spec seção N" dele.

## 4. Pontos em aberto

- Pedidos `pending_payment` nunca expiram e `cancelled` nunca é gravado: não há fluxo de cancelamento, reembolso ou limpeza de pedidos abandonados.
- Se o envio do e-mail falhar (Resend), não há reenvio nem retentativa; o comprovante continua disponível na página de confirmação.
- Valores de excedente não são calculados pelo sistema (cobrança é feita à parte no caixa).
- Com a feature desativada, o link "voltar à compra" da confirmação com pagamento falhou (`ConfirmationView`, `href` `/compra-antecipada`) leva a 404. Links do CMS (Navbar, Hero) para `#compra-antecipada` ou `/compra-antecipada` não são escondidos automaticamente.
- Conteúdo não verificável pelo código: preços, durações e passaportes cadastrados no banco; textos do `AdvancePurchaseSection` no CMS; configuração do Stripe (webhook, chaves) e do Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
