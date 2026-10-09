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

- **`PassportType`**: `name`, `durationMinutes`, quatro preços (`weekdayChildPrice`, `weekendChildPrice`, `weekdayCompanionPrice`, `weekendCompanionPrice`), `active` (padrão `true`), `sort`. Os valores vêm do banco (cadastrados pelo admin), não do código.
- **`TicketOrder`**: `shortCode` único, `status`, dados do responsável (`guardianName`, `guardianEmail`, `guardianPhone`, `guardianWhatsapp`), `totalAmount`, `stripeCheckoutSessionId` (único), `stripePaymentIntentId`, `paidAt`, `contractedDurationMinutes`, `checkedInAt/ById`, `checkedOutAt/ById`, `overtimeMinutes`.
- **`TicketChild`**: `name`, `birthDate`, `passportTypeId`, `isPNE`, `unitPrice`, `hasCompanion` (nulo/true/false), `unaccompaniedTermsAcceptedAt`.
- **`TicketCompanion`**: `name`, `phone`, `isFree`, `linkedChildId` (único, vincula o acompanhante gratuito a uma criança), `passportTypeId`, `unitPrice` (padrão 0).
- **Status do pedido** (`TicketOrderStatus`): `pending_payment`, `paid`, `payment_failed`, `cancelled`, `checked_in`, `checked_out`. Rótulos no admin: "Aguardando pagamento", "Pago — aguardando entrada", "Pagamento falhou", "Cancelada", "Em uso no parque", "Finalizada".
- Não existe fluxo no código que leve um pedido a `cancelled` (o status existe e é tratado nas telas, mas nada o grava).

### 2.2 Código curto e QR Code

- `shortCode` tem 6 caracteres do alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem 0/O/1/I/L), gerado com unicidade verificada no banco (até 10 tentativas; depois lança erro).
- Buscas por código normalizam com `trim` + maiúsculas.
- O QR Code codifica apenas o `shortCode` em texto puro (PNG de 320 px, correção de erro M). O leitor operacional trata o valor lido igual à digitação manual.

### 2.3 Regras de preço (calculadas só no servidor, `priceOrder`)

- Aceita `visitDayType` `weekday` ou `weekend` (na tela: "Dia de semana" e "Fim de semana / feriado"); o preço de criança e de acompanhante muda conforme o dia.
- **Criança:** preço do passaporte escolhido. Desconto de **50%** se tiver menos de 12 meses ou se `isPNE`. Os descontos não se acumulam (continua 50%).
- **Acompanhante gratuito:** só para criança com menos de 60 meses (4 anos). Para essas crianças a tela exige decidir "Com acompanhante" ou "Sem acompanhante":
  - **Com acompanhante** (`hasCompanion = true`): exige os dados de 1 acompanhante vinculado (nome obrigatório, telefone opcional), `isFree = true`, preço 0. Deve ter mais de 18 anos, comprovado na entrada.
  - **Sem acompanhante** (`hasCompanion = false`): exige aceite do Termo de Responsabilidade (`unaccompaniedTermsAccepted`); o aceite é gravado em `unaccompaniedTermsAcceptedAt`. Na entrada, a criança é sinalizada com os contatos do responsável.
  - Enviar `hasCompanion` para criança com 60 meses ou mais é erro.
- **Acompanhante adicional pago:** sem vínculo com criança; exige nome e `passportTypeId`; preço de acompanhante do passaporte escolhido conforme o dia. É apenas entrada no parque, sem direito aos brinquedos (texto da tela).
- Só passaportes `active` são aceitos; passaporte inexistente/inativo é erro.
- **Total** = soma dos preços de crianças e acompanhantes.
- **Duração contratada** do pedido = a maior `durationMinutes` entre os passaportes das **crianças** (os dos acompanhantes não contam).
- Erros de regra (`TicketPricingError`) voltam como HTTP 400 com mensagem em português.

### 2.4 API pública

- `GET /api/tickets/passport-types`: lista os passaportes ativos (ordem `sort`, depois `durationMinutes`), preços como string com 2 casas.
- `POST /api/tickets/quote`: valida com `TicketQuoteRequestSchema` e devolve crianças (com `ageMonths`, `unitPrice`), acompanhantes e `total`. 400 em validação ou regra.
- `POST /api/tickets/checkout`: valida com `TicketOrderCreateSchema` (exige ao menos 1 criança; `guardianName`, `guardianEmail` válido, `guardianPhone`, `guardianWhatsapp` obrigatórios), recalcula o preço e:
  1. se o Stripe não estiver configurado, responde 503 "Pagamento indisponível no momento. Tente novamente mais tarde.";
  2. cria, em transação, `TicketOrder` (`pending_payment`), crianças e acompanhantes;
  3. cria a sessão de Checkout do Stripe (`mode: payment`, moeda BRL, métodos `card` e `pix`, PIX expira em 3600 s, `customer_email` = e-mail do responsável, `metadata.orderId`), com uma linha por criança ("Passaporte - {nome}") e por acompanhante pago ("Acompanhante - {nome}"); itens de valor 0 ficam de fora;
  4. grava `stripeCheckoutSessionId` e devolve `{ checkoutUrl, shortCode }`;
  5. falha ao criar a sessão: 500 "Não foi possível iniciar o pagamento. Tente novamente mais tarde." (o pedido `pending_payment` já criado permanece no banco).
  - `success_url`: `{NEXT_PUBLIC_APP_URL}/compra-antecipada/confirmacao/{shortCode}?session_id=...`; `cancel_url`: `{NEXT_PUBLIC_APP_URL}/compra-antecipada`.
- `GET /api/tickets/confirmation/[shortCode]`: público, identifica o pedido só pelo código.
  - 404 "Compra não encontrada" se não existir.
  - Se `pending_payment`, consulta a sessão no Stripe e, se `payment_status = paid`, finaliza o pagamento antes de responder.
  - `pending_payment` e `payment_failed` devolvem só `{ status }`.
  - Demais status devolvem dados do responsável, total, duração contratada, `qrCodeDataUrl`, crianças e acompanhantes adicionais (os gratuitos aparecem junto da criança).

### 2.5 Pagamento (Stripe)

- `POST /api/webhooks/stripe`: exige header `stripe-signature` e valida a assinatura (400 se ausente ou inválida; 400 se o Stripe não estiver configurado). Responde sempre `{ received: true }` após processar; erros no processamento só vão para o log.
  - `checkout.session.completed` com `payment_status = paid` e `checkout.session.async_payment_succeeded`: chamam `finalizeOrderPayment`.
  - `checkout.session.async_payment_failed` e `checkout.session.expired`: marcam o pedido como `payment_failed`, só se estiver em `pending_payment`.
- `finalizeOrderPayment` é o ponto único e idempotente de confirmação: só age em `pending_payment` ou `payment_failed`; faz `updateMany` condicionado ao status (atômico), gravando `status = paid`, `paidAt`, `stripePaymentIntentId` e `contractedDurationMinutes`; só quem efetiva a transição dispara o e-mail.
- Um pedido `payment_failed` pode virar `paid` se o pagamento for confirmado depois.
- Não há reembolso, cancelamento de pedido nem expiração de pedidos pendentes no código.

### 2.6 E-mail de confirmação (Resend)

- Enviado depois de confirmado o pagamento, para `guardianEmail`, assunto `Sua compra Divercity Park — código {shortCode}`.
- Conteúdo: QR Code (anexo inline `qrcode-{shortCode}.png`), código curto, lista de crianças (passaporte, PNE, acompanhante gratuito ou aviso de "sem acompanhante" com contatos), acompanhantes adicionais, total pago, duração contratada contada a partir do check-in, aviso de documento com foto da criança e link para o comprovante online.
- Se `RESEND_API_KEY` ou `RESEND_FROM_EMAIL` faltarem, apenas registra erro no log e não envia (o pedido fica `paid`).
- O código não confere o retorno de `resend.emails.send`: uma falha de envio não é tratada nem registrada, e como o status já é `paid`, uma nova chamada não reenvia o e-mail. Não há reenvio manual.

### 2.7 Tela pública de compra (`/compra-antecipada`)

- Página com NavBar/Footer do CMS; título, subtítulo, `features` e `disclaimer` vêm do ContentType `AdvancePurchaseSection` do CMS, com fallback de título "Compre antecipadamente" e subtítulo "Evite filas e garanta sua diversão!". Selo fixo "Ambiente 100% seguro".
- Checkout em 3 etapas: **Crianças** → **Acompanhantes e dados** → **Revisão e pagamento**.
  1. **Crianças:** escolher o dia da visita (padrão "Dia de semana"); para cada criança: nome, data de nascimento (exibe a idade), tipo de passaporte, checkbox PNE (rotulado -50%) e, se tiver menos de 60 meses, a escolha "Com acompanhante"/"Sem acompanhante" (com campos do acompanhante ou aceite do Termo). Dá para adicionar/remover crianças (mínimo 1). Ao avançar, valida e bloqueia se houver criança elegível sem decisão ou sem termo aceito.
  2. **Acompanhantes e dados:** acompanhantes pagos opcionais (nome, telefone, duração do ingresso) e dados do responsável (nome, e-mail, telefone, WhatsApp).
  3. **Revisão:** avisos (documento com foto; acompanhante gratuito deve provar mais de 18 anos; criança sem acompanhante), resumo do valor, `disclaimer` do CMS e botão "Pagar {total}", que redireciona ao Stripe. Texto: "Pagamento seguro via Stripe — cartão de crédito ou PIX."
- O valor é calculado via `POST /api/tickets/quote` com debounce de 500 ms; o botão de pagar só habilita com o orçamento pronto. Há resumo lateral (desktop) ou embutido na etapa 3 (mobile).
- Estados: carregando tipos de passaporte (spinner), erro ao carregar ("Não foi possível carregar os tipos de passaporte. Recarregue a página."), erro de etapa e erro de checkout exibidos em caixa vermelha.
- A busca de dados usa React Query (`useQuery` para passaportes, `useMutation` para quote e checkout).
- A seção `CompraAntecipada` da home usa o CTA do CMS, com fallback `href` `compra-antecipada`.

### 2.8 Tela de confirmação (`/compra-antecipada/confirmacao/[shortCode]`)

- `noindex`. Faz polling de 2 s enquanto o status for `pending_payment`.
- Estados: carregando; erro/compra não encontrada (botão "Tentar novamente"); "Processando pagamento..." (após 60 s mostra texto de demora e que o e-mail será enviado); `payment_failed` ("Pagamento não foi concluído", link para voltar à compra); pago/em uso/finalizado ("Pagamento confirmado!").
- Pago: QR Code, código copiável, "Salvar QR Code" (download PNG `ingresso-{shortCode}.png`), aviso de documento com foto, resumo (duração contratada, total, crianças com idade/PNE/acompanhante, acompanhantes) e mensagem de que o mesmo código é usado na saída.

### 2.9 Operação (`operator` e `admin`)

- Menu `/admin/operacao`: "Visão geral", "Validar ticket", "Ingressos".
- **Visão geral:** contadores "No parque agora" (`checked_in`), "Pagos aguardando entrada" (`paid`), "Check-ins hoje" e "Check-outs hoje" (desde 00:00 do dia no servidor).
- **Validar ticket** (`/admin/operacao/validar`): campo de código curto (maiúsculas, até 12 caracteres) e leitor de QR Code por câmera; ambos levam a `/admin/operacao/validar/[shortCode]`.
- **Tela do pedido** (`/validar/[shortCode]`): carrega `GET /api/tickets/operate/[shortCode]` (404 "Compra não encontrada. Confira o código."). Mostra status, dados do responsável, valor pago, tempo contratado, conferência de cada criança (data de nascimento, idade, passaporte, PNE, acompanhante gratuito com nome/telefone e lembrete de conferir +18 anos, ou alerta vermelho "SEM acompanhante" com data do aceite do termo e contatos do responsável) e acompanhantes adicionais.
  - `pending_payment`, `payment_failed` e `cancelled` mostram bloqueio ("Esta compra ainda não foi paga.", "O pagamento desta compra falhou.", "Esta compra foi cancelada.").
  - `paid`: botão de check-in com confirmação (`window.confirm`).
  - `checked_in`: cronômetro em tempo real (atualização por segundo; refetch a cada 30 s), entrada, tempo contratado, término previsto, tempo restante ou excedente; botão de check-out com tela de confirmação exibindo tempo utilizado e, se houver, excedente ("cobrar à parte no caixa", exato e em minutos iniciados).
  - `checked_out`: resumo (tempo contratado, total utilizado, excedente) e mensagem se há ou não algo a cobrar.
- **Check-in** (`POST .../check-in`): só a partir de `paid` (`updateMany` atômico), grava `checkedInAt` e `checkedInById`; senão 409 com mensagem pelo status (não paga, cancelada, "Check-in já realizado para esta compra.", "Esta compra já foi finalizada (check-out já realizado).").
- **Check-out** (`POST .../check-out`): só a partir de `checked_in`; calcula `elapsedMinutes` (arredondado) e `overtimeMinutes = max(0, elapsed - contratado)`, grava `checkedOutAt`, `checkedOutById` e `overtimeMinutes` (`updateMany` atômico); senão 409 com mensagem pelo status. O código não calcula nem cobra valor do excedente.
- **Ingressos** (`/admin/operacao/ingressos`, `GET /api/tickets/operate`): lista paginada (padrão 15 por página, máximo 100), ordenável por `createdAt`, `guardianName`, `status`, `totalAmount` (padrão `createdAt` desc), filtro por status e busca por código, nome, e-mail ou telefone do responsável; mostra tempo em uso/previsão de saída e atalho "Validar".
- Todas as APIs de operação exigem `admin` ou `operator` (401 sem login, 403 sem permissão).

### 2.10 Admin de passaportes (`admin`)

- `/admin/passport-types` (lista), `/new` e `/[id]`: formulário com nome, duração (minutos), preços de criança e acompanhante (semana e fim de semana/feriado), checkbox ativo; lista mostra "Inativo".
- API `/api/admin/passport-types` (GET paginado, padrão 50 por página, máximo 100, busca por nome; POST) e `/[id]` (GET, PUT, DELETE), só `admin`. Validação: nome obrigatório, duração inteira > 0, preços ≥ 0.
- DELETE é bloqueado (403) se o passaporte já foi usado em alguma criança de pedido ("Desative-o em vez disso."). A verificação considera só `TicketChild`, não `TicketCompanion`.

## Mudanças pendentes

### QR Code por criança

- A compra pode ter N crianças, cada uma com suas regras já implementadas (preço, PNE, acompanhante gratuito, etc.).
- Hoje a compra tem 1 QR Code. Passa a haver **1 QR Code por criança**.
- O QR Code **não identifica a compra**: identifica a **entrada da criança no parque**.
- Na operação, apesar de a compra ter sido feita junta, a liberação da entrada no parque deve poder ser feita **criança a criança**, cada uma com o seu QR Code.
- O **código curto também passa a ser por criança**.
- **Acompanhante:** o acompanhante e a criança compartilham o mesmo QR Code. Na operação, ao liberar a entrada de uma criança que tenha acompanhante, a tela deve informar que esse ticket tem 1 acompanhante incluso.
- **Check-out e tempo de permanência:** por criança (contagem do tempo, tempo contratado e excedente).
- **Acompanhante do grupo:** a compra precisa ter no mínimo 1 criança; sem criança não pode haver acompanhante. Pode haver **1 acompanhante** acompanhando o grupo todo, **sem vínculo com uma criança específica**. Esse acompanhante tem **QR Code próprio** (e, por consistência com as crianças, código curto próprio: confirmar).
- **E-mail e tela de confirmação:** mostram o código curto e o QR Code de cada criança (decisão posterior do usuário, substitui "1 só QR Code da compra").
- **Dados existentes:** pode limpar todos os dados e recriar a estrutura se necessário; o banco está em desenvolvimento e os dados são de teste.
- **Visão geral e listagem da operação:** contam por criança, mas agrupadas por compra, para identificar os grupos com facilidade.

## 3. Anexos e referências

- Spec legado (anterior ao fluxo SDD, não reconciliado com este): `docs/ticket-in-advance/specs.md`. Comentários do código citam "spec seção N" dele.

## 4. Pontos em aberto

- Pedidos `pending_payment` nunca expiram e `cancelled` nunca é gravado: não há fluxo de cancelamento, reembolso ou limpeza de pedidos abandonados.
- Se o envio do e-mail falhar (Resend), não há reenvio nem retentativa; o comprovante continua disponível na página de confirmação.
- Valores de excedente não são calculados pelo sistema (cobrança é feita à parte no caixa).
- Conteúdo não verificável pelo código: preços, durações e passaportes cadastrados no banco; textos do `AdvancePurchaseSection` no CMS; configuração do Stripe (webhook, chaves) e do Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
- (QR Code por criança) O acompanhante do grupo também tem código curto próprio, além do QR Code? O limite de 1 vale por compra para o acompanhante sem vínculo; o acompanhante pago vinculado a criança continua como hoje? Ele tem check-in/check-out e tempo próprios como as crianças? O preço continua o de acompanhante do passaporte escolhido (qual passaporte, já que não há criança)?
