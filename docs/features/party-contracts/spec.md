# Party Contracts

> Estado atual, verificado no código. O que o usuário quiser mudar entra somente em `## Mudanças pendentes` (ainda não existe).

## 1. O que é

Fluxo de festa no salão do Divercity Park, da solicitação pública de orçamento/reserva até o contrato assinado e a lista de convidados:

1. O cliente solicita a reserva em `/orcamento` (cria Customer, Party `pending` e Contract `draft`), ou o admin cadastra a festa em `/admin/parties`.
2. O admin envia o link `/c/<token>` pelo WhatsApp.
3. O cliente completa as variáveis do contrato e assina por DocuSign (embedded signing).
4. A assinatura confirma a festa; o cliente cadastra a lista de convidados.

Modelos: `Customer`, `ContractTemplate`, `Party`, `Contract`, `Guest` (`prisma/schema.prisma`). Não há e-mail/notificação automática na reserva, e nenhum pagamento é cobrado (o pagamento é combinado depois, pelo WhatsApp).

## 2. Requisitos (estado atual)

### 2.1 Dados

- Enums: `PartyStatus` (`pending`, `confirmed`, `cancelled`), `ContractStatus` (`draft`, `pending`, `in_review`, `signed`, `completed`, `cancelled`), `PartyPaymentOption` (`salon_only`, `salon_and_passports`), `GuestType` (`child`, `adult`).
- `Customer`: `cpf` único, `name`, `email?`, `phone?`.
- `ContractTemplate`: `name`, `body` (HTML), `variables String[]` (só as variáveis extras, sem `cliente_*`/`festa_*`), `isDefault`. Não há constraint de um único padrão no banco; a unicidade é feita na transação das rotas.
- `Party`: `customerId`, `contractTemplateId`, `date`, `dateEnd?`, `status` (default `pending`), `childrenCount?`, `adultsCount?`, `totalParticipants?`, `paymentOption?`, `salonPrice?`, `passportPackagePrice?`, `passportSinglePrice?`, `passportSingleCount?`, `totalPrice?` (Decimal 10,2), `termsAcceptedAt?`.
- `Contract`: `partyId` único (1 contrato por festa), `body` (cópia do corpo do modelo), `fieldValues` (JSON), `status` (default `draft`), `clientToken?` único, `clientLinkOpen` (default `false`), `docusignEnvelopeId?`, `sentAt?`.
- `Guest`: `partyId`, `name`, `type`, `createdAt`.
- Todas as FKs são `ON DELETE RESTRICT`.
- Status realmente gravados pelo código: contrato `draft` (criação), `in_review` (sign), `signed` (complete/webhook), `cancelled` (cancelar festa, webhook void/declined); `pending` e `completed` nunca são gravados (só via `PUT` genérico), embora `completed` seja tratado como `signed` nas telas e rotas. Festa: `pending` (criação), `confirmed` (complete/webhook), `cancelled` (rota cancel).

### 2.2 Acesso

- Telas de admin (`/admin/parties/**`, `/admin/contract-templates/**`, `/admin/customers/**`): só role `admin`. O `proxy.ts` redireciona `operator` para `/admin/operacao`.
- `/orcamento`, `/c/<token>`, `/api/party-budget/*`, `/api/client/contract/*` e `/api/webhooks/docusign` são públicos (o `proxy.ts` só cobre `/admin`).
- O cliente acessa o contrato só com o token (UUID v4) e com o link aberto.

### 2.3 Orçamento e reserva pública (`/orcamento`)

- Página com Navbar + `OrcamentoNavbarHeader` ("Reserva de Festa", "Orçamento e pagamento do salão de festas", "Ambiente 100% seguro") + `OrcamentoWizard` + Footer. Entrada pelo CTA `ctaBudget` da seção Festas da home (vem do CMS, seed: "Faça já o seu orçamento" → `/orcamento`).
- Wizard `OrcamentoWizard` (react-hook-form + zod + React Query): 3 etapas com barra de progresso ("Seus dados", "Orçamento", "Termos e envio"; em mobile só os números) e tela de sucesso.
- **Etapa 1, Seus dados:** Nome completo*, CPF* (máscara, guarda 11 dígitos, sem validar dígito verificador), Telefone* (máscara; ajuda "Usaremos para falar com você pelo WhatsApp."), E-mail, Data e hora desejada* (`datetime-local`, `min` = agora; enviada em ISO UTC), Quantidade de crianças* e de adultos* (0 crianças é aceito se houver adultos). Total = crianças + adultos, entre 1 e 50 ("Máximo de 50 participantes no total. Crianças, aniversariante e adultos entram no limite."). Mensagens: "Nome é obrigatório", "CPF deve ter 11 dígitos", "CPF deve conter apenas números", "Email inválido", "A data da reserva deve ser no futuro", "Quantidade de crianças inválida", "Quantidade de adultos inválida", "Quantidade total de participantes inválida", "Máximo de 50 participantes no total".
- Disponibilidade consultada a cada mudança da data (`GET /api/party-budget/availability?date=`): "Verificando disponibilidade...", "Data disponível", "Essa data/horário já está reservado. Escolha outra data ou horário." "Avançar" só fica desabilitado se a data estiver explicitamente indisponível.
- **Etapa 2, Orçamento:** `GET /api/party-budget/quote` só para obter preços unitários (os totais da tela são calculados no cliente; o servidor recalcula na reserva). Estados: "Calculando orçamento...", erro do servidor ou "Erro ao calcular orçamento", "Essa data/horário já está reservado. Volte e escolha outra data."
  - **Opção A, Somente salão:** "Nenhum valor pago agora. No mínimo 10 passaportes deverão ser pagos no dia do evento (à vista, PIX ou cartão, conforme disponibilidade)." Linha "Salão (3 horas)".
  - **Opção B, Salão + adiantamento de passaportes:** inclui salão + 1 pacote de 10 passaportes (sempre 1, mesmo com menos de 10 crianças) + contador "Passaportes avulsos extras" (−/+, sem máximo; ao escolher a opção é pré-preenchido com `max(0, crianças − 10)`). Avisos: "Sem reembolso: se comparecerem menos crianças do que o reservado, os passaportes não utilizados não serão reembolsados." e "Passaportes extras: se comparecerem mais crianças, os adicionais podem ser pagos avulsos no dia, conforme disponibilidade."
- **Etapa 3, Termos e envio:** "Termo e Condições da Reserva/Festa" (texto fixo no código, caixa rolável: capacidade máx. 50, 9 mesas e 36 cadeiras, salão por até 3 horas, decoração, alimentação e bebidas, pagamento Opção A/B; termina com "Esta reserva ainda não é uma cobrança. Nossa equipe entrará em contato pelo WhatsApp para confirmar os detalhes, formalizar o contrato e combinar o pagamento."). Checkbox "Li e aceito os Termos e Condições da Reserva/Festa." (botão "Enviar reserva" desabilitado até marcar; "Enviando reserva...").
  - Erros: 400 aplica erros nos campos e mostra "Há campos inválidos no formulário. Corrija e tente novamente."; 409 mostra "Essa data/horário já está reservado. Volte à etapa 1 e escolha outra data." com botão "Escolher outra data"; demais usam `error` do servidor ou "Erro ao processar sua reserva. Tente novamente."
- **Sucesso:** "Reserva recebida!", "Recebemos sua solicitação #{partyId}. Nossa equipe entrará em contato pelo WhatsApp em breve para confirmar os detalhes, formalizar o contrato e combinar o pagamento.", "Fique de olho no seu WhatsApp.", botão "Voltar para a home". Sem link para `/c/<token>`, sem resumo.
- **Disponibilidade (`isSlotAvailable`, `src/lib/party-budget.ts`):** duração da reserva pública 3 h (`dateEnd = date + 3h`); bloqueiam todas as festas não `cancelled`; festa existente sem `dateEnd` assume 4 h; há um único salão (qualquer sobreposição bloqueia); sem intervalo de limpeza, horário de funcionamento ou feriados. Fim de semana (sábado/domingo) é decidido em `America/Sao_Paulo`.
- **Cálculo (`computeQuote`):** serviços da tabela `Service` por chave (`party_salon`, `party_passport_package`, `party_passport_single`), preço de dia útil ou fim de semana conforme a data. `salon_only`: total = salão. `salon_and_passports`: total = salão + pacote + avulsos × preço do avulso. Faltando qualquer um dos 3 serviços (mesmo na Opção A): erro `Serviço "<key>" não cadastrado. Configure em /admin/services.`
- **API `GET /api/party-budget/quote`:** 400 `Parâmetro "date" é obrigatório` / `Parâmetro "date" inválido` / `Parâmetro "paymentOption" inválido. Use "salon_only" ou "salon_and_passports"` / `Parâmetro "passportSingleCount" deve ser um inteiro ≥ 0`; 500 com a mensagem do erro. 200 `{ available, salonPrice, passportPackagePrice, passportSinglePrice, passportSingleCount, total, breakdown[] }`.
- **API `POST /api/party-budget/reservations`:** valida com `PartyBudgetReservationSchema` (400 com `flatten()`); usa o `ContractTemplate` com `isDefault` (sem ele: 500 "Nenhum modelo de contrato padrão configurado. Um administrador precisa marcar um modelo como padrão em /admin/contract-templates."); checa disponibilidade (409 "Data/horário indisponível — já existe uma festa agendada neste horário"); recalcula o orçamento no servidor; em transação faz `upsert` do Customer por CPF (atualiza nome, e-mail e telefone), cria a Party (`status: pending`, campos do orçamento, `termsAcceptedAt = agora`) e o Contract (`draft`, `body` = cópia do modelo, `fieldValues` = cada variável extra do modelo com `""`, sem `clientToken`). Responde 201 `{ partyId }`.

### 2.4 Admin: festas (`/admin/parties`)

- **Navegação:** grupo "Salão de Festas" com "Agenda" e "Modelos de contrato", com badge de festas `pending` (`GET /api/admin/parties?status=pending&perPage=1`, `queryKey ['admin','parties','pending-count']`, só para `admin`). "Clientes" é item à parte. Card "Reservas de Festas" no dashboard (`N pendente(s)` / "Em dia", link para `/admin/parties?status=pending`).
- **Agenda** (`/admin/parties`): "Agenda" / "Festas cadastradas no Divercity Park"; abas "Lista" e "Calendário" (estado local, fora da URL).
  - Lista (`DataTable`, `GET /api/admin/parties?page&perPage&sort&dir&customerName&status&date`): colunas Data (sort; dd/mm/aaaa + HH:mm), Cliente, Template, Contrato (badge ou "Sem contrato"), Festa (sort), ação "Ver"; filtros "Buscar por cliente...", "Status da festa" (Todos/Pendente/Confirmada/Cancelada), "Data"; paginação 10/15/25/50 (padrão 15); loading com 5 skeletons; vazio "Nenhum item encontrado"; botão "Nova festa".
  - Calendário (`EventCalendar`, `GET /api/admin/parties?perPage=100`): visões Mês/Semana/Dia, atalhos M/W/D, "Hoje", pt-BR, semana começa no domingo; título = nome do cliente (ou "Festa"); fim = `dateEnd` ou início + 4 h; clique abre a festa; erro "Não foi possível carregar a agenda."; sem legenda de cores.
  - Rótulos de festa: Pendente (outline; calendário âmbar), Confirmada (primary; esmeralda), Cancelada (destructive; azul-céu, riscado).
- **Nova festa** (`/admin/parties/new`) e aba "Dados" do detalhe usam `PartyForm` (useState, sem react-hook-form): card "1. Cliente" (combobox "Buscar cliente por nome ou CPF...", `GET /api/admin/customers?search=`, mínimo 2 caracteres, "Nenhum cliente encontrado" + "Cadastrar cliente", que abre `/admin/customers/new` em nova aba), "2. Modelo de Contrato" (select "Selecione um modelo..." com chips das variáveis extras ou "Sem variáveis"), "3. Data e Horário" (Data, Início padrão `10:00`, Fim padrão `14:00`). Validações: "Selecione um cliente", "Selecione um template", "Data é obrigatória", "Horário de fim deve ser após o início", "Conflito com festa já confirmada neste horário" (checado no `onBlur`, no navegador, contra as festas não canceladas). Botão "Salvar festa" / "Salvando...". Payload: `{ customerId, contractTemplateId, date, dateEnd }` (sem `status`).
- **Criar** (`POST /api/admin/parties`, `PartySchema`): 400 `flatten()`; conflito com festa não cancelada (fim = `dateEnd` ou início + 4 h) → 409 "Conflito com outra festa já agendada neste horário"; modelo inexistente → 404 "Template not found"; em transação cria a Party e o Contract (`draft`, `body` do modelo, `fieldValues` com as variáveis extras `""`). Sucesso: toast "Festa criada com sucesso" e redireciona para `/admin/parties/{id}`. Erro: `error` ou "Erro ao criar festa".
- **Editar** (`PUT /api/admin/parties/[id]`): conflito checado só contra festas `confirmed` → 409 "Conflito com festa já confirmada neste horário"; atualiza com o `PartySchema` completo. Toast "Festa atualizada" / "Erro ao atualizar festa". Trocar o modelo não altera `body` nem `fieldValues` do contrato.
- **Detalhe** (`/admin/parties/[id]`): "Festa — {nome}" + badge de status + data por extenso; abas "Dados" e "Contrato" (padrão "Dados"); loading com skeletons.
- **Cancelar** (`POST /api/admin/parties/[id]/cancel`): botão "Cancelar festa" (só se não cancelada), `confirm()` "Cancelar esta festa? Isso também cancela o contrato em andamento, se houver."; em transação põe a festa em `cancelled` e o contrato em `cancelled` se não estiver `signed`/`completed`/`cancelled`. Não anula o envelope do DocuSign nem fecha o link. Toast "Festa cancelada" / "Erro ao cancelar festa".
- Não há botão de excluir festa na UI (`DELETE /api/admin/parties/[id]` existe, sem checagens). Não há UI de admin para convidados nem para confirmar festa manualmente.
- `GET /api/admin/parties`: `page` (1), `perPage` (15, máx. 100), `status`, `customerName` (contains, case-insensitive), `date` (`YYYY-MM-DD`, dia UTC), `sort` (`date`|`status`, padrão `date`), `dir`; resposta `{ data, pagination: { page, perPage, total, totalPages } }` com customer, contractTemplate e contract.

### 2.5 Admin: contrato da festa

- **Aba "Contrato"** (`PartyContractTab`): badge de status + "Enviado em {data}"; sem contrato: "Nenhum contrato encontrado para esta festa." Ações (nenhuma é bloqueada por status):
  - "Enviar via WhatsApp": desabilitado sem telefone ("Cliente sem telefone cadastrado"); gera o token se faltar (`POST .../generate-token`, `crypto.randomUUID()`, idempotente), chama `POST .../mark-sent` (`sentAt = agora`, `clientLinkOpen = true`) e abre `https://api.whatsapp.com/send/?phone=55{dígitos}&text=...` com "Olá {nome}! Segue o link para revisar e assinar o contrato da sua festa no Divercity Park: {origin}/c/{token}". Toasts "Link aberto no WhatsApp" / "Erro ao preparar envio".
  - "Link: Aberto/Fechado" (`POST .../toggle-link`): toasts "Link fechado" / "Link aberto" / "Erro ao alterar link".
  - "Copiar link": gera/obtém o token e copia `{origin}/c/{token}`; toasts "Link copiado para a área de transferência!" / "Erro ao gerar link".
  - "Gerar PDF": com `docusignEnvelopeId`, abre `GET /api/admin/contracts/[id]/pdf` (PDF `combined` do DocuSign, inline `contrato-{id}.pdf`; 404 "Contrato não encontrado" / "Contrato ainda não enviado ao DocuSign"; 502 "Não foi possível obter o PDF no DocuSign"); sem envelope, `window.print()`.
  - Card "Variáveis do Contrato" ("Preencha agora ou deixe para o cliente preencher pelo link."): inputs só para as variáveis extras (exclui `cliente_*`/`festa_*`); "Salvar variáveis" (`PUT /api/admin/contracts/[id]` com `{ fieldValues }`, que substitui o JSON inteiro; toasts "Variáveis salvas" / "Erro ao salvar variáveis"). A API só recusa edição de contrato `signed` (403 "Contrato assinado não pode ser alterado") e aceita `status` livre.
  - Preview: contrato `signed`/`completed`/`cancelled` mostra `contract.body` congelado; os demais mostram o corpo do modelo atual. Valores = `buildDefaultValues(party)` + `fieldValues`; variável extra sem valor vira destaque âmbar; variável padrão sem valor vira vazio.
- **Variáveis padrão** (`buildDefaultValues`, `src/lib/contract-defaults.ts`): `cliente_<snake_case>` dos campos escalares do Customer e `festa_<snake_case>` dos da Party (ex.: `festa_date_end`, `festa_children_count`); ignora `null`, `""`, objetos e chaves de id/FK/timestamps/relações; `date`, `dateEnd` e `date_end` saem em data pt-BR (`America/Sao_Paulo`, sem hora); `status` e `termsAcceptedAt` saem crus. `isDefaultVariable` = prefixo `cliente_` ou `festa_`.
- **Página `/admin/parties/[id]/contract`:** título "Contrato" + badge; botões "Link do cliente: Aberto/Fechado", "Copiar link", "Gerar PDF" (sem WhatsApp e sem editor de variáveis); renderiza `contract.body` com `dangerouslySetInnerHTML`, sem mesclar valores padrão (todas as variáveis `cliente_*`/`festa_*` aparecem como placeholder).
- **`/admin/parties/contracts`** ("Todos os Contratos", sem link de menu): `GET /api/admin/contracts` (todos, sem paginação, ordenados por data da festa asc); colunas Data da festa, Cliente, Template, Status, "Link cliente" (Aberto/Fechado) e ações "Festa" e "Contrato"; sem filtro/ordenação/paginação; vazio "Nenhum contrato encontrado".
- **Rótulos de status do contrato:** badges iguais em todas as telas (draft outline, pending/in_review secondary, signed/completed default, cancelled destructive), rótulos diferentes: Agenda usa `pending` = "Aguardando cliente" e `in_review` = "Assinando…"; aba, página de contrato e lista usam "Pendente" e "Em revisão". `draft` = "Rascunho", `signed` = "Assinado", `completed` = "Concluído", `cancelled` = "Cancelado" em todas.

### 2.6 Admin: modelos de contrato

- **Lista** (`/admin/contract-templates`): "Modelos de Contrato" / "Templates reutilizáveis com variáveis dinâmicas", "Novo modelo"; `DataTable` (`GET /api/admin/contract-templates`, `search` por nome, `sort` `name`|`createdAt`, padrão 15 por página); colunas Nome (sort, badge "Padrão") e Variáveis (extraídas do corpo no cliente; `cliente_*`/`festa_*` outline, extras secondary, "Nenhuma"); ações editar e excluir (`confirm('Remover este modelo?')`, toasts "Modelo removido" / "Erro ao remover modelo").
- **Formulário** (`TemplateForm`): "Nome do modelo *" (placeholder "Ex: Contrato Padrão de Festa"), checkbox "Definir como modelo padrão (usado no orçamento/reserva pelo site)", "Conteúdo *" (`TipTapEditor`: Negrito, Itálico, Sublinhado, Título 1–3, Lista, Lista numerada, alinhamentos, popover "Variável extra" que insere `{{nome}}`). Validações "Nome é obrigatório" e "Conteúdo é obrigatório". Painel "Variáveis padrão disponíveis" (abas Cliente/Festa, vindas de `GET /api/admin/contract-variables`, clique copia `{{var}}`, toast "{{var}} copiado!"). Alerta "Variáveis extras detectadas ({n}) — serão preenchidas manualmente:".
- **Páginas:** "Novo Modelo" (toast "Modelo criado com sucesso" / "Erro ao criar modelo") e "Editar Modelo" (toast "Modelo atualizado" / "Erro ao atualizar modelo"), ambas redirecionam para a lista.
- **APIs:** o `POST`/`PUT` extrai `variables` (tokens `{{\w+}}` do corpo, sem `cliente_*`/`festa_*`); `isDefault: true` desmarca os demais na mesma transação. O `PUT` propaga `body` e `fieldValues` (mantendo valores já existentes) para os contratos não `signed`/`completed`/`cancelled` das festas do modelo, inclusive `in_review`. `DELETE` sem checagens. `GET /api/admin/contract-variables` lê `information_schema.columns` de `customers` e `parties` (sem id/FKs/timestamps) e devolve `{ cliente: [...], festa: [...] }` com `key`, `variable` e `label`.

### 2.7 Portal do cliente (`/c/[hash]`)

- Página `noindex`, carrega tudo no cliente com React Query (`retry: false`). Estados, nesta ordem:
  1. "Carregando..."
  2. "Link Indisponível" / "Este link está indisponível no momento. Por favor, entre em contato com o Divercity Park." (erro, sem contrato ou `clientLinkOpen = false`)
  3. "Reserva cancelada" / "Esta reserva foi cancelada. Se você acredita que isso é um engano, entre em contato com o Divercity Park." (contrato ou festa `cancelled`)
  4. Contrato `signed`/`completed`: banner "Contrato assinado", `ContractPreview` e lista de convidados (sem botão de PDF).
  5. Fluxo de passos para `draft`/`pending`/`in_review`:
     - **Passo 1, "Preencha seus dados":** um input por variável extra ainda vazia (label = nome com `_` → espaço, placeholder `Seu {var}...`); "Continuar" / "Salvando..."; sem campo obrigatório; pulado se não houver nada a preencher.
     - **Passo 2, "Revise seu contrato":** preview, "Voltar" (só se houve passo 1) e "Continuar"; sem checkbox de aceite.
     - **Passo 3, "Assinar contrato":** card "Assinatura segura via DocuSign" ("Você será redirecionado para assinar o contrato digitalmente.", "Assinatura com validade jurídica", "Processo 100% digital, sem papel", "Cópia enviada por e-mail após assinatura"); "Assinar contrato" / "Abrindo DocuSign..."; erro da API ou "Erro ao iniciar assinatura".
     - **Passo 4** (retorno com `?ds_event=signing_complete`): "Contrato assinado!", "Recebemos sua assinatura. Nossa equipe irá revisar e confirmar sua festa em breve.", "Em caso de dúvidas, entre em contato com o Divercity Park."
- Layout `max-w-xl`/`max-w-3xl`, `px-4`, assinatura por redirecionamento de página inteira (`window.location.href`).
- **`GET /api/client/contract/[hash]`:** busca por `clientToken` (404 `Not found`); não checa `clientLinkOpen`; devolve o contrato com party, customer e modelo.
- **`PUT /api/client/contract/[hash]`:** `fieldValues` (`record<string,string>`); só grava chaves cujo valor atual é vazio; 400 (zod), 404 `Not found`, 403 "Link indisponível", 403 "Contrato já assinado" (só `signed`).
- **`POST .../sign`:** 404 "Contrato não encontrado" (inclui link fechado), 400 "Contrato já assinado", 400 "Esta reserva foi cancelada", 422 "Cliente sem e-mail cadastrado". Monta o HTML (`contract.body` com `{{var}}` substituído por `buildDefaultValues` + `fieldValues`, não preenchida vira `""`), cria envelope DocuSign `sent` com 1 signatário embedded (`clientUserId = hash`, `authenticationMethod: none`), assunto `Contrato para assinatura — {nome do modelo}`, `signHereTab` na página 1 (x=100, y=680), retorno `${NEXT_PUBLIC_APP_URL}/c/{hash}?ds_event=signing_complete`; grava `docusignEnvelopeId` e contrato `in_review`; responde `{ url }`. Cada chamada cria um envelope novo.
- **`POST .../complete`:** consulta o status do envelope no DocuSign (não confia no cliente); se `completed`, em transação contrato `signed` + festa `confirmed` e responde `{ status: 'signed' }`; senão devolve o status do DocuSign; já `signed` responde `{ status: 'signed' }` sem consultar. 404 "Contrato não encontrado", 400 "Envelope não encontrado".
- **Webhook `POST /api/webhooks/docusign`:** lê `event` e `data.envelopeId`; `envelope-completed` → contrato `signed` + festa `confirmed`; `envelope-voided`/`envelope-declined` → contrato `cancelled` (a festa não muda); sempre 200; sem validação de assinatura/HMAC.
- **DocuSign (`src/lib/docusign.ts`):** JWT Grant (scopes `signature impersonation`, token novo a cada chamada); variáveis de ambiente `DOCUSIGN_BASE_PATH`, `DOCUSIGN_OAUTH_BASE_PATH`, `DOCUSIGN_PRIVATE_KEY_BASE64`, `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, `NEXT_PUBLIC_APP_URL`; HTML enviado em base64 (`fileExtension: html`), conversão para PDF feita pelo DocuSign; SDK em `serverExternalPackages` com `scripts/patch-docusign.js` no `postinstall`.

### 2.8 Convidados

- Rotas `GET`/`POST /api/client/contract/[hash]/guests` e `DELETE .../guests/[guestId]`; só com contrato `signed`/`completed` (senão 403 "Lista de convidados disponível após a assinatura do contrato"). Sem checagem de `clientLinkOpen` nem de festa cancelada.
- `GET`: `{ guests (createdAt asc), total, limit: 50, quotedTotalParticipants }`. `POST` (`GuestSchema`: `name` mín. 1 "Nome é obrigatório", `type` `child`|`adult`): 409 "Limite de 50 participantes atingido" (`GUEST_LIMIT = 50` fixo no código); 201 com o convidado. `DELETE`: 404 `Not found` se o convidado não existe ou é de outra festa; `{ success: true }`. Sem checagem contra `childrenCount`/`adultsCount`/`totalParticipants`.
- UI (`GuestList`): "Lista de Convidados" ("Cadastre aqui todos os participantes da festa, incluindo o(a) aniversariante — esta lista representa o total de pessoas que estarão presentes."); "Total: {total} / {limit} participantes" (vermelho a partir de 45); "Sua reserva foi feita para N participante(s) — use este número como referência ao montar a lista."; "Crianças utilizarão os brinquedos e precisarão de passaporte. Adultos participarão da festa, mas não utilizarão os brinquedos."; colunas "Crianças (n)" / "Adultos (n)" ("Nenhuma criança cadastrada." / "Nenhum adulto cadastrado."); badge "Criança"/"Adulto", "Remover" / "Removendo..."; formulário "Nome do convidado" (placeholder "Nome completo"), "Tipo" (Criança padrão / Adulto), "Adicionar convidado" / "Adicionando...", "Informe o nome do convidado"; lista cheia "Limite de 50 participantes atingido."; "Carregando lista de convidados..."; fallbacks "Erro ao carregar convidados", "Erro ao adicionar convidado", "Erro ao remover convidado". Grid de 1 coluna no mobile, 2 a partir de `sm`.

### 2.9 Clientes (usados pela festa)

- `/admin/customers`: lista com busca "Buscar por nome ou CPF...", colunas Nome, CPF, Email, Telefone; `CustomerForm` (react-hook-form + `CustomerSchema`); erro 409 "Já existe um cliente cadastrado com este CPF."; ao salvar volta para `/admin/customers` (não retorna à festa).

## 3. Anexos e referências

- Spec relacionado: [admin-interface/spec.md](../admin-interface/spec.md) (seções 2.9 e 2.10 descrevem parte do admin de festas e contratos).
- Pontos desta feature fora de escopo: pagamento (Stripe) e Resend não são usados na reserva de festa.

## 4. Pontos em aberto

Itens marcados "parece bug" são comportamento observado no código, não registrado como esperado.

**Segurança**
- Parece bug: nenhuma rota de `/api/admin/{parties,contracts,contract-templates,contract-variables,customers}` checa sessão ou role (sem `requireRole`); o `proxy.ts` só cobre `/admin`. Qualquer pessoa, sem login, lê (inclui CPF/e-mail/telefone), cria, edita, exclui, gera token do portal, abre/fecha link e baixa o PDF.
- Parece bug: `GET /api/client/contract/[hash]` devolve o contrato completo (CPF, e-mail, telefone, preços, `docusignEnvelopeId`, `clientToken`) mesmo com o link fechado; só a UI esconde.
- Parece bug: o `PUT` do cliente aceita qualquer chave e o merge final é `{...defaultValues, ...userValues}`; o cliente pode sobrescrever `cliente_*`/`festa_*` (ex.: `festa_total_price`) no documento enviado ao DocuSign. Os valores entram no HTML sem escape (injeção de HTML), e em `/admin/parties/[id]/contract` o `dangerouslySetInnerHTML` renderiza esses valores sem sanitização (XSS).
- Parece bug: o webhook do DocuSign não valida assinatura/HMAC; quem conhecer um `envelopeId` marca contrato `signed` e festa `confirmed`.
- Parece bug: `POST /reservations` faz `upsert` do Customer por CPF e sobrescreve nome, e-mail e telefone de um cliente existente (e-mail vazio apaga o e-mail); sem rate limit nem captcha.
- Parece bug: `complete` e o webhook não checam cancelamento; uma festa `cancelled` volta a `confirmed` se o envelope for concluído (a rota cancel não anula o envelope).

**Status e fluxo**
- Parece bug: editar a festa pelo admin não envia `status` e o `PartySchema` tem `.default("pending")`; todo `PUT` volta a festa para `pending`, inclusive `cancelled` (com contrato `cancelled`).
- Parece bug: conflito de horário com regras diferentes: `POST` (admin) e a reserva pública bloqueiam por festas não canceladas; `PUT` só por `confirmed`; o front do `PartyForm` checa só as 15 primeiras festas e diz "já confirmada". Duração padrão 4 h (admin) vs 3 h (público). Checagem pública fora da transação e sem lock (corrida). Sem constraint no banco. Reservas `pending` bloqueiam o horário sem expirar.
- Parece bug: webhook `void`/`declined` cancela o contrato (inclusive já `signed`) mas não a festa.
- Parece bug: `mark-sent` e `toggle-link` não checam o status do contrato (reabrem link de contrato cancelado); a aba de contrato não bloqueia ações nem o editor de variáveis em `signed`/`cancelled`; o `PUT` do contrato só trava `signed` (a UI trava `signed`/`completed`/`cancelled`) e substitui `fieldValues` inteiro.
- Parece bug: cancelar a festa não fecha `clientLinkOpen`; as rotas de convidados continuam aceitando edição em festa cancelada.
- Parece bug: cada clique em "Assinar contrato" cria um novo envelope; o anterior fica pendente. A âncora de assinatura é fixa na página 1.
- Trocar o modelo da festa não regenera `body`/`fieldValues` do contrato (aba mostra o modelo novo, `sign` usa o corpo antigo). Editar um modelo sobrescreve contratos `in_review` já enviados ao DocuSign. `isDefault` pode ficar sem nenhum modelo padrão (reserva pública responde 500). `DELETE` de modelo/festa falha por FK (500 sem tratamento).
- Cliente sem e-mail: o `sign` exige e-mail (422), mas e-mail é opcional no cadastro e na reserva pública.
- `completed` e `pending` de contrato nunca são gravados pelo código; confirmar se continuam no enum.

**Variáveis e documento**
- Parece bug: `contract-variables` devolve colunas camelCase (`festa_dateEnd`, `festa_childrenCount`...) e `buildDefaultValues` gera snake_case (`festa_date_end`...); variáveis com mais de uma palavra copiadas do painel nunca são preenchidas. Rótulos "DateEnd", "ChildrenCount" não humanizados.
- Parece bug: no `sign` a party vem do Prisma (`Date`/`Decimal` são objetos e são ignorados); `festa_date`, `festa_date_end`, `festa_*_price`, `festa_total_price` etc. saem vazios no documento do DocuSign, enquanto as prévias (JSON) os mostram. `festa_status` sai em inglês cru, `festa_terms_accepted_at` em ISO, valores monetários sem formatação; não há variável de horário.
- Parece bug: o destaque âmbar de variável não preenchida provavelmente é removido pelo TipTap (`class` no `span`).
- Parece bug: o CSS de impressão de `/admin/parties/[id]/contract` deixa a página em branco.
- Schema drift: `Contract.docusignEnvelopeId` está no `schema.prisma`, mas nenhuma migration em `prisma/migrations` o cria.

**Admin: UX e dados**
- Parece bug: `PartyForm` grava o horário local com sufixo `Z` (UTC); na edição `date` vem de `toISOString()` (UTC) e os horários de `toLocaleTimeString` (local), então cada salvamento desloca o horário em 3 h (em BRT); o filtro `date` usa o dia UTC.
- Parece bug: `toast.error` recebe o objeto `flatten()` do zod em criar/editar festa; "Template not found" em inglês.
- Parece bug: select de modelos traz só 15; calendário só 100 festas (as mais antigas); busca de cliente por CPF formatado não casa (`contains` no CPF cru).
- Parece bug: "Copiar link" não checa a resposta (pode copiar `/c/undefined` com toast de sucesso); WhatsApp sempre prefixa `55` e chama `window.open` fora do gesto do usuário (pode ser bloqueado).
- Parece bug: detalhe da festa sem estado de 404/erro; lista de contratos e card do dashboard sem estado de erro (erro vira "Em dia").
- `/admin/parties/contracts` não tem link de acesso. Breadcrumb mostra o id numérico. Rótulos de status de contrato divergem entre telas. "Cadastrar cliente" abre nova aba e não volta para o formulário da festa. Não há UI de admin para convidados nem para confirmar festa.
- `TipTapEditor` sem `immediatelyRender: false` (aviso de hidratação, ao contrário de `ContractPreview`).

**Orçamento e portal público**
- Parece bug: telefone aparece como obrigatório (`*`), mas o schema aceita vazio; data inválida mostra mensagem padrão do zod em inglês; a mensagem do refine de `totalParticipants` expõe nomes técnicos de campo.
- Parece bug: dá para avançar na etapa 1 com a disponibilidade carregando/falha (`!== false`); sem UI de erro para essa consulta; não há validação de horário de funcionamento/dia da semana, embora os termos citem "horário limite conforme o dia".
- Parece bug: avulsos não são recalculados se o usuário volta e muda o número de crianças com a Opção B selecionada; o contador está dentro de um `<button>` (HTML inválido, aviso de hidratação).
- Parece bug: erro 400 do envio mostra só a mensagem genérica; erros de campos de outras etapas ficam invisíveis na etapa 3.
- Parece bug: mensagens internas aparecem ao cliente público: `Serviço "<key>" não cadastrado. Configure em /admin/services.` e "Nenhum modelo de contrato padrão configurado...". `POST /reservations` e `availability` sem tratamento de JSON inválido/erro de banco.
- Texto de marketing ("pagamento seguro", "Ambiente 100% seguro", "Orçamento e pagamento do salão") sugere pagamento online, mas o fluxo não cobra nada.
- Mobile: inputs numéricos/CPF/telefone sem `inputMode`; botões −/+ de 24 px; sem scroll ao topo ao trocar de etapa; `min` do `datetime-local` não confiável no iOS Safari.
- Portal: o passo 1 não verifica `r.ok` ao salvar e não invalida a query; o passo 4 aparece independentemente do resultado de `complete`; outros valores de `ds_event` (cancel, decline, ttl_expired) voltam ao passo 1; o texto "Nossa equipe irá revisar e confirmar" diverge da confirmação automática; sem checkbox de aceite no contrato (`termsAcceptedAt` só é gravado na reserva, sem IP/versão dos termos); a falha do DocuSign no `sign` vira 500 sem JSON e a UI mostra erro de parse; `GuestList` não mostra erro quando o `GET` falha; o cliente não tem botão de PDF.
- Convidados: limite 50 fixo e sem transação (corrida); sem relação com `childrenCount`/`adultsCount`; sem tamanho máximo/trim no nome.
- O texto dos termos, o limite de 50, a duração de 3 h e o pacote de 10 passaportes são fixos no código (duplicados em schema, lib e wizard), não vêm do CMS.
- Não verificável: configuração real do DocuSign (e-mail de cópia ao signatário embedded), conteúdo do modelo de contrato padrão no banco (o seed tem um placeholder com `variables: []` apesar de usar `{{cliente_name}}`, `{{cliente_cpf}}`, `{{festa_date}}`) e preços cadastrados em `Service`.
