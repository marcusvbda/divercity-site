---
description: "Compara docs/features/<feature>/spec.md com o código atual e atualiza o spec, usando o código como fonte da verdade"
model: claude-sonnet-5-5
---

# /update-feature-spec $ARGUMENTS

Recebe o nome da feature (pasta em `docs/features/`) em `$ARGUMENTS`, ex.: `checkin-operacao`. Se vier vazio, liste as pastas de `docs/features/` e pergunte qual.

O spec descreve o estado atual do sistema. Aqui o **código é a fonte da verdade**: quando spec e código divergem, o spec é que muda. Não altere código.

## Passos

1. Leia `docs/features/$ARGUMENTS/spec.md` inteiro. Se não existir, pare e peça para rodar `/create-feature-spec $ARGUMENTS` antes. Se existir só com o esqueleto vazio (feature que já existe no código), siga o modo **preencher**: descubra a feature no código (grep pelo nome, rotas de página, `src/app/api/**`, componentes, models do Prisma, schemas Zod) e escreva o estado atual nas seções existentes, criando as necessárias. Pergunte ao usuário se a identificação da feature no código (arquivos e rotas) está certa antes de escrever.
   - **Mudanças pendentes:** essa seção descreve o que o usuário **quer** mudar, não o estado atual. Nunca a trate como "errada" nem a apague por divergir do código. Para cada item: se o código já faz o que o item descreve, incorpore ao corpo e remova da seção; se faz só parte, mantenha só a parte que falta; se não faz nada, mantenha. Se a seção ficar vazia, remova-a.
2. Extraia do spec as afirmações verificáveis: caminhos de arquivo, nomes de componente/rota/endpoint/model/campo/enum, roles de acesso, status HTTP e mensagens, valores constantes, comportamentos por tela, invariantes.
3. Verifique cada uma no código (leia o `CLAUDE.md` antes). Fontes típicas: `prisma/schema.prisma` e `prisma/migrations/`, `src/lib/**`, `src/lib/schemas/`, `src/types/`, `src/app/api/**`, `src/app/**` (páginas), `src/components/**`, `src/proxy.ts`. Use `git log`/`git diff` só para achar o que mudou desde a última edição do spec; a conclusão sai do código atual.
4. Procure o que o spec **não** cobre: comportamento, endpoint, campo, tela ou regra novos que não estão documentados.
5. Classifique cada divergência:
   - **Errado:** o spec diz X, o código faz Y.
   - **Obsoleto:** o spec cita algo que não existe mais.
   - **Faltando:** o código faz algo que o spec não descreve.
   - **Não verificável:** depende de dado no banco, conteúdo do CMS, config externa (Stripe, Vercel) — explique. Não invente; mantenha o texto e marque.
6. Para spec grande, divida a verificação em agentes `Explore` em paralelo (ex.: dados+API, UI). Eles só leem e reportam; a edição é sua.
7. Atualize `docs/features/$ARGUMENTS/spec.md` com edições cirúrgicas, só nas partes divergentes:
   - preserve estrutura, numeração, idioma (português) e tom;
   - corrija valores e nomes exatos, remova o obsoleto, acrescente o que faltava na seção certa;
   - não reescreva trechos corretos nem "melhore" o texto;
   - mantenha "Pontos em aberto" em dia.
8. Releia as partes editadas contra o código uma última vez.

## Resposta ao usuário

- quantas divergências por categoria;
- o que mudou no spec (`seção: antes -> depois`);
- itens não verificáveis e o que falta para verificá-los;
- se nada divergiu, diga isso e não edite o arquivo.

## Regras

- Nunca commitar nem dar push.
- Não ler `.env`/`.env.local`; não consultar nem escrever no banco.
- Só edite `docs/features/$ARGUMENTS/spec.md` (nunca o `plan.md`). Bug no código: relate ao usuário; não corrija e não registre como "comportamento esperado" sem destacar que parece bug.
- Se o código contradiz uma invariante do spec, trate como divergência **e** destaque que a invariante foi violada.
