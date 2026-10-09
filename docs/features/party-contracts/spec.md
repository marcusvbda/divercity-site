# Party Contracts

> Estado atual, verificado no código. O que o usuário quiser mudar entra somente em `## 3. Anexos e referências

- Spec relacionado: [admin-interface/spec.md](../admin-interface/spec.md) (seções 2.9 e 2.10 descrevem parte do admin de festas e contratos).
- Pontos desta feature fora de escopo: pagamento (Stripe) e Resend não são usados na reserva de festa.

## 4. Pontos em aberto

**Mudanças pendentes: navegação entre steps** (assumido no plan.md como premissa)
- Vale também depois que o envelope DocuSign já foi criado (`in_review`)? Premissa: sim, até a assinatura; o próximo "Assinar" cria um envelope novo com os valores atualizados.

**Mudanças pendentes: tipo de input das variáveis extras** (assumido no plan.md como premissa)
- Tipo padrão para modelos e variáveis já existentes (sem tipo escolhido): premissa `text`.
- Onde persiste o tipo: premissa `ContractTemplate.variableTypes` (JSON `{ variavel: tipo }`).

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
