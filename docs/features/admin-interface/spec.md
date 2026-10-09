# Admin Interface

## 1. O que é

Interface administrativa do sistema Divercity Park, em `/admin`. Este corpo descreve o **estado atual** (levantado do código). A refatoração planejada entra somente em `## 3. Anexos e referências

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

- `DataTable`: sem estado de erro (401/403/500 viram "Nenhum item encontrado"), busca sem debounce, filtros não vão para a URL. Telas de detalhe da Operação tratam qualquer erro como "Compra não encontrada".
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
