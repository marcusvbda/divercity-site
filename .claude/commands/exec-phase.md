---
description: "Executa uma ou mais fases de docs/features/<feature>/plan.md seguindo o playbook do orchestrador, validando cada fase e deixando tudo no working tree (sem commit)"
model: claude-sonnet-5-5
---

# /exec-phase $ARGUMENTS

Recebe `<feature> <fases>` em `$ARGUMENTS`, onde `<feature>` é a pasta em `docs/features/`. `<fases>` pode ser uma ou várias (ex.: `/exec-phase checkin-operacao 2`, `/exec-phase checkin-operacao 1 2 3` ou `/exec-phase checkin-operacao 1-3`).

> **Sem commit.** Este command nunca faz `git commit` nem `git push` (regra absoluta do `CLAUDE.md`; o hook de `.claude/settings.json` bloqueia). Cada fase termina com as alterações no working tree e um registro dos arquivos no `plan.md`. Quem commita é o usuário, quando quiser.

## Antes de qualquer edição

1. Confirme que `docs/features/<feature>/spec.md` e `plan.md` existem. Se não, avise e pare.
2. Confirme que as fases pedidas existem, não estão marcadas como concluídas e não estão bloqueadas. Fase bloqueada (ponto em aberto sem resposta) → pare e pergunte.
3. **Snapshot do working tree:** rode `git status --porcelain` e guarde a lista. Arquivos já modificados antes de começar não são desta execução — informe-os ao reviewer para ele não confundir, e nunca os descarte. Se algum deles for arquivo que a fase vai tocar, avise o usuário antes de seguir.

## Execução

1. Leia [orchestrador.md](../playbooks/orchestrador.md) e siga-o **nesta sessão** (não dispare como subagente), em especial "Quando houver spec/plano em arquivo".
   - O plano da fase já foi aprovado no `/plan-feature`, então não peça nova confirmação para executá-lo — **exceto** se, ao ler o código, a fase se mostrar desatualizada, ambígua ou exigir algo fora do que o plano descreve. Nesse caso, pare e pergunte.
2. Execute as fases **uma de cada vez, em ordem**, com o `spec.md` como fonte da verdade. Não execute fases além das indicadas.
3. Se a fase marca contrato, escreva `docs/features/<feature>/contract.md` antes de disparar o `frontend`.
4. Ao terminar **cada** fase (todas as subtarefas com `PASS` do reviewer e revisão de entrega ok), antes da próxima:
   1. **Validação final da fase**, conforme a skill `engineering-standards`: `npx tsc --noEmit`, `npx eslint <arquivos da fase>`, `npx prisma validate` + `npx prisma generate` se tocou o schema, `npm run build` se tocou cache/config/proxy. Falhou e não conseguiu corrigir → **pare**, avise o usuário e não siga para a próxima fase.
   2. **Atualize o `plan.md`**: marque a fase (`- [x]`), preencha `Arquivos alterados:` com os arquivos desta fase (compare `git status --porcelain` com o snapshot) e registre as ações pendentes do usuário (migration a aplicar, CMS, env var).
   3. **Atualize o `spec.md`** com o que a fase implementou: para cada item de `## Mudanças pendentes` que o plano marca como origem **desta** fase, incorpore-o ao corpo (na seção certa, no estilo do documento, como comportamento implementado, conferindo no código) e remova-o da seção. Itens de fases não executadas ficam. Se a seção ficar vazia, remova-a.
   4. **O spec incorporado não pode depender de `assets/`**: descreva em palavras o que a imagem mostrava (cores, estados, posições, textos, medidas) em vez de linká-la. Remova os links para assets que serviam só ao item incorporado (inclusive em "Anexos e referências"). Assets ainda usados por itens pendentes continuam linkados. Não apague arquivos de `assets/`.
5. Se forem várias fases, siga para a próxima só depois da validação e das atualizações da anterior.

## Relatório final

- Por fase: o que foi implementado, agentes usados, iterações do reviewer e achados não corrigidos, resultado das validações.
- Arquivos alterados por fase (o mesmo registrado no `plan.md`).
- **Ações do usuário**, em destaque: migration a aplicar (com o caminho do `migration.sql` e o comando sugerido — não rode), conteúdo a cadastrar no CMS, env var nova (local e Vercel), configuração em Stripe/DocuSign/Resend.
- Rotas/telas para validar manualmente no `npm run dev`.
- Itens que saíram de `## Mudanças pendentes` para o corpo do spec e o que restou lá.
- Lembrete: nada foi commitado; revise com `git diff` e commite quando quiser. `/update-feature-spec <feature>` só é necessário para reconciliar o spec com o código.

## Regras

- Nunca `git commit`, `git push`, `git reset`, `git checkout -- <arquivo>`, `git stash` ou qualquer comando que descarte/reescreva alterações.
- Nunca escrever no banco (migrate dev/deploy/reset, db push, seed, scripts) — a migration fica como arquivo e o usuário aplica.
- Nunca ler `.env`/`.env.local`; nunca versionar segredos.
