# CRUD de FAQs

## 1. O que é

CRUD de FAQs na aplicação, que lê e grava diretamente na Data Table `faqs` de um n8n self-hosted, usando a API pública do n8n.

O chatbot de WhatsApp roda no n8n e grava na Data Table `faqs` as dúvidas dos clientes que não soube responder. A dona do negócio usa esta aplicação para responder essas dúvidas e decidir quais aparecem publicamente.

Schema da tabela `faqs`:

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | number | padrão do n8n, somente leitura |
| `createdAt` / `updatedAt` | datetime | padrão do n8n, somente leitura |
| `question` | string | pergunta normalizada em pt-BR. **Somente leitura nesta app.** Nunca editar, nem na criação de linhas já existentes |
| `answer` | string | resposta da dona. Vazio, só espaços ou ausente significa "sem resposta". **Editável** |
| `published` | boolean | **Editável.** Controla se o item aparece publicamente |

## 2. Requisitos

Seguir o padrão do sistema: arquitetura, convenções, componentes de UI, camada de dados, tratamento de erros e estilo de código já usados no projeto. Não inventar arquitetura nova.

### 2.1 Operações

1. **Listar** as FAQs, com filtro por `published` e por "sem resposta" (`answer` vazio). Ordenar por `createdAt` decrescente e paginar. Query params de `GET /api/admin/faqs`: `page` (padrão 1), `perPage` (padrão 15, máximo 100), `published` (`true`/`false`) e `unanswered` (`true`).
2. **Editar** só `answer` e `published`. O campo `question` não pode ser enviado nem alterado em nenhuma camada: UI, validação e payload do PATCH.
3. **Adicionar** uma nova FAQ. `question` é informada na criação, e só na criação. Depois de criada, fica imutável. `answer` pode começar vazia e `published` começa `false`.
4. **Excluir** uma FAQ, com confirmação na UI (`confirm()` do navegador: "Remover esta FAQ?").

Telas do admin: `/admin/faqs` (lista), `/admin/faqs/new` (criar) e `/admin/faqs/[id]` (editar; a pergunta aparece só como texto, o switch "Publicada" só existe na edição e fica desabilitado enquanto não há resposta). Item "FAQs" no menu do admin. Rotas de API (`/api/admin/faqs` e `/api/admin/faqs/[id]`: GET/PATCH/DELETE) são restritas à role `admin`.

### 2.2 Regras de exibição

- O front público mostra só itens com `published = true` **e** `answer` preenchida. Essa regra é desta app, não do n8n.
- Na tela de administração, mostrar todos os itens e deixar claro o estado de cada um: sem resposta / respondida e não publicada / publicada (badges "Sem resposta", "Respondida, não publicada", "Publicada").
- A lista pública (`getPublishedFaqs`) é cacheada (`'use cache'`, tag `faqs`, `cacheLife('hours')`) e invalidada com `revalidateTag` em toda criação, edição e exclusão. Se a leitura falhar, a página `/faq` mostra a lista vazia (erro logado sem a key).
- Não permitir publicar um item com `answer` vazia.

### 2.3 Integração com o n8n (API pública)

- Base: `N8N_BASE_URL` + `/api/v1`. Autenticação: header `X-N8N-API-KEY: <N8N_API_KEY>`.
- A API key é segredo: fica **só no backend** (conforme o padrão do projeto), nunca no navegador nem no repositório.
- Adicionar `N8N_BASE_URL`, `N8N_API_KEY` e `N8N_FAQS_TABLE_ID` ao `.env.example` sem valores. Nunca sobrescrever valores existentes do `.env`.
- A key precisa dos escopos `dataTable:read`, `dataTable:list` e `dataTableRow:*`.
- O id da tabela é resolvido por `N8N_FAQS_TABLE_ID` e, se ausente, por busca do nome `faqs` em `GET /data-tables`, com cache em memória. Se não achar a tabela, falhar com erro claro ("Tabela faqs não encontrada no n8n").
- Não adivinhar os endpoints: confirmar na documentação atual do n8n (context7, ou a OpenAPI/Swagger da instância em `/api/v1/docs`) os caminhos exatos, o formato de filtro (`filter` com `type`/`filters`), a paginação (`cursor`/`limit`) e os verbos para listar, inserir, atualizar e apagar linhas de uma Data Table. Se algum endpoint não existir na versão da instância, parar e avisar o usuário em vez de contornar.
- Encapsular tudo em um único módulo/serviço de cliente n8n (ex.: `faqs` repository) consumido pelo resto da app. Nada de `fetch` ao n8n espalhado pelas telas.
- Atualização e exclusão sempre por `id` da linha. Se a atualização usar filtro, o filtro é por `id`, nunca por `question`.
- Tratar erros da API (401/403 chave inválida ou sem escopo, 404 tabela/linha inexistente, 5xx, timeout) com mensagens úteis para o usuário e logs sem vazar a key. Sem retry infinito. Timeout de 10 s por requisição. Status devolvido pela API da app: `N8N_*` não configurado → 500; timeout → 504; demais erros do n8n (401/403, 404, 5xx, rede, resposta inválida) → 502; erro inesperado → 500 "Erro interno".

### 2.4 Validação

Validar no servidor, mesmo que a UI também valide.

- `answer`: string, trim, máximo de 2000 caracteres.
- `published`: boolean.
- `question` (só na criação): string não vazia, trim, máximo de 500 caracteres.
- Os schemas são `strict`: qualquer campo extra (inclusive `question` no PATCH) é recusado com 400.

### 2.5 Restrições

- Não adicionar dependências sem necessidade. Se precisar de alguma, listar e justificar antes de instalar.
- Não criar testes a menos que o padrão do projeto os exija. Rodar os checks que já existem (lint, typecheck, build).
- Não fazer commit, push nem comando git que altere estado, a menos que o usuário peça.
- Textos de interface seguem o idioma e o padrão do restante da app.
- Implementar só o que está descrito. Ideias extras são anotadas e reportadas no final.
- Se algo no padrão do sistema conflitar com este pedido, avisar o usuário antes de decidir sozinho.

### 2.6 Entrega

Ao terminar, informar: arquivos criados e alterados, variáveis de ambiente novas, escopos que a API key do n8n precisa e como testar manualmente.

### 2.7 Decisões (planejamento)

- **Credenciais do n8n em env vars** (`N8N_BASE_URL`, `N8N_API_KEY`, `N8N_FAQS_TABLE_ID`), como descrito em 2.3, e não na tabela `settings` usada por Stripe/Instagram/Google. Decisão consciente do usuário, apesar do padrão das outras integrações.
- **Listagem do admin: buscar tudo e paginar no servidor.** A rota busca todas as linhas da tabela `faqs` no n8n (lotes de 250 linhas, seguindo `nextCursor`, com teto de 20 lotes = 5000 linhas; ao atingir o teto, loga aviso e exibe as mais recentes), ordena por `createdAt` desc, aplica os filtros (`published` e "sem resposta", incluindo `answer` só com espaços) e pagina em memória, devolvendo o formato `{ data, pagination: { page, perPage, total, totalPages } }` já usado pelo `DataTable` do admin.
- **Front público: página própria `/faq`**, listando só as FAQs com `published = true` e `answer` preenchida.
- **Apagar a resposta de item publicado: bloqueia o salvamento.** Se o resultado final tiver `published = true` e `answer` vazia, a validação recusa ("para apagar a resposta, despublique antes"). Vale na UI e no servidor.

### 2.8 Section de FAQs na home

- A home (`/`) mostra, entre a Galeria e os Depoimentos, uma section com collapses das FAQs publicadas, pela mesma regra de 2.2 (`published = true` **e** `answer` preenchida). As FAQs vêm do n8n (`getPublishedFaqs`, com o mesmo cache e a mesma invalidação por tag `faqs`); os textos vêm do CMS.
- A section só aparece se houver pelo menos 1 FAQ; sem FAQ, ou se a leitura do n8n falhar, nada é renderizado (erro logado só com o nome do erro). Carrega dentro de `<Suspense>` sem fallback visível.
- Mostra as 6 FAQs publicadas mais recentes, no mesmo componente de collapses da `/faq` (`FaqAccordion`). Quando houver mais de 6 **e** `ctaLabel` preenchido, exibe abaixo da lista um link-botão para `/faq` (largura total abaixo de `sm`).
- O ContentType `FaqSection` tem o componente `Section` com os campos simples `badge`, `title`, `subtitle` e `ctaLabel`, editáveis em `/admin/cms`. Campo vazio não é renderizado; com `badge`, `title` e `subtitle` vazios, o cabeçalho inteiro some.
- Valores iniciais (seed e migration): badge "Dúvidas", título "Perguntas frequentes", subtítulo "Tire suas dúvidas antes de visitar o Divercity Park.", `ctaLabel` "Ver todas as perguntas". A migration só preenche campos que ainda não têm valor, então não sobrescreve edições do CMS.
- Criação no banco: bloco `FaqSection` em `prisma/seed.ts` (dev) e migration só de dados, idempotente, em `prisma/migrations/20261019120000_cms_faq_section/migration.sql`. Rodar o seed completo em produção sobrescreve as edições do CMS.

## 3. Anexos e referências

- API pública do n8n (Data Tables), confirmada no código-fonte do n8n (branch master): `packages/cli/src/public-api/v1/controllers/data-tables.public.controller.ts` e `packages/cli/src/public-api/v1/handlers/data-tables/spec/paths/*.yml`.

## 4. Pontos em aberto

- Section de FAQs na home: a dona deve revisar os textos iniciais de `FaqSection` em `/admin/cms`.
- Estados de vazio, loading e erro: hoje a listagem usa os estados padrão do `DataTable`; a edição mostra `Skeleton` e, no erro, o título com a mensagem e "Volte para a lista de FAQs e tente novamente."; a página pública mostra um skeleton de 4 blocos e, sem itens, "Nenhuma pergunta publicada ainda.". Falta o usuário validar esses textos.
- Comportamento no mobile da tela de administração: usa o responsivo padrão do `DataTable`/formulários (rodapé do formulário empilha abaixo de `sm`); não verificado visualmente.
- Aviso na criação quando já existe uma FAQ com a mesma `question`: não há checagem de duplicidade.
- Texto de título/descrição da página `/faq`: título "Perguntas frequentes" fixo no código (metadata e `h1`), sem descrição própria.
- Link para `/faq` no site: só existe o botão da section da home (aparece com mais de 6 FAQs e `ctaLabel` preenchido); não há link no Navbar, no Footer nem em `sitemap.ts`.
- Versão do n8n da instância: os endpoints foram confirmados no master do n8n; falta confirmar em `/api/v1/docs` da instância (não verificável pelo código).
- Confirmação de exclusão usa `confirm()` do navegador, enquanto o kit do admin tem `Dialog`; decidir se vale trocar.
