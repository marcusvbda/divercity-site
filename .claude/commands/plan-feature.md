---
description: "Lê o spec, compara com o que já está implementado e gera plan.md em fases com o que falta para alinhar o código ao spec"
model: claude-opus-5-5
---

# /plan-feature $ARGUMENTS

Recebe o nome da feature (pasta em `docs/features/`) em `$ARGUMENTS` (ex.: `/plan-feature checkin-operacao`).

Não implemente nada nesta etapa. Só planeje. O **spec é a fonte da verdade**: o plano cobre a diferença entre o que o spec define e o que o código já faz.

## Passos

1. Leia `docs/features/$ARGUMENTS/spec.md`. Se não existir, avise e pare — este comando não cria spec. O plano é salvo em `docs/features/$ARGUMENTS/plan.md`.
2. Extraia a lista de **requisitos verificáveis**: comportamentos, telas/componentes, rotas de página, endpoints e contratos, modelos/campos do banco, regras de negócio (preço, horário, duração, status), roles de acesso, mensagens, estados (loading/erro/vazio), integrações (Stripe, DocuSign, Resend, Storage), conteúdo de CMS e critérios de aceite. Se houver `## Mudanças pendentes`, ela é o **alvo**; o resto do spec é contexto e invariantes a preservar. Sem essa seção, o spec inteiro é o alvo. Leia também os arquivos de `assets/` referenciados.
3. Leia o `CLAUDE.md`, as skills de `.claude/skills/` relevantes e o código relacionado (grep pelos termos-chave, rotas, componentes, models do `prisma/schema.prisma`, schemas em `src/lib/schemas/`, tipos em `src/types/`, rotas em `src/app/api/`). Em trabalho grande, divida a leitura em agentes `Explore` em paralelo (ex.: dados+API, UI pública, admin/operação); eles só leem e reportam.
4. Classifique cada requisito comparando spec x código atual:
   - **Implementado e alinhado:** não entra no plano.
   - **Parcial:** existe, mas falta parte.
   - **Divergente:** o código faz diferente; o código muda para seguir o spec.
   - **Ausente:** nada implementado.
   - **Não verificável:** não foi possível confirmar (explique por quê — ex.: depende de dado no banco, de config no Stripe, de conteúdo no CMS).

   Use `git log`/`git diff` só para entender o que mudou recentemente; a conclusão sai da leitura do código atual.
5. Apresente ao usuário, antes de gerar o plano:
   - **Diagnóstico**: tabela requisito -> estado, com arquivo de evidência quando existir.
   - **Ambiguidades**, **Contradições** (entre si ou com código/convenções), **Lacunas** (comportamento não especificado que o plano precisaria assumir).
   - **Dados de negócio faltando**: valores que o spec não dá e o código precisaria (nunca invente).
   - **Impacto no banco**: models/campos novos ou alterados, efeito em registros existentes, migration necessária.
   - **Código sem respaldo no spec**: comportamento existente que o spec não menciona. Não planeje remover; só sinalize.

   Se algo mudar o plano de forma relevante, **pergunte e espere a resposta** antes de gerar o plano. Grave cada decisão no `spec.md` (em "Requisitos" ou `## Mudanças pendentes`, com texto objetivo) — essa é a única edição permitida no spec. Pontos menores que você assumir vão no plano como "Premissa". Se o usuário não puder responder agora, registre em "Pontos em aberto" do spec e marque a fase afetada como bloqueada.
6. Quebre **somente o que falta** em **fases pequenas** e entregáveis, em ordem de dependência (normalmente: dados → regra/API → UI). Cada fase com:
   - Camadas tocadas (dados / API / UI) e agente(s) executor(es): `backend`, `frontend`.
   - Requisito(s) do spec atendidos.
   - Origem: itens de `## Mudanças pendentes` que a fase atende (citar o texto) ou "diferença spec x código". O `/exec-phase` usa isso para mover itens de pendente para implementado.
   - Gap atual -> estado desejado.
   - Arquivos/áreas principais (caminhos exatos).
   - Migration: sim/não; se sim, o que muda e que o usuário precisará aplicar.
   - Contrato: se a fase cria/altera endpoint **e** a tela que o consome, marque que precisa de `docs/features/$ARGUMENTS/contract.md` antes do `frontend`.
   - Critério de pronto objetivo.
   - Como verificar: `npx tsc --noEmit`, eslint nos arquivos, rota/tela a abrir no `npm run dev`, chamada de API a testar, cenário de pagamento de teste etc.
   - Ações do usuário fora do código (aplicar migration, cadastrar conteúdo no CMS, env var na Vercel, config no Stripe).

   Cada fase deve ser **autossuficiente**: quem executa começa com contexto limpo, então traga na fase os caminhos exatos, decisões, premissas e trechos do spec/anexos relevantes. Não dependa de "como combinado".

   Se tudo já estiver alinhado, diga isso, não gere plano e pare.
7. Salve em `docs/features/$ARGUMENTS/plan.md` como checklist markdown, uma seção por fase, com caixa de status (`- [ ] Fase N — <nome>`). No topo: caminho do spec e resumo do diagnóstico (contagem por estado). Cada fase termina com um bloco vazio `Arquivos alterados:` que o `/exec-phase` preenche. Se o plano já existir, leia-o antes e preserve fases concluídas, ajustando só o que mudou.
8. Apresente o resumo do plano e pare — a execução é via `/exec-phase $ARGUMENTS <fase>`.

## Regras

- Não altere código. Só crie/atualize `docs/features/$ARGUMENTS/plan.md`; no `spec.md`, só grave decisões do usuário (passo 5).
- Nunca commitar nem dar push.
- Não ler arquivos `.env`/`.env.local`. Não consultar nem escrever no banco.
- Se o código viola uma invariante do spec, trate como **Divergente** e destaque ao usuário.
