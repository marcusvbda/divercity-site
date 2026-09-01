---
description: Executa uma task completa a partir de um arquivo Markdown de especificação. Analisa o contexto, identifica subtasks, executa em paralelo com subagentes de contexto limpo, valida o resultado e itera correções com limite de 6 ciclos.
argument-hint: $ARGUMENTS
---

# /execute-task — executar task

**Instruções da task:** $ARGUMENTS

O argumento deve apontar para um arquivo `.md` contendo a especificação, contexto, requisitos e orientações da task.

Exemplo:

```bash
/execute-task ./task.md
```

Leia integralmente o documento informado em `$ARGUMENTS` antes de iniciar qualquer implementação.

O objetivo deste command é executar a task completa, utilizando um agente principal para análise, coordenação e validação, e subagentes com contexto limpo para executar as subtasks.

---

## Regras obrigatórias

### Nunca commitar

NUNCA execute:

```bash
git commit
git push
```

ou qualquer operação equivalente de commit, push ou alteração permanente de histórico.

Somente faça commit se isso for explicitamente solicitado pelo usuário.

### Escopo mínimo

NÃO altere nada que não seja necessário para cumprir a task.

Não faça por iniciativa própria:

- refactors não solicitados;
- mudanças arquiteturais;
- limpeza de código;
- renomeações;
- alterações de estilo fora do escopo;
- upgrades de dependências;
- mudanças de configuração não necessárias;
- correções de problemas não relacionados;
- funcionalidades adicionais.

Se encontrar algo relevante fora do escopo, mencione no relatório final, mas não altere.

### Não assumir requisitos

O arquivo informado em `$ARGUMENTS` é a principal fonte de verdade da execução.

Antes de implementar:

1. Leia todo o documento.
2. Leia os arquivos e documentos referenciados.
3. Investigue o código relacionado.
4. Entenda o estado atual da implementação.
5. Determine exatamente o que precisa ser alterado.

Não faça perguntas que possam ser respondidas analisando o código, documentação ou padrões existentes no projeto.

Porém, se existir qualquer ambiguidade de requisito que possa afetar:

- regra de negócio;
- comportamento;
- arquitetura;
- UX;
- contrato de API;
- persistência;
- integração;
- segurança;
- escopo;

o agente principal DEVE perguntar ao usuário antes de implementar.

Nunca escolha arbitrariamente uma interpretação quando os documentos não forem claros o suficiente.

---

## Modelo de execução

A execução deve seguir obrigatoriamente este fluxo:

```text
Agente principal
      ↓
Análise da task
      ↓
Criação das subtasks
      ↓
Subagentes com contexto limpo
      ↓
Execução paralela quando possível
      ↓
Agente principal revisa
      ↓
Correções se necessário
      ↓
Validação integrada
      ↓
Revisão final
      ↓
Relatório
```

O agente principal é responsável por manter a visão completa da task.

Os subagentes são responsáveis apenas pelas subtasks delegadas.

---

## Etapa 1 — Entender a task

O agente principal deve ler completamente:

```text
$ARGUMENTS
```

Depois, investigar todo o contexto necessário no projeto.

Antes de executar qualquer alteração, determine:

1. Qual é o objetivo final da task.
2. Quais requisitos são explícitos.
3. Quais critérios de aceite precisam ser atendidos.
4. O que já existe no projeto.
5. O que já está implementado.
6. O que ainda precisa ser implementado.
7. Quais arquivos ou áreas provavelmente serão afetados.
8. Quais dependências existem entre as mudanças.
9. Como cada alteração poderá ser validada.

Não implemente diretamente enquanto ainda estiver entendendo o problema.

---

## Etapa 2 — Resolver dúvidas

Depois de entender a task, identifique possíveis dúvidas ou ambiguidades.

### Dúvidas resolvíveis pelo projeto

Primeiro tente resolver investigando:

- código existente;
- implementações semelhantes;
- tipos;
- testes;
- documentação;
- contratos;
- convenções do projeto;
- arquivos referenciados pela task.

Não pergunte ao usuário algo que possa ser determinado com segurança pelo próprio projeto.

### Dúvidas de requisito

Se alguma decisão continuar ambígua e puder alterar o resultado esperado, o agente principal deve perguntar ao usuário.

Agrupe as perguntas necessárias sempre que possível.

Somente continue a execução quando houver compreensão suficiente da task.

---

## Etapa 3 — Criar subtasks

O agente principal deve dividir a task em subtasks pequenas, objetivas e verificáveis.

Cada subtask deve possuir internamente:

```text
Objetivo
Contexto necessário
Arquivos ou área relevante
Requisitos
Dependências
Critérios de aceite
Forma de validação
```

Identifique também:

- subtasks independentes;
- subtasks que dependem de outras;
- subtasks que podem ser executadas simultaneamente.

Não paralelize tarefas que tenham dependência direta entre si ou que possam gerar conflitos desnecessários nos mesmos arquivos.

---

## Etapa 4 — Executar com subagentes

Cada subtask deve ser delegada para um subagente com **contexto limpo**.

O subagente não deve receber todo o histórico de raciocínio do agente principal.

Forneça apenas o necessário para aquela execução:

```text
Objetivo da subtask
Contexto relevante
Requisitos
Arquivos ou áreas relevantes
Restrições
Critérios de aceite
Validação esperada
```

Subtasks independentes devem ser executadas em paralelo sempre que possível.

Cada subagente deve:

1. Investigar os arquivos necessários.
2. Entender o comportamento atual antes de alterar.
3. Implementar somente sua subtask.
4. Fazer a menor alteração necessária.
5. Validar sua implementação quando possível.
6. Retornar ao agente principal:

   - arquivos alterados;
   - alterações realizadas;
   - validações executadas;
   - resultado das validações;
   - riscos ou pendências identificadas.

Subagentes também estão proibidos de criar commits ou executar push.

---

## Etapa 5 — Revisar cada entrega

Quando os subagentes terminarem, o controle retorna ao agente principal.

O agente principal NÃO deve assumir que uma subtask está correta apenas porque o subagente informou sucesso.

Revise diretamente as alterações.

Use quando aplicável:

```bash
git status
git diff
```

Leia também os arquivos alterados.

Compare cada implementação com:

- documento original da task;
- objetivo da subtask;
- critérios de aceite;
- comportamento esperado;
- padrões existentes do projeto;
- impacto sobre outras partes da task.

Cada subtask deve ser classificada como:

```text
APROVADA
```

ou:

```text
PRECISA DE CORREÇÃO
```

---

## Etapa 6 — Loop de correção

Se uma subtask precisar de correção, delegue novamente a correção para um agente com contexto limpo.

Forneça:

```text
Objetivo original
Estado atual da implementação
Problema encontrado
Comportamento esperado
Critérios necessários para aprovação
```

Não peça apenas para "revisar novamente".

Informe concretamente o que está incorreto.

O fluxo é:

```text
Executar
   ↓
Revisar
   ↓
Está correto?
 ┌───────┐
Sim     Não
 ↓       ↓
Aprovar Corrigir
```

Existe um limite global de:

```text
MAX_LOOPS = 6
```

Cada ciclo representa uma nova rodada relevante de:

```text
executar → revisar → corrigir → validar
```

Não entre em loops indefinidos.

Antes de iniciar um novo ciclo, confirme que existe progresso real.

Se o mesmo problema continuar acontecendo, investigue a causa raiz antes de tentar novamente.

Caso o limite de 6 ciclos seja atingido sem conclusão, interrompa a execução e reporte claramente o bloqueio.

---

## Etapa 7 — Validação integrada

Depois que todas as subtasks estiverem aprovadas individualmente, valide a task como um todo.

Revise:

```bash
git status
git diff
```

Confirme que as alterações combinadas atendem ao objetivo original.

Execute todas as validações relevantes disponíveis no projeto, quando aplicável:

```text
testes específicos
testes automatizados
typecheck
lint
build
validações funcionais
```

Não execute comandos destrutivos apenas para validar.

A validação final deve responder:

1. Todos os requisitos da task foram implementados?
2. Todos os critérios de aceite foram atendidos?
3. As subtasks funcionam corretamente juntas?
4. Existe alguma regressão aparente?
5. Existem erros de tipo?
6. Existem erros de lint relevantes?
7. O build continua funcionando?
8. Existem testes quebrados relacionados às mudanças?
9. Algum requisito foi esquecido?
10. Alguma alteração fora do escopo foi feita?

Passar em build ou testes isoladamente NÃO significa que a task está concluída.

O objetivo funcional descrito em `$ARGUMENTS` deve estar atendido.

---

## Etapa 8 — Revisão final independente

Quando a implementação parecer concluída, crie um novo agente com contexto limpo para realizar uma revisão final independente.

Esse agente deve receber:

- documento original da task;
- critérios de aceite;
- estado atual dos arquivos relevantes;
- diff final.

Não forneça justificativas dos agentes responsáveis pela implementação.

O revisor deve verificar independentemente:

```text
- se todos os requisitos foram implementados;
- se algum requisito foi ignorado;
- se existem comportamentos incorretos;
- se existem regressões;
- se existem alterações desnecessárias;
- se existem edge cases relevantes ignorados;
- se existe algo que impeça considerar a task concluída.
```

Se forem encontrados problemas válidos, volte ao fluxo de correção.

O limite global de 6 ciclos continua válido.

---

## Critério de conclusão

A task somente pode ser considerada concluída quando:

- [ ] Todos os requisitos de `$ARGUMENTS` foram atendidos.
- [ ] Todas as subtasks foram aprovadas.
- [ ] O diff final foi revisado.
- [ ] As validações relevantes foram executadas.
- [ ] Não existem erros conhecidos relacionados à implementação.
- [ ] As alterações funcionam corretamente em conjunto.
- [ ] A revisão final não encontrou bloqueadores.
- [ ] Nenhuma alteração fora do escopo foi realizada.
- [ ] Nenhum commit ou push foi realizado.

Se algum desses pontos não puder ser confirmado, não declare a task como concluída.

---

## Caso o limite de 6 ciclos seja atingido

Se não for possível concluir a task após 6 ciclos, pare a execução.

Não continue tentando indefinidamente.

Entregue:

```text
Status: BLOQUEADO ou PARCIAL

O que foi concluído
O que ainda falta
Problemas encontrados
Tentativas realizadas
Causa provável do bloqueio
Informação ou decisão necessária para continuar
```

---

## Relatório final

Ao terminar a execução, entregue um relatório objetivo.

Formato:

```markdown
# Resultado

Status: CONCLUÍDO | PARCIAL | BLOQUEADO

## Implementado

- ...
- ...

## Arquivos alterados

- `path/file`
- `path/file`

## Validações realizadas

- `comando ou validação` → passou
- `comando ou validação` → passou

## Revisão final

- Requisitos atendidos: sim/não
- Alterações fora do escopo: nenhuma / descrição
- Problemas conhecidos: nenhum / descrição

## Pendências

Nenhuma.

ou:

- ...
```

Não descreva extensivamente o raciocínio interno dos agentes.

O relatório deve focar no que foi executado, validado e no estado final da task.

---

## Regras finais

Durante toda a execução:

- NUNCA fazer commit.
- NUNCA fazer push.
- NUNCA alterar algo fora do escopo sem autorização.
- NUNCA implementar funcionalidade não solicitada.
- NUNCA assumir requisito relevante que esteja ambíguo.
- NUNCA esconder falhas encontradas durante validação.
- NUNCA declarar conclusão apenas porque build ou testes passaram.
- NUNCA declarar conclusão sem revisar o diff final.
- SEMPRE investigar o projeto antes de perguntar algo que o código possa responder.
- SEMPRE perguntar ao usuário quando faltar informação necessária para compreender corretamente o requisito.
- SEMPRE manter o agente principal como responsável pela validação final.

A responsabilidade deste command é entregar o objetivo descrito em `$ARGUMENTS` de forma correta, mínima, validada e estritamente dentro do escopo.
