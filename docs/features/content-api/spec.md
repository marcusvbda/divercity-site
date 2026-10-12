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
- Acesso à página de tokens em settings: apenas `admin`.
- Filtro `name` de `prices`: por trecho (contém).
- Paginação, resposta e erros: adotado o recomendado — `page` e `perPage` (padrão 15, máximo 100); erros 401 (token ausente/inválido/revogado), 404 (entidade ou id inexistente) e 400 (filtro ou parâmetro inválido).

### Horários de funcionamento

- Criar um cadastro próprio de horários de funcionamento no admin, no mesmo molde do cadastro de preços (`prices`).
- Cada horário tem um rótulo (`label`), dois campos de horário (`opening` e `close`), exatamente como no print, e uma `key` única de identificação, como em preços: ![Funcionamento na landing page](assets/horario-funcionamento-lp.png)
  - No print: "Segunda a Sábado: 10h às 22h" e "Domingos e feriados: 12h às 20h".
- A landing page passa a exibir o horário de funcionamento vindo desse cadastro, em vez do valor atual vindo do CMS.
- Os valores atuais de `weekdaysTime`/`holidaysTime` no CMS (ContactSection e Footer) migram para o novo cadastro e deixam de existir no CMS.
- A ordem de exibição na landing page é por `id` crescente.
- Os horários de funcionamento também são expostos pela Content API (`getEntity` e `findEntity`), como a entidade `hours`, ao lado de `prices`.
  - Campos expostos: `id`, `key`, `label`, `opening`, `close`.
  - `opening` e `close` são em hora cheia (ex.: 10 e 22 para "10h às 22h").
  - Filtros de `hours`: `id`, `key` (idênticos) e `label` (por trecho).
- Regra geral dos filtros da API, para qualquer entidade: `id` e `key` são sempre filtrados por igualdade (idênticos).
- Quando não houver nenhum horário cadastrado, a landing page não mostra nada (o bloco "Funcionamento" não aparece).
- O cadastro fica num item de menu próprio no admin, "Horários", em `/admin/hours` (listagem, `/admin/hours/new`, `/admin/hours/[id]`), acessível só por `admin`.
- A `key` segue o padrão de preços: é opcional e única, só a migration/seed a define (`weekdays` para "Segunda a Sábado" e `sundays_holidays` para "Domingos e feriados"), aparece como somente leitura no formulário, e um horário com `key` não pode ser removido. Horários criados pelo admin ficam sem `key`.
- A migração dos dados lê os valores atuais de `weekdaysTime`/`holidaysTime` do CMS (`Footer.Info`), no formato "Xh às Yh". Se não conseguir ler, usa os valores do print (10–22 e 12–20). Os rótulos ficam "Segunda a Sábado" e "Domingos e feriados".
- `opening` e `close` são inteiros: `opening` de 0 a 23, `close` de 1 a 24, e `close` maior que `opening`. A API devolve o número (ex.: `10`) e a landing page exibe "10h às 22h".

## 3. Anexos e referências

- [horario-funcionamento-lp.png](assets/horario-funcionamento-lp.png) — bloco "Funcionamento" (e "Onde estamos") da landing page, com os horários "Segunda a Sábado" e "Domingos e feriados".

## 4. Pontos em aberto

- Spec separada: o cadastro admin + mudança na landing page de horários ficou aqui nesta spec; faz sentido mover para `docs/features/<outra>/spec.md`?
