# Content API

## 1. O que é

API de consulta de conteúdo acessada por token. Em settings haverá uma página para criar API tokens; com o token, o usuário acessa duas URLs de API: `getEntity` e `findEntity`.

## 2. Requisitos

- Em settings, uma página para criar API tokens.
- Com o token, o usuário acessa duas URLs de API: `getEntity` e `findEntity`.
  - `getEntity`: retorna uma lista paginada, com filtros.
  - `findEntity`: recebe apenas o id e retorna apenas 1 registro.
- As URLs só consultam (somente leitura) por enquanto.
- A rota é única, com valores dinâmicos: o usuário passa a `entity` e os `filtros`.
- Por enquanto existe apenas a entidade `prices`, com filtros coerentes para essa entidade.
  - `prices` corresponde ao model `Service` (tabela `services`, aba "Salão de festas" de `/admin/services`).
  - Filtros de `prices`: `id`, `name` e `key` (a "tag" exibida como badge ao lado do nome no admin).
  - Campos expostos: `id`, `key`, `name`, `weekdayPrice`, `weekendPrice`.
- URLs (entity no path, filtros na query string):
  - `getEntity`: `GET /api/v1/content/[entity]`.
  - `findEntity`: `GET /api/v1/content/[entity]/[id]`.
- O token é enviado no header `Authorization: Bearer <token>`.
- Gestão dos tokens:
  - cada token tem um nome;
  - o valor é exibido uma única vez, na criação; o banco guarda apenas o hash SHA-256;
  - a página lista os tokens (nome, criação, último uso) e permite revogar;
  - tokens não expiram.
- Documentação Swagger (OpenAPI) da Content API:
  - Swagger UI em `/api-docs`, pública (fora do `/admin`), com "Authorize" (Bearer) para testar as rotas;

## 3. Anexos e referências

## 4. Pontos em aberto

> Os itens abaixo foram assumidos como premissa em `plan.md` (só `admin`; `name` por trecho; `page`/`perPage` 15/100; erros 401/404/400). Confirme ou ajuste.

- Quem acessa a página de tokens em settings (`admin` apenas? `operator`?).
- `name` filtra por igualdade ou por trecho (contém)?
- Parâmetros de paginação (ex.: página/tamanho, limite máximo) e formato da resposta e erros (token inválido, entidade inexistente, filtro inválido).
