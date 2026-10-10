# SEO

## 1. O que é

Ajustes de SEO e indexação do Google no site público do Divercity Park, replicando os mesmos ajustes já feitos no projeto `/Users/mvbassalobre/Projects/institutional-website-frontend` (referência).

## 2. Requisitos

Replicar, no site do Divercity Park, o que o projeto de referência faz para indexação no Google:

1. **Metadata global no layout** (`generateMetadata` do layout raiz):
   - `metadataBase` apontando para a URL do site.
   - `title` com `default` (nome do site) e `template` `%s | <nome do site>`.
   - `description`, `applicationName`.
   - `openGraph` (title, description, imagem/logo, locale, siteName) e `twitter` (card, title, description, imagem).
   - `icons` (favicon) quando disponível.
2. **Verificação do Google Search Console**: meta tag `google-site-verification` via `metadata.verification.google` no layout. O token é lido de variável de ambiente (não fica no código).
3. **Controle de indexação por ambiente**: `robots` com `index: true` / `follow: true` (incluindo `googleBot`) em produção e `index: false` / `follow: false` em preview (`VERCEL_ENV === "preview"`).
4. **`robots.ts`**: `userAgent: "*"`, `allow: "/"` e `sitemap` apontando para `<URL do site>/sitemap.xml`.
5. **`sitemap.ts`**: no Divercity Park lista somente a home (`https://divercitypark.com.br`).
6. **JSON-LD `Organization`** injetado no layout (`<script type="application/ld+json">`, com `<` escapado como `\u003c`), com `name`, `description`, `logo`, `url` e `sameAs` (redes sociais, ex.: Instagram).
7. **Idioma**: o site é somente em português (`pt-BR`); não há `alternates.languages`/`hreflang` nem `x-default`, e o prefixo de locale do projeto de referência não se aplica.
8. **Metadata por página**: cada página define título, descrição, `alternates.canonical`, `openGraph` (title, description, image, url, type) e `twitter` (summary / summary_large_image conforme haja imagem), via um helper central (equivalente ao `getPageMetadata` do projeto de referência).
9. **Origem dos dados**: `siteName`, `description`, imagem OG/logo e redes sociais (`sameAs`) vêm do CMS; o restante (regras de robots, sitemap, estrutura das tags, locale `pt-BR`) é fixo no código.
10. **Variáveis de ambiente**: a URL do site (`https://divercitypark.com.br`) e o token de verificação do Google vêm de variáveis de ambiente, com placeholders documentados no `.env.example`.
11. **Descrições limpas**: helper que normaliza texto (remove markdown, colapsa espaços) e trunca em ~160 caracteres, sem cortar palavra (equivalente ao `getDescription`).

## 3. Anexos e referências

- Projeto de referência: `/Users/mvbassalobre/Projects/institutional-website-frontend`
  - `app/[locale]/layout.tsx` — metadata global, verificação do Google, robots por ambiente, JSON-LD Organization
  - `app/robots.ts` — regras de robots + link do sitemap
  - `app/sitemap.ts` — sitemap com páginas estáticas e dinâmicas
  - `services/seo.ts` — `SITE_URL`, `getPageMetadata`, `getDescription`

## 4. Pontos em aberto

- Token do Search Console: informado pelo usuário no formato de registro TXT de DNS (`google-site-verification=<token>`). A meta tag usa só o `<token>` (parte após o `=`). O valor não é gravado neste spec; vai em `.env` / `.env.local`.
- Nomes das variáveis de ambiente (URL do site e token): definir no plano.
- Qual ContentType/campos do CMS fornecem `siteName`, descrição, imagem OG/logo e redes sociais (`sameAs`)? Se algum campo não existir hoje, precisa ser criado no CMS (a verificar no `/plan-feature`).
- "Arquivos de maps e indexação" = `sitemap.ts` e `robots.ts` (itens 4 e 5). Falta confirmar se inclui algo mais (ex.: dados de local no JSON-LD).
- JSON-LD: manter só `Organization` ou usar tipo mais específico para o negócio (ex.: `LocalBusiness`/`AmusementPark`) com endereço, horários e telefone vindos do CMS?
