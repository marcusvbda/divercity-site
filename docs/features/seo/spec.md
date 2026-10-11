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
4. **`robots.ts`**: `userAgent: "*"`, `allow: "/"`, `disallow` para áreas privadas (`/admin`, `/api`, `/api-docs`, `/c/`) e `sitemap` apontando para `<URL do site>/sitemap.xml`. As páginas `/api-docs` e `/admin/login` também recebem `robots: { index: false, follow: false }`.
5. **`sitemap.ts`**: no Divercity Park lista somente a home (`https://divercitypark.com.br`).
6. **JSON-LD `AmusementPark`** (subtipo de `LocalBusiness`) injetado no layout (`<script type="application/ld+json">`, com `<` escapado como `\u003c`), com `name`, `description`, `logo`, `url`, `sameAs` (redes sociais, ex.: Instagram) e dados locais vindos do CMS: endereço, telefone (WhatsApp) e horários.
7. **Idioma**: o site é somente em português (`pt-BR`); não há `alternates.languages`/`hreflang` nem `x-default`, e o prefixo de locale do projeto de referência não se aplica.
8. **Metadata por página**: cada página define título, descrição, `alternates.canonical`, `openGraph` (title, description, image, url, type) e `twitter` (summary / summary_large_image conforme haja imagem), via um helper central (equivalente ao `getPageMetadata` do projeto de referência).
9. **Origem dos dados**: `siteName`, `description`, imagem OG/logo, redes sociais (`sameAs`) e os dados locais do JSON-LD vêm do CMS; o restante (regras de robots, sitemap, estrutura das tags, locale `pt-BR`) é fixo no código.
   - `siteName`: **novo campo `siteName`** no componente `Metadata/SEO` (valor "Divercity Park"). Alimenta o `title.template` (`%s | <siteName>`), `applicationName` e `openGraph.siteName`. O `Metadata/SEO.title` continua sendo o título default (home).
   - Descrição: `Metadata/SEO.description`.
   - Imagem OG: `Metadata/SEO.og_image`, com fallback para `NavBar/Logo.url`. Logo do JSON-LD: `NavBar/Logo.url`.
   - `sameAs`, endereço, telefone e horários: `Footer/Info` (`instagramUrl`, `address`, `wppNumber`, `weekdaysTime`, `holidaysTime`).
10. **Variáveis de ambiente**: a URL do site reaproveita `NEXT_PUBLIC_APP_URL` (que já existe), com fallback `https://divercitypark.com.br`. A verificação do Google Search Console é feita por registro TXT no DNS, sem variável de ambiente.
11. **Descrições limpas**: helper que normaliza texto (remove markdown, colapsa espaços) e trunca em ~160 caracteres, sem cortar palavra (equivalente ao `getDescription`).

## 3. Anexos e referências

- Projeto de referência: `/Users/mvbassalobre/Projects/institutional-website-frontend`
  - `app/[locale]/layout.tsx` — metadata global, verificação do Google, robots por ambiente, JSON-LD Organization
  - `app/robots.ts` — regras de robots + link do sitemap
  - `app/sitemap.ts` — sitemap com páginas estáticas e dinâmicas
  - `services/seo.ts` — `SITE_URL`, `getPageMetadata`, `getDescription`

## 4. Pontos em aberto

- Token do Search Console: informado pelo usuário no formato de registro TXT de DNS (`google-site-verification=<token>`). A meta tag usa só o `<token>` (parte após o `=`). O valor não é gravado neste spec; vai em `.env` / `.env.local`.
- Horários no JSON-LD: o CMS guarda texto livre ("10h às 22h") sem dias da semana, e o `openingHours` do schema.org exige formato estruturado (`Mo-Fr 10:00-22:00`). Enquanto os dias não forem definidos, os horários ficam fora do JSON-LD. Falta definir quais dias valem para `weekdaysTime` e para `holidaysTime`.
