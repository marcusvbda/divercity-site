# Precificação

> Estado atual, descrito a partir do código. Este documento descreve o que o sistema faz hoje; o que o usuário quiser mudar entra em `## Mudanças pendentes`.

## 1. O que é

Tudo o que define, calcula e exibe preço no sistema, em três frentes:

1. **Ingressos antecipados** (compra online com Stripe): preços por `PassportType`, descontos e acompanhante gratuito/pago, calculados só no servidor.
2. **Orçamento de festas** (reserva pública do salão): preços por `Service`, calculados só no servidor.
3. **Vitrine de preços do site público** (seção "Preços" da home): conteúdo do CMS, **sem ligação com o banco de preços** das duas frentes acima.

Quem cadastra os preços: o `admin`, em `/admin/passport-types` (ingressos), `/admin/services` (festas) e no CMS (vitrine). Quem consome: o público (compra, orçamento, home) e a operação.

As regras de elegibilidade e fluxo da compra de ingressos (acompanhante gratuito, termo, limite de 1 acompanhante do grupo, checkout, Stripe, tickets) continuam em [`../ticket-in-advance/spec.md`](../ticket-in-advance/spec.md); a **precificação** dos ingressos é deste documento.

## 2. Requisitos (estado atual)

### 2.1 Ingressos: dados de preço

- **`PassportType`**: `name`, `durationMinutes`, `weekdayChildPrice`, `weekendChildPrice`, `weekdayCompanionPrice`, `weekendCompanionPrice` (`Decimal(10,2)`), `active` (padrão `true`), `sort`. Os valores vêm do banco, cadastrados pelo admin; não há preço no código.
- `TicketChild.unitPrice` e `TicketCompanion.unitPrice` (padrão 0) gravam o preço calculado no momento da compra; `TicketOrder.totalAmount` grava o total.
- Só passaportes `active` entram no cálculo; passaporte inexistente ou inativo é erro.

### 2.2 Ingressos: regras de cálculo (`priceOrder`, só no servidor)

Em `src/lib/ticket-pricing.ts`. O frontend nunca envia preço, idade nem desconto; o servidor recalcula tudo.

- **Dia da visita:** `visitDayType` = `weekday` ou `weekend`, **escolhido pelo comprador** na tela ("Dia de semana" / "Fim de semana / feriado"). O sistema não pede data da visita nem deriva o tipo de dia de uma data. Define qual dos preços é usado (semana ou fim de semana/feriado).
- **Criança:** preço de criança do passaporte escolhido para o dia. **Desconto de 50%** se tiver menos de 12 meses ou se `isPNE`; os descontos não se acumulam (continua 50%). A idade em meses é calculada no servidor a partir de `birthDate`, na data da compra.
- **Acompanhante gratuito vinculado a criança:** só para criança com menos de 60 meses e `hasCompanion = true`; preço `0`, sem passaporte.
- **Acompanhante do grupo (pago):** sem vínculo com criança; preço de acompanhante do passaporte escolhido para ele, para o dia. Máximo 1 por compra.
- **Total** = soma dos preços de crianças e acompanhantes. Valores trafegam como string com 2 casas (`toFixed(2)`).
- Violações de regra (`TicketPricingError`) voltam como HTTP 400 com mensagem em português.
- Não há cupom, taxa, parcelamento nem acréscimo; Stripe cobra o `total` calculado (itens de valor 0 ficam fora das linhas do Stripe).

### 2.3 Ingressos: API e telas

- `GET /api/tickets/passport-types` (público): passaportes ativos (ordem `sort`, depois `durationMinutes`) com os 4 preços como string.
- `POST /api/tickets/quote` (público): recebe `visitDayType`, crianças e acompanhantes; devolve, por criança, `ageMonths` e `unitPrice`, por acompanhante `isFree` e `unitPrice`, e `total`. 400 em validação ou regra.
- Checkout `/compra-antecipada`: o seletor de passaporte (`PassportTypeCard`) mostra nome, duração e o preço de criança ou de acompanhante conforme o dia escolhido; o resumo (`CartSummaryPanel`) mostra o preço de cada criança e acompanhante ("Gratuito" para o vinculado) e o total em BRL. O valor vem do quote (debounce de 500 ms); o botão "Pagar {total}" só habilita com o quote pronto. Detalhes de fluxo em `ticket-in-advance`.
- Admin de passaportes (`/admin/passport-types`, API `/api/admin/passport-types`, só `admin`): CRUD com nome, duração e os 4 preços (`>= 0`), ativo; DELETE bloqueado (403) se o passaporte já foi usado em criança de pedido. Detalhes em `admin-interface` (seção Passaportes).

### 2.4 Festas: dados e regras de cálculo

Em `src/lib/party-budget.ts`.

- **`Service`**: `key` (opcional, único), `name`, `weekdayPrice`, `weekendPrice`. O orçamento usa três serviços pela `key`: `party_salon` (salão), `party_passport_package` (pacote de passaportes) e `party_passport_single` (passaporte avulso). Sem a chave cadastrada, o cálculo falha com `Serviço "<key>" não cadastrado. Configure em /admin/services.` (HTTP 500).
- **Dia:** o preço de fim de semana vale para **sábado e domingo** na data da festa, no fuso `America/Sao_Paulo`; feriado **não** entra (diferente dos ingressos, onde o comprador escolhe).
- **Duração da festa:** 3 horas (`PARTY_DURATION_MS`), usada na checagem de disponibilidade e no rótulo "Salão (3 horas)".
- **Pacote de passaportes:** tamanho fixo de 10 (`PASSPORT_PACKAGE_SIZE`; o rótulo do orçamento é "1x pacote de 10 passaportes"); o preço do pacote é o do serviço `party_passport_package`.
- **Cálculo** (`computeQuote`), conforme `paymentOption`:
  - `salon_only` ("Opção A — Somente salão"): total = preço do salão; os campos de passaporte ficam `null`.
  - `salon_and_passports` ("Opção B — Salão + adiantamento de passaportes"): total = salão + 1 pacote + `passportSingleCount` × preço do avulso. `passportSingleCount` é inteiro `>= 0` ("Passaportes avulsos extras").
- Os valores são `number` em JS (não `Decimal`) no cálculo; ao gravar vão para colunas `Decimal(10,2)`.
- Sem desconto, cupom ou taxa.

### 2.5 Festas: API e telas

- `GET /api/party-budget/quote?date=&paymentOption=&passportSingleCount=` (público): valida os parâmetros (400 "Parâmetro ... é obrigatório/inválido"), checa disponibilidade do horário e devolve `available`, `salonPrice`, `passportPackagePrice`, `passportSinglePrice`, `passportSingleCount`, `total` e `breakdown` (linhas `{label, value}`: "Salão (3 horas)", "1x pacote de 10 passaportes", "{n}x passaporte avulso adicional"). Erro de cálculo: 500 com a mensagem.
- `POST /api/party-budget/reservations` (público): recalcula o orçamento no servidor (`computeQuote`), ignorando qualquer valor do cliente, e grava em `Party`: `paymentOption`, `salonPrice`, `passportPackagePrice`, `passportSinglePrice`, `passportSingleCount` e `totalPrice`. Os preços ficam congelados na reserva; mudar o `Service` depois não altera festas já criadas.
- `OrcamentoWizard`: consulta o quote (React Query) quando há data e mostra os preços do salão e, na Opção B, do pacote e dos avulsos, com total em BRL; durante o carregamento e em erro mostra estados próprios; horário indisponível mostra aviso.
- Admin de serviços ("Preços e Serviços", `/admin/services`, API `/api/admin/services`): CRUD com nome e os dois preços (`>= 0`); a `key` não é editável e só existe nos serviços do sistema (criados pelo seed); serviço com `key` não pode ser excluído (403). Detalhes em `admin-interface` (seção Preços e Serviços).
- Os dados de preço da festa (`salonPrice`, `totalPrice` etc.) não são editáveis no admin da festa.

### 2.6 Vitrine de preços do site público (CMS)

- Seção `Precos` (`#precos`) da home, lida do ContentType `PriceSection`: `Section` (badge, title, subtitle), `Content` (`prices[]` = grupos com title, subtitle, color; `disclaimers[]`, renderizados em Markdown) e `Tiers` (`weekdayTiers[]` e `weekendTiers[]`, cada item com `label`, `valor` e `acompanhante`).
- O primeiro grupo de `prices` usa `weekdayTiers` e o segundo `weekendTiers` (por posição). Cada tier mostra o rótulo (ex.: duração), `R${valor}` e "Acompanhante R${acompanhante}". Os valores são **texto livre** do CMS, exibidos como digitados.
- **Não há ligação** entre essa vitrine e `PassportType`/`Service`: alterar preço no admin de passaportes ou serviços não altera a home, e vice-versa. A manutenção é manual, nas duas pontas.
- A seção `Festas` da home não mostra preço; tem só um CTA "ctaPrices" (CMS) que leva à seção de preços.
- Edição pelo admin do CMS (campos de texto de uma linha). Leitura cacheada (`'use cache'`, tag `cms:PriceSection`).

### 2.7 Invariantes

- O preço cobrado e gravado é sempre o calculado no servidor; o cliente só envia escolhas (passaporte, dia, contagens).
- Preços dos ingressos vêm de `PassportType`; os da festa vêm de `Service` por `key`; a vitrine do site é independente de ambos.

## 3. Anexos e referências

- Compra de ingressos (fluxo, regras de elegibilidade, Stripe, tickets): [`../ticket-in-advance/spec.md`](../ticket-in-advance/spec.md).
- Telas admin de Preços e Serviços e Passaportes: [`../admin-interface/spec.md`](../admin-interface/spec.md) (seções 2.7 e 2.8).

## 4. Pontos em aberto

- **Segurança (parece bug):** `GET/POST/PUT/DELETE /api/admin/services` (e `[id]`) não checam sessão nem role (ver `admin-interface`, seção 4): qualquer pessoa pode alterar preços de festa. Só `passport-types` exige `admin`.
- Feriado: ingressos dependem da escolha do comprador ("Fim de semana / feriado"); festas só consideram sábado e domingo. Não existe calendário de feriados no sistema.
- Duas fontes de preço público sem sincronização (vitrine do CMS × bancos de passaporte e serviço).
- Conteúdo não verificável pelo código: valores cadastrados em `PassportType`, `Service` (o seed cria os serviços do sistema com valores iniciais) e no CMS `PriceSection` (`Tiers`, `prices`, `disclaimers`).
- Desconto de 50% por idade e PNE, limites de 12 e 60 meses, tamanho do pacote (10) e duração da festa (3 h) são constantes no código, não configuráveis pelo admin.
