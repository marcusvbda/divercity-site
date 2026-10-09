# Plano — Admin Interface

Spec: `docs/features/admin-interface/spec.md` (alvo: `## Mudanças pendentes` M1 e M2, com as decisões de 2026-10-09).

## Diagnóstico (spec × código em 2026-10-09)

| Estado | Qtde | Itens |
|---|---|---|
| Implementado e alinhado | 0 | — |
| Parcial | 2 | M1 cobertura de rotas (matcher `/admin/:path*` já cobre `/admin/operacao/*`); M2 "somente light / tema acima da marca" (tokens neutros já iguais aos do template, mas há `brand-*`/`gray-*`/Fredoka em 7 arquivos do admin) |
| Divergente | 1 | M1 sessão expirada: `src/proxy.ts` aceita token com `error` (`authorized: !!token`) e `src/app/admin/layout.tsx` monta toda a casca quando `session.error` existe; o logout só ocorre no client (`SessionGuard`, `useEffect`) após hidratar — é o flash |
| Ausente | 8 | M2: kit de componentes AdminCN, casca (sidebar/header/footer/perfil), login e senha, listagens, CRUDs, Festas + Calendar, CMS, Configurações, Operação, Dashboard |
| Não verificável | 1 | M1 "deslogado sem cookie": pelo código o proxy já redireciona; confirmar rodando (Fase 1) |

Sem impacto no banco, sem migration, sem dados de negócio faltando, sem `contract.md` (nenhuma fase cria/altera endpoint).

## Referência do template

- Repositório: `https://github.com/shadcnstudio/shadcn-nextjs-admincn-admin-template-free`, commit `dd1afd2f3a794ea9e746197de314f81d43670ea1`.
- Quem executa clona no próprio scratchpad (nunca dentro do projeto): `git clone https://github.com/shadcnstudio/shadcn-nextjs-admincn-admin-template-free <scratchpad>/admincn && git -C <scratchpad>/admincn checkout dd1afd2f3a794ea9e746197de314f81d43670ea1`.
- Estilo shadcn do template: `base-vega` sobre `@base-ui/react` — mesmos primitivos e mesma API (`render` prop) do nosso `base-nova`; muda só o visual (input/botão `h-9`, `rounded-md`, `shadow-xs`, card com `--card-spacing` 6).
- Arquivos de referência: `src/components/ui/*` (kit), `src/components/layout/{Sidebar,Header,Footer}.tsx`, `src/components/shared/{ProfileDropdown,Logo}.tsx`, `src/configs/navConfig.tsx`, `src/app/(pages)/layout.tsx`, `src/app/(blank)/layout.tsx`, `src/views/pages/auth/**` (login, forgot/reset password), `src/views/apps/users/list/**` (listagem), `src/views/forms/form-layouts/vertical/**` (formulários), `src/views/pages/user-settings/**` (abas de configurações), `src/views/apps/calendar/**` + `src/utils/calendar-utils.ts` + `src/types/apps/calendar-types.ts` + `src/hooks/use-event-visibility.ts` + `src/hooks/use-current-time-indicator.ts` + `src/assets/data/constants.ts` (calendário), `src/views/dashboards/statistics/statistics-card-01.tsx` (cards de estatística), `src/assets/svg/auth-background-shape.tsx`, `src/app/globals.css`.

## Regras de adaptação (valem para todas as fases de M2)

1. **Isolamento (decisão do spec):** tudo do template vai para `src/components/admin/` — kit em `src/components/admin/ui/`, casca em `src/components/admin/layout/`, calendário em `src/components/admin/calendar/`. Imports internos do template `@/components/ui/x` viram `@/components/admin/ui/x`. **Não alterar** `src/components/ui/*` usados pelo site público (`button`, `input`, `label`, `checkbox`, `contract-preview`) nem `components.json`.
2. **Sem customização estética:** classes dos componentes como o template entrega. Telas logadas não usam `brand-*`, `text-gray-*`/`bg-gray-*`, `font-heading` (Fredoka) nem `framer-motion`. Cores de status usam tokens/variants do template (`Badge` variants, `text-destructive`, `bg-primary/10` etc.).
3. **Só light:** não trazer `ThemeProvider`, `ModeToggle`, `next-themes` nem regras `.dark`. O `Toaster` do template (`ui/sonner.tsx`) usa `useTheme` → trocar por `theme='light'` fixo.
4. **Regras do projeto vencem o código do template:** remover `useMemo`/`useCallback`/`memo` (React Compiler); nada de `useEffect` + `fetch` (usar React Query); sem comentários explicando código; `shrink-0`, `bg-linear-to-*`; ícones só de `lucide-react` (confirmar que existem na versão instalada).
5. **Remover do template o que é demo/externo:** links "Pro", GitHub star, LanguageDropdown, Download/ScrollToTop, fake-db, nav-apps API, register/magic link/login social/quick login/"Remember me", "My Account"/"Settings" do perfil.
6. **Textos em pt-BR**, mantendo todas as mensagens, toasts, validações, rotas e regras atuais descritas nas seções 2.x do spec. Nenhum comportamento muda além do visual e da navegação decididos.
7. **Identidade:** onde o template mostra `LogoSvg` + "AdminCN", usar o logo do CMS (`getContentType('NavBar').Logo.url.value`) com fallback para o texto "Divercity Park".

---

- [x] Fase 1 — M1: área logada não renderiza sem sessão válida

**Camadas / agente:** API/auth + rotas (`backend`); ajuste de páginas de login (`frontend` se necessário).
**Requisito:** M1 (todas as rotas logadas; deslogado ou sessão expirada vai direto ao login sem layout, navegação ou conteúdo).
**Origem:** M1 — "Deslogado ou com sessão expirada: o usuário vai direto para o login, sem mostrar nada da área logada (nem layout, nem navegação, nem conteúdo de página)."

**Gap atual → desejado:**
- `src/proxy.ts`: `authorized` retorna `!!token` (aceita token com `error` e com access token do Supabase expirado); o redirect "login já autenticado → /admin" usa só o cookie. `withAuth` apenas decodifica o JWT do NextAuth (não roda o callback `jwt`), então o access token do Supabase (~1 h) pode estar expirado dentro de um JWT NextAuth válido (30 dias).
- `src/app/admin/layout.tsx`: só testa `!session`; com `session.error` monta `SidebarProvider`, `AppSidebar`, `SiteHeader` e a página, e o `SessionGuard` faz `signOut` depois de hidratar.
- Desejado: (a) o proxy considera autenticado só `token && !token.error && exp(supabaseAccessToken) > agora`; sem isso, rotas protegidas redirecionam a `/admin/login?callbackUrl=…` antes de qualquer render; (b) o layout da área logada faz `redirect('/admin/login')` no servidor quando `!session || session.error` (cobre token revogado, que só o `getUser` do callback `jwt` detecta); (c) o redirect "já autenticado" sai do proxy e vai para a página de login no servidor (via `getServerSession`), evitando loop login ↔ painel quando o cookie parece válido mas o Supabase recusa.

**Implementação (premissas):**
- Separar layouts com route groups (URLs não mudam): mover `src/app/admin/login/**` para `src/app/admin/(auth)/login/**` e todas as demais rotas/arquivos de `src/app/admin/` (dashboard `page.tsx`, `DashboardContent.tsx`, `actions.ts`, `SessionGuard.tsx`, `cms/`, `contract-templates/`, `customers/`, `operacao/`, `parties/`, `passport-types/`, `services/`, `settings/`) para `src/app/admin/(panel)/`. Usar `git mv`; corrigir imports relativos quebrados (ex.: `contract-templates/layout.tsx` importa `../parties/PartiesSidebar`).
- `src/app/admin/(auth)/layout.tsx`: `NextAuthProvider` com `session={null}` + children (sem casca).
- `src/app/admin/(panel)/layout.tsx`: conteúdo atual do `admin/layout.tsx`, trocando o ramo `if (!session) return children` por `if (!session || session.error) redirect('/admin/login')`. `src/app/admin/layout.tsx` deixa de existir (ou fica só como passthrough, se o Next exigir).
- `src/app/admin/(auth)/login/page.tsx`: no servidor, `await connection()`, `getServerSession(authOptions)`; se houver sessão sem `error`, `redirect` para `/admin/operacao` (`operator`) ou `/admin` (`admin`). Remover esse redirect do proxy.
- `src/proxy.ts`: função `isSessionValid(token)` que exige `!token.error` e decodifica o payload (base64url) de `token.supabaseAccessToken` para ler `exp` (sem verificar assinatura — o JWT do NextAuth já é assinado/criptografado); token sem `supabaseAccessToken` ou ilegível = inválido. `authorized` usa `isSessionValid` para rotas fora de `/admin/login*`. A regra do `operator` (`OPERATOR_ALLOWED_PREFIXES`) continua igual.
- `SessionGuard` permanece no layout do painel (expiração com a página já aberta).
- Ler antes `node_modules/next/dist/docs/` sobre `proxy.ts`, route groups e `redirect` em layouts com `cacheComponents`.

**Arquivos:** `src/proxy.ts`, `src/app/admin/layout.tsx` (remover/mover), `src/app/admin/(auth)/layout.tsx` (novo), `src/app/admin/(auth)/login/**` (movido), `src/app/admin/(panel)/layout.tsx` (novo, a partir do atual), `src/app/admin/(panel)/**` (movidos), `src/types/next-auth.d.ts` (só se precisar tipar algo novo).
**Migration:** não.
**Contrato:** não.

**Critério de pronto:**
- Sem cookie: `/admin`, `/admin/customers`, `/admin/operacao/ingressos` → 307 para `/admin/login` sem HTML da casca.
- Cookie com access token do Supabase expirado ou `error`: mesmo resultado, sem flash e sem loop.
- Logado válido: `/admin/login` redireciona para `/admin` (admin) ou `/admin/operacao` (operator); operator em `/admin/customers` → `/admin/operacao`.
- Todas as URLs do admin continuam as mesmas.

**Como verificar:** `npx tsc --noEmit`; `npx eslint src/proxy.ts "src/app/admin/**/*.tsx"`; `npm run dev` (porta 3002): aba anônima em `/admin/customers` (sem flash, direto ao login); `curl -sI http://localhost:3002/admin` sem cookie → `307` com `location` em `/admin/login`; sessão expirada: logar, depois revogar a sessão do usuário no Supabase (Authentication → Users → sign out/delete sessions) ou aguardar a expiração do access token, recarregar `/admin/parties` → login direto sem casca; logar de novo funciona sem loop.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/proxy.ts` (`isSessionValid`; redirect "já autenticado" removido)
- `src/app/admin/(auth)/layout.tsx` (novo)
- `src/app/admin/(auth)/login/**` (movido de `src/app/admin/login/**`; `page.tsx` com `getServerSession` + redirect por role)
- `src/app/admin/(panel)/layout.tsx` (de `src/app/admin/layout.tsx`; `redirect` quando `!session || session.error`)
- `src/app/admin/(panel)/**` (movidos via `git mv`: `page.tsx`, `DashboardContent.tsx`, `actions.ts`, `SessionGuard.tsx`, `cms/`, `contract-templates/`, `customers/`, `operacao/`, `parties/`, `passport-types/`, `services/`, `settings/`)

Ações do usuário: verificar em runtime (`npm run dev`, porta 3002) os critérios de pronto — `curl -sI http://localhost:3002/admin` sem cookie → 307 para `/admin/login`; sessão expirada sem flash; operator em `/admin/customers` → `/admin/operacao`. Não rodado nesta execução. `.next/types` pode acusar erros de `tsc` até o próximo `next dev`/`build`.

---

- [x] Fase 2 — Fundação do tema AdminCN (kit isolado + CSS + fonte)

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 — instalar e usar o template; sem customização estética; só light; tema acima das cores da marca. Decisão "kit isolado".
**Origem:** M2 — "Instalar e usar o template admin do shadcn…", "Usar o tema sem customização estética…", "Somente tema light; sem dark mode." + decisão "Kit isolado…".

**Gap atual → desejado:** não existe nada do template no projeto; as telas logadas herdam Poppins/Fredoka do root layout e os componentes `base-nova` compartilhados → kit `base-vega` do template disponível em `src/components/admin/ui/`, com fonte e tokens do template aplicados só à área logada (inclusive em portais: Sheet, Dropdown, Select, Toaster renderizam no `<body>`).

**Implementação (premissas):**
- Copiar do template (commit fixado, ver "Referência do template") para `src/components/admin/ui/`: `alert, avatar, badge, breadcrumb, button, button-group, card, checkbox, collapsible, combobox, command, dialog, dropdown-menu, field, input, input-group, label, pagination, popover, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip`. Reescrever imports `@/components/ui/*` → `@/components/admin/ui/*`. O `sidebar` do template importa `@/hooks/use-mobile`, que difere do nosso: copiar a versão do template como `src/components/admin/hooks/use-mobile.ts` e apontar para ela. `sonner`: `theme='light'` fixo, sem `next-themes`.
- Dependências: `npm i cmdk` (exigida por `command`/`combobox`, se for o caso; conferir os imports de cada arquivo copiado e instalar só o necessário). `date-fns` fica para a Fase 7.
- Fonte: `Geist` via `next/font/google` (variável `--font-geist-sans`), carregada no layout do painel e no layout de auth (`src/app/admin/(panel)/layout.tsx` e `src/app/admin/(auth)/layout.tsx`), que renderizam um wrapper `<div data-admin-theme className={geist.variable}>`.
- CSS: novo `src/app/admin/admin-theme.css`, importado nos dois layouts acima, sem `@import 'tailwindcss'`. Escopo `body:has([data-admin-theme])` (cobre os portais) com: família da Geist no `body`; `h1–h4` com `font-family: inherit` (anula a regra Fredoka do `globals.css`); os `--chart-1..5` do template; as regras de `cursor: pointer` e os helpers `.input-default/.input-lg/.input-sm/.input-size-lg` do `globals.css` do template; a keyframe `heartbeat` só se algum componente copiado usar. Os demais tokens (`--background`, `--primary`, `--radius`, `--sidebar-*`) já são idênticos aos do template — não duplicar.
- A classe de variável do `next/font` no wrapper não alcança os portais (eles ficam no `<body>`, fora do wrapper). Premissa: o layout injeta a família gerada pelo `next/font` no seletor escopado, ex.: `<style>{`body:has([data-admin-theme]){font-family:${geist.style.fontFamily}}`}</style>` no server component. Não alterar o root layout (`src/app/layout.tsx`).
- Nada é usado ainda pelas telas nesta fase (só fundação).

**Arquivos:** `src/components/admin/ui/*` (novos), `src/components/admin/hooks/use-mobile.ts` (novo), `src/app/admin/admin-theme.css` (novo), `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(auth)/layout.tsx`, `package.json`/`package-lock.json`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** kit compila; páginas logadas e de login renderizam em Geist (inclusive menus/toasts em portal); site público (`/`, `/orcamento`, `/compra-antecipada`, `/c/<token>`) sem nenhuma mudança visual; nenhum arquivo de `src/components/ui/` alterado (`git diff --stat src/components/ui` vazio).
**Como verificar:** `npx tsc --noEmit`; `npx eslint src/components/admin src/app/admin`; `npm run dev`: abrir `/admin` e `/` e comparar fontes; abrir um dropdown no admin e conferir a fonte no DevTools.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/components/admin/ui/*.tsx` (33 componentes novos), `src/components/admin/hooks/use-mobile.ts` (novo)
- `src/app/admin/admin-font.ts`, `src/app/admin/admin-theme.css` (novos)
- `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(auth)/layout.tsx` (wrapper `data-admin-theme` + fonte)
- `package.json`, `package-lock.json`, `yarn.lock` (`cmdk`)

Ações do usuário: conferir no navegador (logado) a fonte Geist em `/admin` e em menus/toasts em portal; `yarn.lock` foi atualizado junto com `package-lock.json` (ambos versionados).

---

- [x] Fase 3 — Casca do painel: Sidebar com submenus, Header com breadcrumb, Footer e perfil

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 — navbar, sidebar; decisão "submenus colapsáveis na sidebar principal". Preservar a seção 2.1 (menus por role, badge de festas pendentes, Ver site em nova aba, Sair).
**Origem:** M2 — "Adaptar tudo ao tema: login, páginas, navbar, sidebar…" + decisão "As sub-sidebars … são substituídas por submenus colapsáveis na sidebar principal…".

**Gap atual → desejado:** casca própria (`src/components/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `site-header.tsx`) com sub-sidebars por área (`AdminSubSidebar` em `operacao/`, `cms/`, `parties/`, `contract-templates/`, `settings/`) → casca do template: `Sidebar` (`collapsible='icon'`, grupos, itens colapsáveis, flyout no modo ícone), `Header` (SidebarTrigger + Separator + Breadcrumb + ProfileDropdown), `Footer`, `main` com `max-w-360 px-4 py-6 sm:px-6`, como em `src/app/(pages)/layout.tsx` do template.

**Implementação (premissas):**
- `src/components/admin/layout/nav-config.ts`: tipos `MenuItem`/`NavItem` do template e a configuração por role, mantendo ordem e destinos atuais:
  - `admin`: Ver site (`/`, `target='_blank'`, ícone de link externo) · Dashboard (`/admin`) · CMS (filhos: Visão geral `/admin/cms` + um filho por tipo editável `/admin/cms/component-types/<id>`, vindos de `GET /api/admin/content-types?limit=100&sort=name&editable=true` via `useQuery` `['admin','content-types','sidebar']`) · Clientes (`/admin/customers`) · Salão de Festas (filhos: Agenda `/admin/parties`, Modelos de contrato `/admin/contract-templates`; badge com nº de pendentes) · Preços e Serviços (`/admin/services`) · Passaportes (`/admin/passport-types`) · Operação (filhos: Visão geral `/admin/operacao`, Validar ticket `/admin/operacao/validar`, Ingressos `/admin/operacao/ingressos`) · Configurações (filho: Integrações `/admin/settings`).
  - `operator`: Ver site · Operação (mesmos filhos).
  - Item ativo usa `activePath` (prefixo) para que `/admin/customers/12` marque Clientes e `/admin/operacao/validar/ABC123` marque Validar; Dashboard e Visões gerais usam match exato; "Ver site" nunca fica ativo.
- `src/components/admin/layout/Sidebar.tsx`: adaptação de `Sidebar.tsx` do template (sem nav-apps, sem `useMemo`/`useCallback`, `Link` do Next). Cabeçalho com logo do CMS (prop `logoUrl`) ou "Divercity Park". Badge de pendentes: `useQuery` `['admin','parties','pending-count']` em `GET /api/admin/parties?status=pending&perPage=1`, `enabled` só quando a sessão carregou e a role é `admin`; badge no estilo do template (`SidebarMenuBadge`), sem cor destrutiva própria.
- `src/components/admin/layout/Header.tsx`: breadcrumb pt-BR a partir do pathname com mapa de rótulos (`admin`→"Dashboard", `cms`→"CMS", `component-types`→"Tipos de conteúdo", `customers`→"Clientes", `services`→"Preços e Serviços", `passport-types`→"Passaportes", `contract-templates`→"Modelos de contrato", `parties`→"Salão de Festas", `contracts`→"Contratos", `contract`→"Contrato", `operacao`→"Operação", `validar`→"Validar", `ingressos`→"Ingressos", `settings`→"Configurações", `new`→"Novo"); segmento dinâmico (id/código) mostra o próprio valor; itens intermediários são `Link`. Sem ModeToggle, idioma ou GitHub. Remove o `<h1>` do header (o título fica na página — resolve os dois `<h1>`).
- `src/components/admin/layout/ProfileDropdown.tsx`: avatar com iniciais, nome e e-mail da sessão (`useSession`), um único item "Sair" (`signOut({ callbackUrl: '/admin/login' })`).
- `src/components/admin/layout/Footer.tsx`: `©<ano> Divercity Park`, sem links externos.
- `src/app/admin/(panel)/layout.tsx`: `NextAuthProvider` + `SessionGuard` + `SidebarProvider` (do kit admin) + `TooltipProvider` + `Sidebar` + `SidebarInset` (`Header`, `main`, `Toaster` do kit admin, `Footer`). Remover o `Toaster` de `sonner` direto e o `style` com `--sidebar-width`.
- Remover os layouts de sub-sidebar e os componentes: `src/app/admin/(panel)/{operacao,cms,parties,contract-templates,settings}/layout.tsx` (ou reduzir a passthrough se ainda forem necessários), `OperacaoSidebar.tsx`, `CMSSidebar.tsx`, `PartiesSidebar.tsx`, `SettingsSidebar.tsx`; `src/components/app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `site-header.tsx`. (O rótulo "Nome · dd/mm" da festa na sub-sidebar de Festas deixa de existir; o breadcrumb mostra o id e o cabeçalho da página mostra o cliente e a data.)
- As páginas ainda usam componentes antigos nesta fase; só a casca muda.

**Arquivos:** `src/components/admin/layout/{nav-config.ts,Sidebar.tsx,Header.tsx,Footer.tsx,ProfileDropdown.tsx}` (novos), `src/app/admin/(panel)/layout.tsx`, layouts e `*Sidebar.tsx` citados (remover), `src/components/{app-sidebar,nav-main,nav-user,site-header}.tsx` (remover).
**Migration:** não. **Contrato:** não.

**Critério de pronto:** casca do template em todas as telas do painel; menus por role iguais aos da seção 2.1 (com submenus); navegação por `Link` sem reload; item ativo correto em listas, detalhes e `/new`; badge de pendentes só para admin; sidebar colapsa para ícones no desktop e vira Sheet no mobile; operator vê só Ver site e Operação.
**Como verificar:** `npx tsc --noEmit`; `npx eslint src/components/admin "src/app/admin/(panel)"`; `npm run dev`: navegar por todas as entradas do menu como admin e como operator; conferir breadcrumb em `/admin/parties/<id>`, `/admin/cms/component-types/<id>`, `/admin/operacao/validar/<código>`; viewport 375px.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- Novos: `src/components/admin/layout/{nav-config.ts,Sidebar.tsx,Header.tsx,Footer.tsx,ProfileDropdown.tsx}`
- Alterado: `src/app/admin/(panel)/layout.tsx` (casca do template)
- Removidos: `src/app/admin/(panel)/{operacao,cms,parties,contract-templates,settings}/layout.tsx`, `operacao/OperacaoSidebar.tsx`, `cms/CMSSidebar.tsx`, `parties/PartiesSidebar.tsx`, `settings/SettingsSidebar.tsx`, `src/components/{app-sidebar,nav-main,nav-user,site-header}.tsx`
- Órfãos mantidos (limpeza na Fase 12): `src/components/ui/admin-sub-sidebar.tsx`, `src/components/nav-skeleton.tsx`, `src/components/nav-secondary.tsx`

Ações do usuário: validar no `npm run dev` (admin e operator) menus, submenus, item ativo, badge de pendentes, colapso para ícones, Sheet em 375px e breadcrumb em `/admin/parties/<id>`, `/admin/cms/component-types/<id>`, `/admin/operacao/validar/<código>`. As páginas ainda usam componentes antigos até as Fases 5–11 (pode haver espaçamento duplicado).

---

- [x] Fase 4 — Login, esqueci senha e redefinir senha no layout do template

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 — "login" e "os respectivos logins"; preservar a seção 2.2 (campos, mensagens, fluxo PKCE, regras de senha, link "Esqueci minha senha").
**Origem:** M2 — "Adaptar tudo ao tema: login, …" e "Escopo: … e os respectivos logins."

**Gap atual → desejado:** `src/app/admin/(auth)/login/{LoginForm.tsx, esqueci-senha/ForgotPasswordForm.tsx, esqueci-senha/page.tsx, redefinir-senha/ResetPasswordForm.tsx, redefinir-senha/page.tsx, page.tsx}` com visual próprio (há `brand-*` em `esqueci-senha/page.tsx`) → layout de `src/views/pages/auth/{login,forgot-password,reset-password}` do template: tela centralizada, `AuthBackgroundShape` (copiar para `src/components/admin/auth-background-shape.tsx`), `Card` `sm:max-w-lg` com logo (Regra 7), `CardTitle`/`CardDescription`, `Field`/`FieldGroup`/`FieldLabel`, senha com `InputGroup` + botão mostrar/ocultar.

**Implementação (premissas):**
- Login: título "Entrar" e descrição curta neutra (ex.: "Acesse o painel do Divercity Park"); campos e-mail e senha; erro "E-mail ou senha inválidos"; botão "Entrar"; link "Esqueci minha senha" no lugar de "Forgot Password?". Sem magic link, login rápido, cadastro, Google ou "Remember me". Mantém `signIn('credentials', …)` e o `callbackUrl` (padrão `/admin`) como hoje.
- Esqueci senha e redefinir senha: mesma lógica e textos atuais (seção 2.2, incluindo os quatro estados do redefinir e o redirecionamento após 3 s), no card do template; link "Voltar ao login". Remover o `console.log("[DEBUG] …")` do `ForgotPasswordForm` ao reescrever.
- `src/components/{login-form,esqueci-senha-form,redefinir-senha-form}.tsx` não são importados (código sem respaldo no spec): não remover nesta fase, só sinalizar.

**Arquivos:** `src/app/admin/(auth)/login/**`, `src/components/admin/auth-background-shape.tsx` (novo).
**Migration:** não. **Contrato:** não.

**Critério de pronto:** as três telas no layout do template, só com componentes do kit admin; sem `brand-*`/`gray-*`; fluxos de login, envio de link e redefinição funcionando como antes.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(auth)"`; `npm run dev`: login com senha errada (mensagem) e certa (redirect por role); `/admin/login/esqueci-senha` envia o e-mail; abrir o link recebido em `/admin/login/redefinir-senha?code=…` e trocar a senha; link inválido mostra "Solicitar novo link"; viewport 375px.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/app/admin/(auth)/login/{page.tsx,LoginForm.tsx}`, `esqueci-senha/{page.tsx,ForgotPasswordForm.tsx}`, `redefinir-senha/{page.tsx,ResetPasswordForm.tsx}`
- Novos: `src/components/admin/{auth-background-shape,auth-card,auth-password-input}.tsx`
- Sem uso (sinalizados, não removidos): `src/components/{login-form,esqueci-senha-form,redefinir-senha-form}.tsx`

Ações do usuário: testar no `npm run dev` login (senha errada/certa, `callbackUrl`), envio do e-mail de recuperação, link `?code=` (troca de senha + redirect em 3 s), link inválido e 375px; confirmar com `npm run build` que as páginas com `await getContentType` passam o prerender. Cadastrar `NavBar.Logo.url` no CMS se quiser logo em vez do texto.

---

- [x] Fase 5 — Listagens: DataTable no padrão do template

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 — "CRUDs, listas"; preservar os comportamentos de listagem da seção 2.1 (busca, filtros `search`/`select`/`date` com valor inicial lido da URL, ordenação asc/desc, paginação com padrão 15 e opções 10/15/25/50, "Mostrando X–Y de N", loading com Skeleton, vazio "Nenhum item encontrado", clique na linha, ações por linha).
**Origem:** M2 — "Adaptar tudo ao tema: … CRUDs, listas e o restante…".

**Gap atual → desejado:** `src/components/ui/admin-data-table.tsx` (visual próprio, com `SortableTableHead`) usado em `customers/page.tsx`, `services/page.tsx`, `passport-types/page.tsx`, `contract-templates/page.tsx`, `parties/page.tsx` (modo lista) → `src/components/admin/data-table.tsx` com a composição de `src/views/apps/users/list/` do template: `Card` `py-0`, faixa de filtros, toolbar (busca com `InputGroup` + ícone, `Select` de linhas por página), `Table` com cabeçalho `h-14` e chevrons de ordenação, rodapé com "Mostrando X–Y de N" + `Pagination` do kit.

**Implementação (premissas):**
- Mesma API pública do componente atual (`queryKey`, `endpoint`, `columns: Column<T>[]`, `filters: FilterConfig[]`, `actions`, `onRowClick`, `defaultPerPage`) e mesmo consumo do contrato `{ data, pagination: { page, perPage, total, totalPages } }` via `useQuery` — as telas só trocam o import. Opções de linhas por página continuam 10/15/25/50 (padrão 15): é comportamento, não estética.
- Comportamentos que hoje faltam (debounce, filtros na URL, estado de erro) **não** entram (pontos em aberto, fora do alvo).
- As cinco páginas: trocar o import, e o cabeçalho da página (título + botão "Novo …") no padrão do template (título `text-2xl font-semibold`, botão `Button` do kit com `PlusIcon`). Badges das colunas (key do serviço, "Inativo", "Padrão", status de festa e contrato, variáveis) usam o `Badge` do kit com variants (`secondary`, `outline`, `destructive`), sem cores próprias. A exclusão continua com o mesmo `confirm(...)` e os mesmos toasts.
- `src/app/admin/(panel)/parties/contracts/page.tsx` (tabela própria, sem paginação): migrar para `Card` + `Table` do kit, mantendo colunas e botões.
- Remover `src/components/ui/admin-data-table.tsx` e `src/components/ui/sortable-table-head.tsx` se não tiverem mais uso (`grep`).

**Arquivos:** `src/components/admin/data-table.tsx` (novo), `src/app/admin/(panel)/{customers,services,passport-types,contract-templates,parties}/page.tsx`, `src/app/admin/(panel)/parties/contracts/page.tsx`, `src/components/ui/{admin-data-table,sortable-table-head}.tsx` (remover se sem uso).
**Migration:** não. **Contrato:** não.

**Critério de pronto:** as seis listagens no visual do template, com busca, filtros, ordenação, paginação, loading e vazio funcionando como antes; abrir `/admin/parties?status=pending` aplica o filtro inicial.
**Como verificar:** `npx tsc --noEmit`; `npx eslint src/components/admin "src/app/admin/(panel)"`; `npm run dev`: em cada lista, buscar, ordenar duas vezes, trocar para 25 por página, avançar página, abrir o item; `/admin/parties?status=pending`; viewport 375px (tabela rola na horizontal).
**Ações do usuário:** nenhuma.

Arquivos alterados:

- Novo: `src/components/admin/data-table.tsx`
- Migrados: `src/app/admin/(panel)/{customers,services,passport-types,contract-templates,parties}/page.tsx`, `parties/contracts/page.tsx`
- Removidos: `src/components/ui/{admin-data-table,sortable-table-head}.tsx`

Ações do usuário: testar no `npm run dev` busca, ordenação (2 cliques), 25 por página, paginação e abrir item em cada lista; `/admin/parties?status=pending`; 375px. `AdminDataTable` não era usado por `operacao/ingressos` (tabela própria, Fase 10). `.claude/skills/shadcn/SKILL.md` ainda cita `admin-data-table` (atualizar na Fase 12).

---

- [x] Fase 6 — Formulários CRUD (Clientes, Preços e Serviços, Passaportes, Modelos de contrato)

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 + decisão "CRUDs mantêm `/new` e `/[id]`, com formulários no layout do template"; preservar as seções 2.6–2.9 (campos, validações, mensagens 403/409/500, toasts, painel de variáveis, editor TipTap, aviso de variáveis extras, checkbox "Ativo"/"Padrão").
**Origem:** decisão "CRUDs … mantêm as páginas `/new` e `/[id]`, com formulários no layout do template."

**Gap atual → desejado:** `CustomerForm.tsx`, `ServiceForm.tsx`, `PassportTypeForm.tsx`, `TemplateForm.tsx` e as páginas `new/page.tsx`/`[id]/page.tsx` de cada área com componentes compartilhados → layout de `src/views/forms/form-layouts/vertical/` do template: `Card` com `CardHeader` (título/descrição), `CardContent` com `FieldGroup`/`Field`/`FieldLabel`/`FieldError`, `Input`/`Checkbox` do kit, ações no rodapé (Cancelar `outline` + Salvar).

**Implementação (premissas):**
- Mesma lógica de submit, React Query (`useMutation`), validação e textos. Preços continuam como hoje (R$, `>= 0`); a `key` do serviço aparece como `Badge` só leitura.
- `TemplateForm`: painel de variáveis com `Tabs` do kit (Cliente/Festa) e botões de copiar `{{...}}` no estilo do kit; editor TipTap: mover `src/components/ui/tiptap-editor.tsx` para `src/components/admin/tiptap-editor.tsx` (uso exclusivo do admin) e trocar os imports de `button`/`input`/`toggle`/etc. para o kit admin, sem mudar o comportamento do editor. `contract-preview` continua em `src/components/ui/` (também usado no portal público).

**Arquivos:** `src/app/admin/(panel)/customers/{CustomerForm.tsx,new/page.tsx,[id]/page.tsx}`, `src/app/admin/(panel)/services/{ServiceForm.tsx,new/page.tsx,[id]/page.tsx}`, `src/app/admin/(panel)/passport-types/{PassportTypeForm.tsx,new/page.tsx,[id]/page.tsx}`, `src/app/admin/(panel)/contract-templates/{TemplateForm.tsx,new/page.tsx,[id]/page.tsx}`, `src/components/ui/tiptap-editor.tsx` → `src/components/admin/tiptap-editor.tsx`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** criar e editar nas quatro áreas funcionando com as mesmas validações e mensagens; só componentes do kit admin nesses arquivos.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)" src/components/admin`; `npm run dev`: criar cliente com CPF repetido (409), editar serviço com `key`, criar passaporte inativo, criar modelo com variável extra e marcar como padrão.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- Movido: `src/components/ui/tiptap-editor.tsx` → `src/components/admin/tiptap-editor.tsx` (`ToolbarBtn` movido para o escopo do módulo por exigência do eslint)
- `src/app/admin/(panel)/customers/{CustomerForm.tsx,new/page.tsx,[id]/page.tsx}`
- `src/app/admin/(panel)/services/{ServiceForm.tsx,new/page.tsx,[id]/page.tsx}`
- `src/app/admin/(panel)/passport-types/{PassportTypeForm.tsx,new/page.tsx,[id]/page.tsx}`
- `src/app/admin/(panel)/contract-templates/{TemplateForm.tsx,new/page.tsx,[id]/page.tsx}`

Ações do usuário: testar no `npm run dev` criar cliente com CPF repetido (409), editar serviço com `key`, criar passaporte inativo, criar modelo com variável extra e marcar como padrão. `.next` desatualizado (rotas antigas): apague `.next` se o `tsc` acusar `.next/types`.

---

- [x] Fase 7 — Salão de Festas: Calendar do template, formulário, detalhe e contrato

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2 + decisão "o calendário de festas usa o Calendar do template (mês, semana, dia)"; preservar a seção 2.10 (alternância Lista/Calendário, cores por status, `PartyForm` em 3 etapas com busca de cliente, validações e conflito no `onBlur`, detalhe com "Cancelar festa" e abas Dados/Contrato, todas as ações da aba Contrato, página `/[id]/contract`).
**Origem:** decisão "O calendário de festas passa a usar o Calendar do template…" + M2 "Adaptar tudo ao tema…".

**Gap atual → desejado:** `PartyCalendar.tsx` próprio (só mês, cores `yellow/green/gray` fixas) e telas de festa com componentes compartilhados → calendário do template + telas no kit admin.

**Implementação (premissas):**
- `npm i date-fns`. Copiar `src/views/apps/calendar/{index,month-view,week-view,day-view,event-item,calendar-cell}.tsx`, `src/utils/calendar-utils.ts`, `src/types/apps/calendar-types.ts`, `src/hooks/{use-event-visibility,use-current-time-indicator}.ts` e as constantes usadas de `src/assets/data/constants.ts` para `src/components/admin/calendar/`. Adaptar: sem fake-db; recebe `events` por prop; locale `pt-BR` do `date-fns` em todos os `format`; semana começando no domingo; textos em pt-BR (Hoje, Mês, Semana, Dia); sem diálogo de criar/editar evento e sem arrastar; o botão de adicionar vira link para `/admin/parties/new` ("Nova festa"); clique no evento navega para `/admin/parties/<id>`. O `useEffect` de atalhos de teclado pode ficar (não é fetch); remover `useMemo`/`useCallback`.
- Mapeamento festa → evento: título = nome do cliente; início = `date`; fim = `dateEnd` ou início + 4 h (regra atual do admin); cor por status usando as cores de evento que o template oferece (ex.: pending = laranja/amarelo, confirmed = verde, cancelled = neutro com texto riscado). Escolher entre as opções de cor existentes no template, sem criar tokens.
- Fonte de dados igual à de hoje: `GET /api/admin/parties?perPage=100` (limitação das 100 primeiras festas fica como ponto em aberto, fora do alvo).
- `parties/page.tsx`: alternância Lista/Calendário com `Tabs` (ou `ToggleGroup`) do kit; a lista já usa o DataTable da Fase 5.
- `PartyForm.tsx`: 3 etapas em `Card` do kit; busca de cliente com `Combobox` do kit (mínimo de 2 caracteres, mesma API `GET /api/admin/customers?search=…`) e "Cadastrar cliente"; `Select` de modelo; data/horário com `Input` (`type=date`/`time`) do kit; mesmas validações e mensagens.
- `parties/[id]/page.tsx`, `PartyContractTab.tsx`, `parties/[id]/contract/page.tsx`, `parties/new/page.tsx`: cabeçalho (nome, `Badge` de status, data, "Cancelar festa"), `Tabs` do kit, botões e cards do kit; mesma lógica (WhatsApp, toggle de link, copiar, PDF, variáveis extras, preview).
- Remover `PartyCalendar.tsx`.

**Arquivos:** `src/components/admin/calendar/**` (novos), `src/app/admin/(panel)/parties/{page.tsx,PartyForm.tsx,PartyCalendar.tsx (remover),new/page.tsx,[id]/page.tsx,[id]/PartyContractTab.tsx,[id]/contract/page.tsx}`, `package.json`/`package-lock.json`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** calendário com visões mês/semana/dia em pt-BR mostrando as festas com cor por status e link para o detalhe; formulário, detalhe e aba Contrato com o mesmo comportamento de antes, só com o kit admin; sem `yellow-*`/`green-*`/`gray-*` próprios.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)/parties" src/components/admin/calendar`; `npm run dev`: alternar Lista/Calendário, navegar meses e semanas, clicar numa festa; criar festa com conflito de horário (erro no `onBlur`); no detalhe, "Copiar link", alternar link, "Gerar PDF", salvar variáveis; cancelar uma festa de teste.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- Novos: `src/components/admin/calendar/{event-calendar,month-view,week-view,day-view,event-item,calendar-cell}.tsx`, `calendar-utils.ts`, `calendar-types.ts`, `constants.ts`, `position-events.ts`, `use-event-visibility.ts`, `use-current-time-indicator.ts`
- `src/app/admin/(panel)/parties/{page.tsx,PartyForm.tsx,[id]/page.tsx,[id]/PartyContractTab.tsx (reformatado com prettier),[id]/contract/page.tsx}`
- Removido: `src/app/admin/(panel)/parties/PartyCalendar.tsx`
- `package.json`, `package-lock.json` (`date-fns`)

Ações do usuário: testar no `npm run dev` Lista/Calendário, mês/semana/dia, clique na festa, conflito de horário, `Combobox` de cliente e ações da aba Contrato. Observações: festa `cancelled` usa a cor `etc` (azul claro) com texto riscado, pois o template não tem cor neutra; horários gravados como wall-clock UTC aparecem em fuso local no calendário (ex.: 10:00 vira 07:00 em -03), comportamento pré-existente mais visível em semana/dia; calendário limitado às 100 primeiras festas.

---

- [x] Fase 8 — CMS no kit do template

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2; preservar a seção 2.5 (cards por tipo com "Limpar cache" e "Limpar todos", aviso de cache, Sheet por componente com edição de valor simples e de instâncias, salvar com confirmação em dois cliques, toasts).
**Origem:** M2 — "Adaptar tudo ao tema: … páginas … e o restante".

**Gap atual → desejado:** `CMSContent.tsx` (6 usos de `brand-*`/`gray-*`) e `component-types/[id]/ComponentCards.tsx` com componentes compartilhados → `Card`, `Alert` (aviso de cache), `Sheet`, `Field`, `Input`, `Button`, `Badge`, `Skeleton` do kit admin; cabeçalho de página no padrão do template.

**Implementação (premissas):** mesmas server actions (`revalidateCMS*` em `src/app/admin/(panel)/actions.ts`) e mesmas chamadas de API. O `ConfirmButton` de dois cliques continua (é comportamento), redesenhado com `Button` do kit (`variant='destructive'`/`default` no segundo clique). Bugs listados em "Pontos em aberto › CMS" ficam fora.

**Arquivos:** `src/app/admin/(panel)/cms/{page.tsx,CMSContent.tsx,component-types/[id]/page.tsx,component-types/[id]/ComponentCards.tsx}`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** visão geral e edição de componentes no visual do template, com o mesmo comportamento; sem `brand-*`/`gray-*`.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)/cms"`; `npm run dev`: limpar o cache de um tipo; abrir `NavBar` > componente > editar um valor simples e salvar (2 cliques); adicionar e remover uma linha de instância.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/app/admin/(panel)/cms/CMSContent.tsx`
- `src/app/admin/(panel)/cms/component-types/[id]/{page.tsx,ComponentCards.tsx}`

Ações do usuário: testar no `npm run dev` `/admin/cms` (limpar um tipo e todos) e `/admin/cms/component-types/<id>` (editar valor, salvar com 2 cliques, adicionar/remover linha de instância). A paleta rotativa de cores da marca nos cards foi removida (ícones em `bg-primary/10`).

---

- [x] Fase 9 — Configurações (Integrações) no padrão de abas do template

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2; preservar a seção 2.4 (título "Integrações", três abas Google/Instagram/Stripe, cada aba salva só suas chaves, segredos com mostrar/ocultar, textos de ajuda, toasts, `router.refresh()`).
**Origem:** M2 — "Adaptar tudo ao tema…".

**Gap atual → desejado:** `settings/SettingsContent.tsx` (7 usos de `gray-*`/`brand-*`) → layout de `src/views/pages/user-settings/` do template: `Tabs` do kit, um `Card` por aba com `FieldGroup`, segredos com `InputGroup` + botão olho, botão "Salvar" no rodapé do card.

**Implementação (premissas):** mesma action `updateSettings` e mesmo `page.tsx` (a exposição de segredos ao client é ponto em aberto, fora do alvo). Aba ativa em estado local, como hoje.

**Arquivos:** `src/app/admin/(panel)/settings/{page.tsx,SettingsContent.tsx}`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** três abas no visual do template salvando como antes; sem `gray-*`/`brand-*`.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)/settings"`; `npm run dev`: alternar abas, mostrar/ocultar segredo, salvar a aba Google com o mesmo valor e conferir o toast.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/app/admin/(panel)/settings/SettingsContent.tsx`

Ações do usuário: testar `/admin/settings` no `npm run dev` (abas, mostrar/ocultar segredo, salvar). Cards sem descrição (nenhum texto novo além dos títulos "Google", "Instagram", "Stripe"); o `max-w-2xl` do container foi removido.

---

- [x] Fase 10 — Operação (visão geral, validar, detalhe, ingressos)

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2; preservar a seção 2.11 inteira (contadores, campo de código + leitor de QR, mensagens de câmera, badges e textos por status, banner do documento, conferência por criança, cronômetro 1 s / refetch 30 s, check-in/check-out, resumo, lista de ingressos com cronômetro por linha, busca e filtro de status).
**Origem:** M2 — "Escopo: tudo o que exige login (`/admin/*`, `/operacao`, `/ingressos`…)".

**Gap atual → desejado:** `operacao/page.tsx`, `operacao/validar/page.tsx`, `operacao/validar/[shortCode]/page.tsx` (696 linhas) e `operacao/ingressos/page.tsx` (tabela própria, não usa o `AdminDataTable`) com componentes compartilhados → kit admin: contadores no estilo de `src/views/dashboards/statistics/statistics-card-01.tsx`; validar em `Card` com `Field`/`Input` + área do `qr-scanner`; detalhe com `Card`, `Badge`, `Alert` (cards de bloqueio e "cobrar à parte"), `Button`; ingressos com o `DataTable` da Fase 5 se o endpoint `GET /api/tickets/operate` devolver `{ data, pagination }` e os filtros couberem em `FilterConfig` — senão, compor com os mesmos subcomponentes (`Card` + toolbar + `Table` + `Pagination`) mantendo a lógica atual.

**Implementação (premissas):** sem mudança de API nem de regra. `src/components/operacao/qr-scanner.tsx` mantém a lógica; só o container/mensagens passam ao kit. O `window.confirm` do check-in continua (ponto em aberto). Cores de status (verde/vermelho/âmbar) passam a variants/tokens do kit (`destructive`, `secondary`, `outline`, `text-destructive`).

**Arquivos:** `src/app/admin/(panel)/operacao/{page.tsx,validar/page.tsx,validar/[shortCode]/page.tsx,ingressos/page.tsx}`, `src/components/operacao/qr-scanner.tsx` (só se tiver estilo próprio).
**Migration:** não. **Contrato:** não.

**Critério de pronto:** quatro telas no visual do template, com comportamento idêntico para admin e operator.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)/operacao" src/components/operacao`; `npm run dev` como operator: visão geral; validar por código; abrir uma compra `paid` (check-in), uma `checked_in` (cronômetro e check-out) e uma `checked_out`; código inexistente; ingressos com busca e filtro; câmera no celular (ou permissão negada no desktop).
**Ações do usuário:** ter compras de teste nos status `paid`/`checked_in`/`checked_out` no banco de desenvolvimento.

Arquivos alterados:

- `src/app/admin/(panel)/operacao/{page.tsx,validar/page.tsx,validar/[shortCode]/page.tsx,ingressos/page.tsx}`

Ações do usuário: testar `/admin/operacao`, `/validar`, `/validar/<código>` (paid, checked_in com e sem excedente, checked_out, inexistente) e `/ingressos` (busca e os dois filtros — confirmar que os `Select` mostram o rótulo, não o valor). Ingressos não usa o `DataTable` (linhas são compras com tickets aninhados e cronômetro por ticket); compõe Card + Table + Pagination. `qr-scanner.tsx` não precisou mudar. Rótulos novos de coluna: "Ticket", "Status", "Tempo".

---

- [x] Fase 11 — Dashboard

**Camadas / agente:** UI (`frontend`).
**Requisito:** M2; preservar a seção 2.3 (data por extenso, saudação por hora com nome, boas-vindas, card de festas pendentes com link e "Em dia", card do CMS).
**Origem:** M2 — "Adaptar tudo ao tema…".

**Gap atual → desejado:** `DashboardContent.tsx` (11 usos de `brand-*`/`gray-*`, banner colorido) → cabeçalho de página e cards no estilo do template (`statistics-card-01` para o card de pendentes; `Card` com `CardAction`/link para o CMS). Sem métricas, gráficos ou widgets novos.

**Arquivos:** `src/app/admin/(panel)/{page.tsx,DashboardContent.tsx}`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** dashboard no visual do template com o mesmo conteúdo; sem `brand-*`/`gray-*`.
**Como verificar:** `npx tsc --noEmit`; `npx eslint "src/app/admin/(panel)/page.tsx" "src/app/admin/(panel)/DashboardContent.tsx"`; `npm run dev`: `/admin` com e sem festas pendentes.
**Ações do usuário:** nenhuma.

Arquivos alterados:

- `src/app/admin/(panel)/DashboardContent.tsx` (`page.tsx` inalterado)

Ações do usuário: conferir `/admin` com e sem festas pendentes. `tsc` só acusa tipos stale em `.next/` (caminhos antigos pré `(panel)`/`(auth)`); regeneram ao rodar `npm run dev`/`build`.

---

- [ ] Fase 12 — Limpeza e varredura final

**Camadas / agente:** UI (`frontend`) + revisão (`reviewer`).
**Requisito:** M2 — "não reinventar a roda" / tema em toda a interface logada; decisão "kit isolado".
**Origem:** M2 — "Adaptar tudo ao tema…" + decisão "Kit isolado…".

**Gap atual → desejado:** sobram componentes do admin antigo em `src/components/ui/` e referências antigas → nenhuma tela logada importa de `src/components/ui/` (exceto `contract-preview`, compartilhado com o portal público); componentes só do admin antigo removidos; skills/docs atualizados.

**Implementação (premissas):**
- `grep` em `src/app/admin` por `@/components/ui/` (permitido só `contract-preview`), `brand-`, `text-gray-`, `bg-gray-`, `font-heading`, `framer-motion`, `useMemo`, `useCallback` → zerar.
- Remover de `src/components/ui/` o que ficou sem uso após as fases (conferir com `grep` antes de cada remoção): `admin-sub-sidebar`, `nav-skeleton`, `sidebar`, `sortable-table-head`, `admin-data-table`, e quaisquer outros (`avatar`, `breadcrumb`, `chart`, `dropdown-menu`, `select`, `separator`, `sheet`, `skeleton`, `table`, `tabs`, `tooltip`, `toggle`, `toggle-group`, `popover`, `drawer`, `field`, `textarea`, `badge`, `card`) **somente se** nenhum arquivo fora do admin os importar. `src/hooks/use-mobile.ts` idem.
- Atualizar `.claude/skills/shadcn/SKILL.md` (o kit do admin fica em `src/components/admin/ui` no estilo `base-vega` do AdminCN; listagens do admin usam `src/components/admin/data-table.tsx`; navegação por submenus na sidebar; remover a regra "admin areas follow the sidebar + sub-sidebar layout") e `.claude/skills/tailwind/SKILL.md` (telas logadas usam Geist e tokens do template, sem cores da marca). Atualizar a árvore "Estrutura de Componentes" do `CLAUDE.md` só no trecho do admin.
- Rodar o agente `reviewer` sobre M1 e M2.

**Arquivos:** `src/components/ui/*` (remoções verificadas), `src/hooks/use-mobile.ts` (se sem uso), `.claude/skills/shadcn/SKILL.md`, `.claude/skills/tailwind/SKILL.md`, `CLAUDE.md`.
**Migration:** não. **Contrato:** não.

**Critério de pronto:** greps acima sem ocorrências; `npx tsc --noEmit` e `npm run lint` limpos; `npm run build` passa; site público sem mudança visual (`/`, `/orcamento`, `/compra-antecipada`, `/c/<token>`).
**Como verificar:** comandos acima; `npm run dev` e passada visual por todas as telas logadas (admin e operator) e pelas públicas citadas.
**Ações do usuário:** nenhuma.

Arquivos alterados:

---

## Premissas gerais

- Itens de "Pontos em aberto" (segurança das APIs `/api/admin/*`, settings, webhook, bugs de CMS/festas/operação) não estão em `## Mudanças pendentes` e não entram neste plano, exceto o que a nova casca resolve naturalmente (título por rota/duplo `<h1>`, "Ver site" sempre ativo, `<a>` recarregando a página, query de pendentes antes da sessão/para operator, `console.log` de debug, `text-gray-*`).
- A fonte das telas logadas passa a ser Geist (a do template); o site público continua com Poppins/Fredoka.
- Ordem: Fase 1 é independente; Fases 3–12 dependem da Fase 2; Fases 5–11 dependem da Fase 3; Fase 7 usa o DataTable da Fase 5; Fase 12 é a última.
