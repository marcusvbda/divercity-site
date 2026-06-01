# Divercity Park — Site Institucional

Site completo do **Divercity Park**, parque indoor de diversão infantil em Maringá/PR.

Stack: **Next.js 16** (frontend) + **Strapi v5** (CMS/backend)

---

## Estrutura do Projeto

```
divercity-site/
  frontend/   — Next.js 16 App Router (site público)
  backend/    — Strapi v5 CMS (painel de conteúdo)
  docs/       — Documentação, assets e imagens
```

---

## Pré-requisitos

- Node.js 20+
- npm ou yarn

---

## 1. Backend — Strapi CMS

### Instalar dependências

```bash
cd backend
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
# O .env já vem com chaves geradas e SQLite configurado para dev local
# Não é necessário alterar nada para rodar localmente
```

### Rodar em desenvolvimento

```bash
npm run develop
```

Acesse o painel em: **http://localhost:1337/admin**

Na primeira vez, crie seu usuário administrador.

### Rodar o seed (popular conteúdo inicial)

Após criar o usuário admin e o Strapi estar rodando:

1. Gere um API Token em: **Admin → Settings → API Tokens → Create new token**
   - Nome: `Seed Token`
   - Token type: `Full access`
   - Copie o token gerado

2. Execute o seed:

```bash
cd backend
STRAPI_TOKEN=<seu_token_aqui> npx tsx src/seed/run.ts
```

O seed é idempotente — pode rodar mais de uma vez sem duplicar dados.

### Liberar permissões de leitura pública

Em **Admin → Settings → Roles → Public**, habilite `find` e `findOne` para:
- `atracao`
- `preco`
- `beneficio`
- `depoimento`
- `price-disclaimer`
- `configuracao-site`
- `site-metadata`

---

## 2. Frontend — Next.js

### Instalar dependências

```bash
cd frontend
npm install
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `frontend/.env.local` com os valores:

```env
# Strapi CMS (obrigatório para conectar ao backend)
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=<token_gerado_no_strapi>

# Instagram — opcional (exibe placeholders se não configurado)
INSTAGRAM_ACCESS_TOKEN=

# Google Places — opcional (exibe avaliações estáticas se não configurado)
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
```

> O frontend funciona sem o Strapi rodando — usa valores fallback estáticos. Para ver o conteúdo do CMS, o backend precisa estar rodando e o token configurado.

### Rodar em desenvolvimento

```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:3000**

### Build de produção

```bash
cd frontend
npm run build
npm start
```

---

## 3. Rodar tudo junto (dev local)

Em dois terminais separados:

**Terminal 1 — Backend:**
```bash
cd backend && npm run develop
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `DATABASE_CLIENT` | `sqlite` | Banco de dados local |
| `DATABASE_FILENAME` | `.tmp/data.db` | Arquivo SQLite |
| `APP_KEYS` | gerado | Chaves de sessão do Strapi |
| `JWT_SECRET` | gerado | Segredo para JWT |

Para produção (cloud/PostgreSQL), descomente as variáveis `DATABASE_*` do `postgres` no `.env.example`.

### Frontend (`frontend/.env.local`)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `STRAPI_URL` | Sim | URL do Strapi (ex: `http://localhost:1337`) |
| `STRAPI_API_TOKEN` | Sim | Token Full Access gerado no Strapi Admin |
| `INSTAGRAM_ACCESS_TOKEN` | Não | Token da Instagram Graph API (posts reais) |
| `GOOGLE_PLACES_API_KEY` | Não | Chave do Google Places API (avaliações reais) |
| `GOOGLE_PLACE_ID` | Não | Place ID do Divercity Park (opcional, busca automática) |

> **Segurança:** `STRAPI_API_TOKEN` vive apenas no servidor Next.js — nunca é exposto ao browser.

---

## Seed de conteúdo

O script `backend/src/seed/run.ts` popula automaticamente:

| Conteúdo | Quantidade |
|----------|-----------|
| Configuração do site (endereço, horários, WhatsApp) | 1 |
| SEO metadata (title, description, OG) | 1 |
| Atrações | 7 |
| Benefícios ("Por que escolher") | 6 |
| Preços / Passaportes | 2 grupos × 4 tiers |
| Disclaimers de preços | 2 |
| Depoimentos | 3 |

---

## Arquitetura de segurança

```
Browser → Next.js (frontend) → [STRAPI_API_TOKEN no servidor] → Strapi (backend)
```

O token do CMS nunca chega ao browser. Todas as requisições ao Strapi passam por:
- Server Components (SSR direto)
- API Routes do Next.js como proxy (para componentes client-side)
