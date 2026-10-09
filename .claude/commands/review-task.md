---
description: 'Lê a task (PDF, imagem ou .md), confere item por item se o que foi pedido está no código, pergunta o que estiver em dúvida e entrega um relatório de review de implementação'
---

# /review-task $ARGUMENTS

Recebe em `$ARGUMENTS` o caminho da task (PDF, imagens ou `.md`; pode ser mais de um arquivo) e, opcionalmente, as pastas de `docs/features/` relacionadas e o ponto de partida do diff (commit/ref), ex.: `~/Downloads/task.pdf checkin-operacao desde=da4f806`. Se vier vazio, procure o arquivo mais recente em `~/Downloads` e `~/Desktop` (PDF/imagem com nome de task), mostre o que achou e pergunte se é esse.

Objetivo: dizer, com evidência no código, o que a task pediu e foi entregue, o que falta e o que foi feito sem estar na task. **Não altere código nem spec.**

## Passos

### 1. Ler a task inteira

- `Read` direto no arquivo. PDF: `Read` com `pages`.
- PDF que é print de página inteira (muito alto, só imagem): renderize e fatie antes de ler, com scripts e imagens no scratchpad da sessão (nada no repo).
  - Renderização: `pdftoppm -r 200` se existir; senão, script `swift` com `PDFKit` em escala 3x salvando PNG.
  - Fatiamento: corte a coluna de conteúdo em blocos de ~2200px de altura com ~60px de sobreposição (`swift` + `AppKit` se não houver ImageMagick/Pillow).
  - Leia **todos** os blocos, em ordem.
- Comentários da task (QA, cliente, PO) contam como item.

### 2. Montar o checklist

Agrupe por rodada (ex.: "Demanda", "Ajustes 1", comentários). Para cada item: o pedido resumido sem perder detalhe (marcações em vermelho fazem parte), estado na task (marcado/desmarcado/sem checkbox — marcado não prova nada) e a área (site público, orçamento, compra antecipada, admin, operação, CMS). Itens repetidos entre rodadas viram um só, com a rodada mais recente. Pedido ambíguo → anote para perguntar no passo 7.

### 3. Carregar o contexto

- `CLAUDE.md` e specs citados (`docs/features/<feature>/spec.md`; também `docs/ticket-in-advance/specs.md` se a task for dessa área). O spec ajuda a achar o código, mas **a conclusão sai do código**.
- O que mudou: este repo trabalha direto na `main` e muitas vezes sem commit. Use:
  - alterações não commitadas: `git status --porcelain` e `git diff HEAD` (+ arquivos não rastreados);
  - commits da entrega: a partir do ref informado (`git log --oneline <ref>..HEAD`, `git diff --stat <ref>...HEAD`). Sem ref informado, mostre os últimos commits e pergunte a partir de qual começa a task.

### 4. Verificar cada item no código

Classifique:

- **Implementado:** cite `arquivo:linha`.
- **Parcial:** diga o que falta.
- **Não implementado.**
- **Divergente:** faz algo diferente do pedido. Compare com a versão anterior (`git show <ref>:<arquivo>`) quando o pedido citar "como era antes".
- **Não verificável no código:** depende de dado no banco, conteúdo do CMS, imagem no Supabase Storage, config no Stripe/Vercel. Diga o que testar.

Atenção a mudanças globais (CSS em `globals.css`, componente compartilhado, `proxy.ts`) com efeito colateral, commits que desfazem algo pedido, e itens de dados (preço, horário) — confira no código de cálculo (`src/lib/ticket-pricing.ts`, `party-budget.ts`) e no seed/CMS, não só na UI.

Para tasks grandes, divida em agentes `Explore` por área, pedindo `arquivo:linha` como evidência. A classificação final é sua.

### 5. Achar o que foi feito sem estar na task

Cruze diff e commits com o checklist. Mudança de comportamento visível sem item correspondente = "mudança não documentada". Ignore o puramente técnico, mas cite mudanças de build/infra.

### 6. Levantar o que o deploy precisa

Varra o diff atrás do que precisa ser configurado ou executado fora do código:

- env vars novas/renomeadas/removidas (`process.env.*`, `NEXT_PUBLIC_*`), presença no `.env.example`;
- migrations novas em `prisma/migrations/` (precisam ser aplicadas no banco) e mudanças no `prisma/seed.ts` (conteúdo de CMS a criar);
- `next.config.ts` (hosts de imagem), `vercel.json` (crons), `proxy.ts` (roles);
- Stripe (webhook, produtos), DocuSign, Resend (domínio/remetente), Supabase Storage (buckets/arquivos).

Não leia `.env`/`.env.local`. Para cada item: nome exato, evidência (`arquivo:linha`), onde configurar (local, Vercel Preview, Vercel Production, Supabase, Stripe) e se o valor muda por ambiente. Não invente valores.

### 7. Mostrar o resultado e tirar as dúvidas

Mostre, curto e direto: ✅ implementado (por rodada, com evidência); ⚠️ pendente/parcial/divergente/não verificável; mudanças não documentadas; o que o deploy precisa.

Depois pergunte com `AskUserQuestion` (até 4 por chamada; repita se precisar), uma por item em aberto: "foi combinado ou falta fazer?", com opções concretas. Pergunte também os itens ambíguos, se as mudanças não documentadas entram no relatório e se algum item de deploy já foi feito. Decisão duradoura vale salvar na memória do projeto.

### 8. Relatório final

```markdown
# Review de implementação — <título da task>

**Base do diff:** <ref ou "working tree"> · **Resultado:** <N> itens · <N> implementados · <N> pendentes · <N> decididos fora da task
**Deploy:** <"exige configuração — ver seção Deploy" ou "sem configuração extra">

## Deploy

| Item | Onde | Situação | Observação |
| --- | --- | --- | --- |
| <env var / migration / config> | <Vercel Prod/Preview, Supabase, Stripe…> | <pendente/já feito> | <evidência `arquivo:linha`> |

## Pendente

- [ ] <rodada> — <pedido> → <o que falta> (`arquivo:linha`)

## Implementado

### <rodada>

- [x] <pedido> — `arquivo:linha`

## Decidido fora da task

## Mudanças não documentadas na task

## Testar no ambiente

## Atenção
```

Seções vazias saem. A linha **Deploy** fica sempre. Ao final, ofereça em uma linha uma versão não técnica para o cliente/QA (sem nome de arquivo ou termo de código, exceto nomes de env vars).

## Regras

- Não alterar código, spec nem plan; não commitar. Só lê e reporta.
- Não ler `.env`/`.env.local`; não consultar o banco.
- Checkbox marcado na task não é evidência.
- Sem evidência, não afirme. Na dúvida, pergunte.
- Bug fora do escopo: cite em "Atenção" e não corrija.
