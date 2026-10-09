# Admin Interface

## 1. O que é

Interface administrativa do sistema Divercity Park, em `/admin`. Este corpo descreve o **estado atual** (levantado do código). A refatoração planejada entra somente em `## Mudanças pendentes`.

Acesso por role (`UserRole`: `admin`, `operator`; novo usuário entra como `operator`, a promoção é por banco ou script, não há UI):

- `admin`: todas as telas.
- `operator`: somente `/admin/login` e `/admin/operacao*`. Qualquer outra rota de página redireciona para `/admin/operacao` (`src/proxy.ts`). O proxy cobre só `/admin` e `/admin/:path*`, **não `/api/*`**. Rotas fora de `/admin/login*` só passam com sessão válida: token sem `error` e com `exp` do access token do Supabase no futuro; caso contrário o proxy redireciona para `/admin/login?callbackUrl=…` antes de qualquer render. `/admin/login*` sempre passa pelo proxy.

## 2. Estado atual

### 2.1 Casca (layout, navegação, sessão)

- Tema/kit (AdminCN, template `shadcn-nextjs-admincn-admin-template-free`, estilo `base-vega`): componentes do template, sem customização estética, em `src/components/admin/ui/` (isolados; o site público e `src/components/ui` não mudam), com `use-mobile` em `src/components/admin/hooks/`. Somente tema light (sem dark mode; `Toaster` do kit com `theme='light'`). Fonte Geist (`next/font`, `src/app/admin/admin-font.ts`) e tokens extras em `src/app/admin/admin-theme.css`, escopados por `body:has([data-admin-theme])` (cobre portais de Sheet, Dropdown, Select e Toaster); os layouts `(panel)` e `(auth)` renderizam o wrapper `<div data-admin-theme>`. Telas migram do kit antigo para o novo nas fases seguintes.
- Route groups (URLs inalteradas): `src/app/admin/(auth)/` (login, esqueci e redefinir senha) tem layout só com `NextAuthProvider` (sem casca); `src/app/admin/(panel)/` contém todas as demais telas. O `layout.tsx` do painel faz `redirect('/admin/login')` no servidor quando não há sessão ou a sessão tem `error`, antes de renderizar qualquer casca ou conteúdo. Com sessão válida monta `NextAuthProvider`, `SessionGuard`, `TooltipProvider`, `SidebarProvider` e a casca do template em `src/components/admin/layout/`: `Sidebar` (`collapsible='icon'`; vira Sheet no mobile), `SidebarInset` com `Header`, conteúdo em `px-4 py-6 sm:px-6`, `Toaster` do kit admin e `Footer` (`©<ano> Divercity Park`, sem links). O logo da sidebar vem de `getContentType('NavBar').Logo.url.value`; sem logo, mostra o texto "Divercity Park".
- `SessionGuard`: se `session.error` surgir com a página já aberta (expiração em uso), faz `signOut` para `/admin/login`.
- Menu `admin` (ordem, sidebar principal com submenus colapsáveis; no modo ícone, flyout): Ver site (`/`, nova aba, nunca ativo), Dashboard, CMS (Visão geral + um subitem por tipo `editable=true`, `GET /api/admin/content-types?limit=100&sort=name&editable=true`, `queryKey ['admin','content-types','sidebar']`), Clientes, Salão de Festas (Agenda, Modelos de contrato; badge com nº de festas `pending`), Preços e Serviços, Passaportes, Operação (Visão geral, Validar ticket, Ingressos), Configurações (Integrações). Item ativo por prefixo (`activePath`); Dashboard, "Visão geral" e subitens do CMS usam match exato.
- Menu `operator`: Ver site e Operação (mesmos subitens).
- Badge de pendentes: `GET /api/admin/parties?status=pending&perPage=1`, `queryKey ['admin','parties','pending-count']`, habilitada só com sessão autenticada e role `admin`; `SidebarMenuBadge` do kit, exibido só com contagem maior que 0.
- Menu do usuário (`ProfileDropdown` no `Header`): avatar com iniciais, nome (`username`), e-mail e um único item "Sair" (`signOut` para `/admin/login`).
- `Header`: `SidebarTrigger` + `Separator` + `Breadcrumb` em pt-BR derivado do pathname (rótulos: Dashboard, CMS, Tipos de conteúdo, Clientes, Preços e Serviços, Passaportes, Modelos de contrato, Salão de Festas, Contratos, Contrato, Operação, Validar, Ingressos, Configurações, Novo; segmento dinâmico mostra o próprio valor; intermediários são links, exceto `/admin/cms/component-types`, que não tem página) + `ProfileDropdown`. O título fica na página (sem `<h1>` no header).
- Listagens usam `DataTable` (`src/components/admin/data-table.tsx`, visual do template: `Card`, faixa de filtros, toolbar com busca em `InputGroup` e `Select` de linhas por página, cabeçalho com chevrons de ordenação, rodapé com `Pagination` do kit; exceto `parties/contracts`, que usa `Card` + `Table`): busca por texto sem debounce, filtros `search`/`select`/`date` (valor inicial lido da URL, URL não é atualizada), ordenação por coluna `sortable` (1º clique asc, 2º desc), paginação 15 (opções 10/15/25/50), rodapé "Mostrando X–Y de N", loading com 5 linhas de Skeleton, vazio "Nenhum item encontrado". Sem estado de erro; tabela rola na horizontal no mobile.
- Listas retornam `{ data, pagination: { page, perPage, total, totalPages } }`; `perPage` com teto de 100.

### 2.2 Autenticação

- NextAuth (`CredentialsProvider` "Supabase", sessão JWT) com `supabase.auth.signInWithPassword`; faz `upsert` em `users` (role default `operator`). A role é relida do banco no callback `jwt`. Só o access token do Supabase é guardado: quando expira, a sessão recebe `error: "InvalidToken"` e o `SessionGuard` faz o logout.
- `/admin/login`, `/admin/login/esqueci-senha` e `/admin/login/redefinir-senha` usam o layout de auth do template (`AuthCard` em `src/components/admin/auth-card.tsx`: tela centralizada com `AuthBackgroundShape`, `Card` `sm:max-w-lg`, logo do CMS `NavBar.Logo.url` com fallback para o texto "Divercity Park", `Field`/`FieldGroup`, senha com `InputGroup` e botão mostrar/ocultar). Sem magic link, cadastro, login social nem "Remember me".
- `/admin/login` (título "Entrar"): campos e-mail e senha; erro único "E-mail ou senha inválidos"; sucesso vai para `callbackUrl` (padrão `/admin`). Já autenticado (sessão válida, sem `error`, verificada no servidor em `page.tsx`): `operator` vai para `/admin/operacao`, `admin` para `/admin`. Link "Esqueci minha senha".
- `/admin/login/esqueci-senha`: envia link via `supabase.auth.resetPasswordForEmail` (direto do browser), com `redirectTo` para `/admin/login/redefinir-senha`. Sucesso: "E-mail enviado… O link expira em 1 hora."; link "Voltar ao login".
- `/admin/login/redefinir-senha`: fluxo PKCE (`?code=`, trocado por `exchangeCodeForSession` uma única vez via `useQuery`). Estados: verificando, link inválido/expirado (com "Solicitar novo link"), formulário, concluído (redireciona ao login após 3 s). Nova senha: mínimo 8 caracteres, 1 maiúscula, 1 número, confirmação igual.
- Autorização nas APIs: `requireRole` (`src/lib/authz.ts`) responde 401 `{error:"Não autenticado"}` e 403 `{error:"Acesso negado"}`. Hoje é usado em `passport-types` (`admin`) e em `/api/tickets/operate/*` (`admin`, `operator`). As APIs do CMS exigem apenas sessão (qualquer role). As demais APIs de `/api/admin/*` não exigem nada (ver seção 4).

### 2.3 Dashboard (`/admin`)

- Cabeçalho de página simples (sem banner colorido) com data por extenso (pt-BR), saudação por hora ("Bom dia" < 12h, "Boa tarde" < 18h, senão "Boa noite") com nome do usuário, e texto de boas-vindas.
- Cards do kit admin (`Card` com ícone em quadrado `bg-primary/10` e `Badge` em `CardAction`). Card de festas pendentes: mostra `N pendente(s)` e link para `/admin/parties?status=pending`; sem pendentes, "Em dia" e link para `/admin/parties`. Loading: "Carregando...".
- Card "Gerenciador de Conteúdo" com link para `/admin/cms`.

### 2.4 Configurações (`/admin/settings`)

- Título "Integrações", três abas, cada uma com seu botão "Salvar" e salvando só as chaves da aba. Chaves ficam na tabela `settings` (`key`, `value`). Após salvar: toast "Configurações salvas com sucesso!" (erro: "Erro ao salvar configurações"), `router.refresh()` e revalidação de cache por prefixo da chave.
  - Google: `google_places_api_key` (secreto), `google_place_id`, `google_testimonials_minimum_rating` (1 a 5, padrão `4`).
  - Instagram: `instagram_access_token` (secreto; ajuda: token de ~60 dias, "O cron renova automaticamente no dia 1 de cada mês."), `instagram_url`.
  - Stripe: `stripe_publishable_key`, `stripe_secret_key` (secreto), `stripe_webhook_secret` (secreto).
- Campos secretos têm botão de mostrar/ocultar.

### 2.5 CMS (`/admin/cms`)

- Visão geral: grid de cards por `ContentType` (todos, inclusive `editable=false`), cada um com botão "Limpar cache" (`revalidateTag('cms:<nome>')`) e "Limpar todos" (`revalidateTag('cms')`), mais aviso de que alterações só aparecem no site após limpar o cache. As server actions exigem apenas sessão.
- Sidebar lista os tipos com `editable=true` (`GET /api/admin/content-types?limit=100&sort=name&editable=true`).
- `/admin/cms/component-types/[id]`: lista os componentes do tipo; cada um abre um `Sheet` lateral (`GET /api/admin/content-components/:id`) com os campos:
  - valor simples: `Input` de texto; salva com `PUT /api/admin/component-field-values/:id` (revalida `cms:<tipo>`);
  - instância (campo `multiple`): um `Input` por sub-campo, adicionar e remover linha (`POST`/`DELETE /api/admin/component-field-values`, `PUT /api/admin/component-instance-field-values/:id`).
- Todos os campos são `Input` de uma linha. Não há upload de imagem (imagens são URLs coladas), nem textarea, nem preview.
- Salvar usa `ConfirmButton` de dois cliques; toasts "Salvo com sucesso" / "Erro ao salvar".
- Leitura pública: `getContentType` em `src/lib/cms.ts` (`'use cache'`, tags `cms` e `cms:<tipo>`, `cacheLife("max")`).

### 2.6 Clientes (`/admin/customers`, `/new`, `/[id]`)

- Lista: colunas Nome (sort), CPF (sort, `000.000.000-00`), E-mail, Telefone (`(XX) XXXXX-XXXX`); busca "Buscar por nome ou CPF..."; ações editar e excluir (`confirm('Remover este cliente?')`).
- Formulário: Nome (obrigatório), CPF (obrigatório, 11 dígitos numéricos, sem validar dígito verificador, único), E-mail (opcional), Telefone (opcional, sem validação de formato).
- Respostas: 409 "Já existe um cliente cadastrado com este CPF.", 500 "Erro inesperado ao salvar o cliente.". Toasts: "Cliente criado com sucesso", "Cliente atualizado", "Cliente removido", "Erro ao remover cliente".

### 2.7 Preços e Serviços (`/admin/services`, `/new`, `/[id]`)

- Lista: Nome (sort, com badge da `key` quando existe), "Dia de semana", "Fim de semana" (BRL); busca por nome. A lixeira só aparece para serviços sem `key`; o DELETE de serviço com `key` responde 403 "Este serviço é utilizado pelo sistema e não pode ser removido, apenas editado.".
- Formulário: Nome, preço dia de semana e preço fim de semana (R$, `>= 0`). A `key` não é editável.
- Chaves usadas pelo orçamento público: `party_salon`, `party_passport_package`, `party_passport_single`. Fim de semana = sábado ou domingo em `America/Sao_Paulo` (feriado não entra). Sem a chave cadastrada, o orçamento falha com `Serviço "<key>" não cadastrado. Configure em /admin/services.`.

### 2.8 Passaportes (`/admin/passport-types`, `/new`, `/[id]`)

- Lista: Nome (badge "Inativo"), Duração (`N min`), Criança semana/fim de semana, Acompanhante semana/fim de semana; busca por nome; sem colunas ordenáveis (API ordena por `sort`, `durationMinutes`).
- Formulário: Nome, Duração (minutos, API exige inteiro positivo), quatro preços (`>= 0`), checkbox "Ativo (disponível para compra no site)". `sort` não é editável pela UI.
- DELETE responde 403 "Este tipo de passaporte já foi usado em compras e não pode ser removido. Desative-o em vez disso." quando há criança vinculada.

### 2.9 Modelos de contrato (`/admin/contract-templates`, `/new`, `/[id]`)

- Lista: Nome (badge "Padrão"), Variáveis (`{{var}}` extraídas do corpo; padrão em outline, extras em secondary); busca por nome.
- Formulário: Nome, checkbox "Definir como modelo padrão (usado no orçamento/reserva pelo site)", painel de variáveis padrão (abas Cliente/Festa, copia `{{...}}`), editor TipTap, aviso "Variáveis extras detectadas (N) — serão preenchidas manualmente".
- Variáveis padrão: prefixos `cliente_` e `festa_`, geradas de `GET /api/admin/contract-variables` a partir das colunas das tabelas `customers` e `parties`. As demais são extras, preenchidas por festa.
- Marcar como padrão desmarca os outros (transação). Editar um modelo atualiza o `body` e `fieldValues` dos contratos não `signed`/`completed`/`cancelled` das festas que o usam.

### 2.10 Festas (`/admin/parties`)

- **Agenda** (`/admin/parties`): alterna Lista/Calendário. Lista: Data (sort), Cliente, Template, Contrato (badge ou "Sem contrato"), Festa (sort; Pendente, Confirmada, Cancelada); filtros busca por cliente, status e data; ação "Ver". Calendário mensal de 7 colunas (domingo primeiro), nome do cliente como link, cor por status (pending amarelo, confirmed verde, cancelled cinza riscado); carrega `GET /api/admin/parties?perPage=100`.
- **Nova festa / editar** (`PartyForm`, 3 etapas): Cliente (busca por nome/CPF com mínimo de 2 caracteres, ou "Cadastrar cliente"), Modelo de contrato (select) e Data/horário (início padrão 10:00, fim padrão 14:00). Valida data obrigatória, fim após início e conflito de horário (checado no `onBlur`).
- Dados da reserva pública (`status`, contagens, `paymentOption`, preços, `termsAcceptedAt`) não são editáveis no admin.
- **Detalhe** (`/admin/parties/[id]`): cabeçalho com nome, badge de status e data; "Cancelar festa" (cancela também o contrato em andamento); abas Dados e Contrato. Não há botão de excluir festa.
- **Aba Contrato** (`PartyContractTab`): status e "Enviado em"; "Enviar via WhatsApp" (gera token, marca como enviado e abre `api.whatsapp.com` com o link `<origin>/c/<token>`; desabilitado sem telefone); toggle do link (Aberto/Fechado); "Copiar link"; "Gerar PDF" (PDF do DocuSign se houver envelope, senão `window.print()`); editor das variáveis extras ("Salvar variáveis"); preview do corpo (contrato `signed`/`completed`/`cancelled` usa o corpo congelado do contrato).
- `/admin/parties/[id]/contract`: página alternativa com link, PDF e preview do contrato.
- `/admin/parties/contracts` ("Todos os Contratos"): colunas Data, Cliente, Template, Status, "Link cliente", botões "Festa" e "Contrato"; sem busca, filtro, ordenação ou paginação; sem link de acesso no menu.
- Status de contrato: `draft` (Rascunho), `pending`, `in_review`, `signed`, `completed`, `cancelled`. Hoje o código só grava `draft`, `in_review`, `signed` e `cancelled`.
- Criar festa cria também o `Contract` (`draft`) com o corpo do modelo. Conflito de horário: `POST` considera festas não canceladas, `PUT` só as `confirmed`; sem `dateEnd`, o admin assume 4 h (o fluxo público usa 3 h).
- Fluxo do cliente fora do admin: `/c/<token>`, assinatura por DocuSign (exige e-mail do cliente), confirmação da festa na assinatura (também via webhook `/api/webhooks/docusign`) e lista de convidados (limite 50, só após assinar). O admin não tem tela de convidados.

### 2.11 Operação (`/admin/operacao`)

Acessível a `admin` e `operator`.

- **Visão geral:** contadores "No parque agora" (`checked_in`), "Pagos aguardando entrada" (`paid`), "Check-ins hoje" e "Check-outs hoje"; botão "Validar ticket"; card "Como usar". Sem polling.
- **Validar** (`/validar`): campo de código curto (máx. 12, maiúsculas, `autoFocus`) e leitor de QR por câmera (`html5-qrcode`, câmera traseira, 10 fps). O QR contém só o código curto (6 caracteres do alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`). Ambos navegam para `/validar/<código>`. Mensagens de câmera: permissão negada, câmera indisponível, navegador sem suporte.
- **Detalhe** (`/validar/[shortCode]`, `GET /api/tickets/operate/:code`): badge de status (`checked_in` "Em uso no parque", `checked_out` "Finalizada", `paid` "Pago — aguardando entrada", `pending_payment` "Aguardando pagamento", `payment_failed` "Pagamento falhou", `cancelled` "Cancelada"); erro mostra "Compra não encontrada".
  - `pending_payment`, `payment_failed`, `cancelled`: card vermelho "Não é possível processar entrada para esta compra.", sem ação.
  - `paid`: banner "APRESENTE UM DOCUMENTO COM FOTO DA CRIANÇA NA ENTRADA DO PARQUE PARA UTILIZAR O PASSAPORTE.", valor pago, tempo contratado, telefone, conferência por criança (nome, nascimento, idade, passaporte, "PNE", preço, alertas de acompanhante/sem acompanhante), acompanhantes adicionais e botão "Aprovar entrada / Check-in" (confirmação via `window.confirm`; grava `checkedInAt` e o usuário).
  - `checked_in`: horário de entrada, término previsto, contador de tempo decorrido (atualiza a cada 1 s; refetch a cada 30 s), tempo restante ou "Tempo excedente" em vermelho, botão "Check-out" com confirmação inline e, havendo excedente, bloco "cobrar à parte no caixa".
  - `checked_out`: resumo com entrada, saída, quem fez cada ação, tempo total, excedente ("Nada a cobrar" quando dentro do tempo).
- **Ingressos** (`/ingressos`, `GET /api/tickets/operate`): `AdminDataTable` com colunas Código, Responsável, Crianças, Valor, Status, Entrada, Tempo (cronômetro por linha em uso), Saída ("Saída prevista" quando em uso), Comprado em e ação "Validar"; busca "Buscar por nome, telefone, e-mail ou código..." e filtro de status; clique na linha abre o detalhe.
- APIs (`requireRole(["admin","operator"])`): `GET /api/tickets/operate` (`page`, `perPage` máx. 100, `search`, `status`, `sort`, `dir`), `GET /api/tickets/operate/[shortCode]` (404 "Compra não encontrada. Confira o código."), `POST …/check-in` (atômico, só de `paid`; 409 com mensagem por status), `POST …/check-out` (só de `checked_in`; grava `overtimeMinutes = max(0, round(decorrido) − contratado)`).

## Mudanças pendentes

### M2. Adotar o tema admin do shadcn (AdminCN) em toda a interface

- Não gostei do design atual nem de termos "reinventado a roda" no tema, nos componentes e nas funcionalidades do admin.
- Adaptar tudo ao tema: login, páginas, navbar, sidebar, inputs, CRUDs, listas e o restante, seguindo o que o template traz.
- Escopo: tudo o que exige login (`/admin/*`, `/operacao`, `/ingressos` e demais rotas logadas) e os respectivos logins.
- O tema tem prioridade sobre as cores da marca Divercity nas telas logadas.
- Decisões (2026-10-09):
  - CRUDs (Clientes, Preços e Serviços, Passaportes, Modelos de contrato) mantêm as páginas `/new` e `/[id]`, com formulários no layout do template.
  - O calendário de festas passa a usar o Calendar do template (visões mês, semana e dia), substituindo o calendário próprio.

## 3. Anexos e referências

- Template AdminCN (repositório): https://github.com/shadcnstudio/shadcn-nextjs-admincn-admin-template-free
- Template AdminCN (página/demo): https://shadcnstudio.com/templates/admin-dashboard/admincn-free

## 4. Pontos em aberto

Itens abaixo vieram do levantamento do código. São **possíveis bugs ou lacunas**, não comportamento esperado. Servem de insumo para a refatoração.

**Segurança**

- APIs `/api/admin/{customers,services,contract-templates,contract-variables,contracts,parties}` não checam sessão nem role. Isso inclui `GET /api/admin/contracts` (traz CPF dos clientes) e o PDF do DocuSign.
- APIs do CMS e as actions `revalidateCMS*` aceitam qualquer role autenticada (um `operator` consegue editar o CMS chamando a API).
- `updateSettings` (settings) não checa sessão nem role e não valida chaves. `settings/page.tsx` envia ao client os valores dos segredos (Stripe, Google, Instagram), guardados em texto puro.
- Webhook `/api/webhooks/docusign` sem validação de assinatura; `void`/`declined` cancelam o contrato mas não a festa.
- `[id]/contract/page.tsx` injeta `contract.body` e `fieldValues` via `dangerouslySetInnerHTML` sem sanitizar.
- `LoginForm` usa `callbackUrl` sem validar (possível redirecionamento externo).

**Casca e navegação**

- `SiteHeader`: `/admin` casa por prefixo com todas as rotas, então Clientes, Festas, Operação etc. mostram "Dashboard"; há dois `<h1>` em algumas telas.
- `nav-main`: o item "Ver site" (`/`) fica sempre ativo; itens usam `<a>` (recarrega a página).
- `nav-secondary.tsx` e três formulários de login/senha em `src/components/` (`login-form`, `esqueci-senha-form`, `redefinir-senha-form`) não são importados em lugar nenhum.
- Dashboard promete "controle o cache" mas não tem controle de cache; erro na contagem de festas aparece como "Em dia".
- `console.log("[DEBUG] …")` esquecido em `ForgotPasswordForm`.
- A query de pendentes da sidebar dispara antes da sessão carregar, inclusive para `operator`.
- Texto do erro de câmera diz "campo manual abaixo", mas o campo está acima.
- Cores `text-gray-*` fixas em Dashboard e Settings em vez de tokens do tema.
- Não há UI para criar usuários nem promover roles.

**Listagens e erros**

- `AdminDataTable`: sem estado de erro (401/403/500 viram "Nenhum item encontrado"), busca sem debounce, filtros não vão para a URL. Telas de detalhe da Operação tratam qualquer erro como "Compra não encontrada".
- `page`, `perPage`, `status`, `dir` não são validados nas APIs (valores inválidos geram 500).
- Erros Zod chegam como objeto; `parties/new` e `parties/[id]` passam esse objeto ao `toast.error`.
- DELETE de clientes, serviços e modelos não trata erro no front (toast de sucesso mesmo com falha); cliente ou modelo em uso gera 500 por FK; apagar o modelo padrão deixa a reserva pública sem modelo.
- DELETE de passaporte checa só crianças, não acompanhantes.
- Busca de cliente por CPF com pontuação não encontra (banco guarda só dígitos).

**CMS**

- `POST`/`DELETE` de `component-field-values` e `PUT` de `component-instance-field-values` não chamam `revalidateTag`; só o `PUT` de valor simples revalida.
- `SimpleFieldEditor` e `InstanceFieldEditor` não checam `res.ok` (mostram "Salvo com sucesso" mesmo com erro) e não ressincronizam após salvar (linhas novas podem duplicar).
- Campo `multiple` sem nenhuma instância não mostra input nem "Adicionar".
- Erro no GET do componente deixa o Sheet em branco, sem mensagem.
- `getContentType` faz `JSON.parse` sem `try/catch` e retorna `any`.
- A visão geral lista tipos não editáveis; a sidebar não.
- `PUT /api/admin/content-types/[id]` (renomear tipo) existe sem uso na UI.
- Não há upload de imagem (regra do projeto manda imagens no Supabase Storage).

**Festas e contratos**

- `PUT /api/admin/parties/[id]` reverte `status` para `pending` (default do schema) porque o formulário não envia `status`.
- Fuso: o form envia hora como UTC (`…Z`) mas lê em hora local; em UTC-3 a hora desloca 3 h a cada edição. Filtro de data da API usa UTC.
- Conflito de horário: `POST` e `PUT` usam regras diferentes; o checador do front vê só as 15 primeiras festas; duração padrão 4 h (admin) vs 3 h (público). Sem constraint no banco.
- Dropdown de modelos no `PartyForm` traz só os 15 primeiros; calendário usa as 100 primeiras festas, sem filtro de mês.
- `contract-variables` lista chaves camelCase (ex.: `festa_dateEnd`) e `buildDefaultValues` preenche snake_case (`festa_date_end`); confirmar no banco. Valores monetários saem sem formatação e `status` sem tradução.
- Trocar o modelo da festa não altera o corpo do contrato. Editar um modelo altera contratos `in_review` já enviados ao DocuSign.
- `mark-sent` e `toggle-link` não checam o status do contrato.
- `/admin/parties/contracts` não tem link de acesso; rótulos de status de contrato diferem entre telas.
- Rota de contratos do cliente exige e-mail, mas e-mail é opcional no cadastro e na reserva pública.
- `DELETE /api/admin/parties/[id]` existe sem uso na UI e falha por FK se houver contrato ou convidado.

**Operação**

- "Check-ins hoje" e "Check-outs hoje" usam o fuso do servidor; "No parque agora" conta compras, não pessoas.
- "Extra (minutos iniciados)" na tela usa `ceil` dos segundos e o servidor grava `round` dos minutos.
- Rótulo "Telefone / WhatsApp" mostra só `guardianPhone`.
- Check-in usa `window.confirm`; check-out usa card de confirmação.
- QR lido não tem validação de formato antes de navegar.
- Cada linha `checked_in` da lista cria um `setInterval` próprio.
- Datas: `formatDateOnly` em UTC, `formatTime` no fuso do navegador.

**Em andamento fora desta feature**

- O working tree tem mudanças não commitadas em `prisma/schema.prisma` (modelos `TicketPass`, `TicketPassKind`, `TicketPassStatus`) e nos fluxos de checkout e finalização de pagamento, ligadas a `docs/features/ticket-in-advance/`. A seção 2.11 foi levantada com os models `TicketOrder`/`TicketChild`/`TicketCompanion` e pode mudar quando essa feature for concluída; reconciliar com `/update-feature-spec`.
- Não verificado: tempo de expiração do access token (config do Supabase) e se as colunas reais do banco batem com os nomes de `contract-variables`.
