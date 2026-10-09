---
description: "Cria docs/features/<feature>/spec.md e fica na thread recebendo, item por item, o que deve entrar no spec (inclui anexos em assets/)"
model: claude-sonnet-5-5
---

# /create-feature-spec $ARGUMENTS

Recebe o nome da feature em `$ARGUMENTS`, em kebab-case (ex.: `/create-feature-spec checkin-operacao`). Se vier vazio, pergunte o nome. Se o nome não estiver em kebab-case, normalize e confirme com o usuário.

Este comando só escreve o spec. Não implemente nada, não altere código e não gere plano (o plano é feito depois, via `/plan-feature $ARGUMENTS`).

## Convenção do spec

O spec descreve o comportamento da feature. Há dois casos:

- **Feature nova** (nada implementado): tudo o que o usuário definir vai para "Requisitos". É o alvo do `/plan-feature`.
- **Feature existente** (já implementada no código): o corpo do spec descreve o **estado atual** (preenchido a partir do código pelo `/update-feature-spec`) e o que o usuário quer **mudar** vai **somente** na seção `## Mudanças pendentes`. Assim o spec nunca mistura "o que o código faz hoje" com "o que ainda vai fazer". O `/plan-feature` usa essa seção como alvo principal. Quando as fases do plano que vieram dela forem concluídas, o `/exec-phase` incorpora essas mudanças ao corpo e as remove da seção.

## Docs legados

Specs antigos fora de `docs/features/` (ex.: `docs/ticket-in-advance/specs.md`) não seguem esta convenção. Se o usuário quiser trazer um deles para o fluxo, copie o conteúdo para `docs/features/<feature>/spec.md` só com o OK dele, sem apagar o original, e trate-o como feature existente (o corpo precisa ser reconciliado com o código via `/update-feature-spec`).

## Passos

1. Verifique `docs/features/$ARGUMENTS/`.
   - Se `spec.md` já existir com conteúdo, não sobrescreva nem recrie: avise o usuário e entre direto no **modo de coleta**. Se o spec tiver `## Mudanças pendentes` ou descrever o estado atual do código, itens novos vão nela (crie a seção se faltar); se for spec de feature nova ainda não implementada, vão em "Requisitos".
   - Se existir mas só tiver o esqueleto vazio, trate como se não existisse (passo 2), sem recriar o arquivo.
2. Pergunte ao usuário: **a feature é nova ou já existe no código?**
   - **Nova:** crie `docs/features/$ARGUMENTS/spec.md` (se ainda não existir) com o esqueleto abaixo, em português, e siga para o passo 4.
   - **Já existe no código, sem spec:** crie o `spec.md` (se ainda não existir) com o esqueleto abaixo e siga para o passo 3.

   ```markdown
   # <Nome da feature>

   ## 1. O que é

   ## 2. Requisitos

   ## 3. Anexos e referências

   ## 4. Pontos em aberto
   ```

   Não preencha conteúdo que o usuário não informou.
3. (Só feature existente sem spec preenchido.) Diga ao usuário para rodar `/update-feature-spec $ARGUMENTS` (preenche o spec a partir do código) e depois voltar a rodar `/create-feature-spec $ARGUMENTS` para definir as mudanças. Pare aqui. A fonte da verdade do estado atual é o código, não a memória do usuário.
4. Avise que o spec está pronto e que você aguarda os itens. A partir daqui, entre em **modo de coleta**.

## Modo de coleta

A cada item recebido:

1. Escreva o item no `spec.md`: em "Requisitos" se a feature é nova, ou em `## Mudanças pendentes` se é existente (nunca edite o corpo que descreve o estado atual, a não ser que o usuário diga que está errado). Reescreva só o necessário para encaixar; preserve o que o usuário já deu. Use as palavras do usuário, em português, sem inventar requisitos, nomes de arquivo, endpoints ou comportamentos.
2. **Dados de negócio** (preço, horário, endereço, telefone, regra de cobrança, texto institucional) só entram como o usuário escreveu. Se o item depender de um valor que ele não deu, registre em "Pontos em aberto".
3. Se o item for ambíguo, contraditório com algo já escrito ou deixar uma lacuna óbvia, **não assuma**: registre em "Pontos em aberto" e, se for importante, faça uma pergunta curta. Lacunas típicas deste projeto:
   - quem acessa (público, cliente com link, `operator`, `admin`);
   - estados vazio/erro/loading e mensagens;
   - mobile (público e operadores usam celular/tablet);
   - conteúdo editável pelo CMS ou fixo no código;
   - pagamento (Stripe): falha, cancelamento, reembolso, webhook;
   - e-mail/notificação (Resend) e contrato (DocuSign);
   - dado novo no banco (o que persiste, o que acontece com registros existentes).
4. Responda com uma confirmação de uma ou duas linhas: onde o item entrou e, se houver, a pergunta pendente. Não repita o spec inteiro.
5. Aguarde o próximo item. Não encerre sozinho nem proponha implementação.

Se o usuário pedir para reorganizar, remover ou editar algo já escrito, faça só isso.

## Anexos

Quando o usuário enviar anexo (imagem, PDF, print, arquivo) ou citar um arquivo local por caminho:

1. Copie o arquivo para `docs/features/$ARGUMENTS/assets/` (crie a pasta se faltar). Se o anexo só existir na conversa e não houver caminho em disco, salve-o lá; se não for possível, avise e peça o caminho.
2. Nome descritivo em kebab-case, preservando a extensão (ex.: `tela-checkin.png`). Nome repetido: não sobrescreva; acrescente sufixo numérico.
3. Linke no spec com caminho relativo, junto ao item, e liste também em "Anexos e referências":

   ```markdown
   ![Tela de check-in](assets/tela-checkin.png)
   [Tabela de preços](assets/tabela-precos.pdf)
   ```

4. Descreva em uma linha o que o anexo mostra ou define. Se for imagem, olhe-a e descreva só o que realmente aparece. Se não entender o papel do anexo, pergunte.
5. Links externos (Figma, Notion, Drive) vão em "Anexos e referências", com uma linha de contexto. Não baixe nem leia conteúdo externo sem o usuário pedir.

## Encerramento

Só encerre quando o usuário disser que terminou (ex.: "terminei", "é isso", "pode fechar"). Então:

1. Releia o `spec.md`, confira se todo anexo em `assets/` está linkado e se os links relativos resolvem.
2. Responda com um resumo curto: seções preenchidas, anexos adicionados e pontos em aberto restantes.
3. Informe que o próximo passo é `/plan-feature $ARGUMENTS` (em thread limpa). Não rode o comando.

## Regras

- Só crie/edite arquivos dentro de `docs/features/$ARGUMENTS/`.
- Nunca commitar nem dar push.
- Não ler arquivos `.env`/`.env.local`.
- Não leia nem analise o código nesta etapa, a menos que o usuário peça; a comparação com o código é do `/plan-feature`.
