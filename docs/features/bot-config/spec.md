# Configuração do Bot

## 1. O que é

Página "Chat bot" no admin para configurar as instruções do bot, editando o datatable do n8n de "Instruções do bot".

## 2. Requisitos

### 2.1 Acesso e navegação

- Novo item **"Chat bot"** no menu do admin, dentro do grupo **"Configurações"** (depois de "API tokens"), apontando para `/admin/chat-bot`.
- Acesso **apenas para admin**. O usuário `operator` **não tem acesso** a essa página.

### 2.2 Integração com o n8n

- Os campos da página alteram um **único datatable** do n8n: **Instruções do bot**.
- Cada campo da página é uma **coluna** desse datatable.
- O id do datatable vem do env: `N8N_INSTRUCOES_TABLE_ID`.
- O datatable tem **uma única linha** (a configuração vigente):
  - Se o datatable estiver vazio, a página mostra os campos vazios e, ao salvar, cria essa primeira linha.
  - Depois disso, a página só edita essa primeira linha. **Nunca adiciona uma nova linha.**
- A conexão com o n8n deve seguir o mesmo padrão da feature de FAQs, que já está implementada.

### 2.3 Campos editáveis

| Campo                 | Tipo de input         | Observação                                                                 |
| --------------------- | --------------------- | -------------------------------------------------------------------------- |
| `PERSONA_E_REGRAS`    | Textarea grande       |                                                                            |
| `FATOS_DO_PARQUE`     | Textarea grande       |                                                                            |
| `AVISOS_DE_HOJE`      | Textarea              |                                                                            |
| `FERIADOS`            | Lista de datas (pills) | Datas adicionadas uma a uma por input de calendário; cada uma pode ser removida |
| `MSG_HANDOFF_CLIENTE` | Textarea              |                                                                            |
| `MSG_MIDIA`           | Textarea              |                                                                            |
| `MSG_CONFIRMACAO`     | Textarea              |                                                                            |

- `FERIADOS`: exibido como lista de **pills** (datas em dd/mm/aaaa), em ordem crescente e sem duplicatas.
  - A data é escolhida em um input de calendário e adicionada com o botão "Adicionar" (ou Enter); cada pill tem um X para removê-la.
  - Descrição: "Adicione as datas uma a uma; serão salvas no formato AAAA-MM-DD separadas por vírgula".
  - Valor gravado na coluna: datas em `AAAA-MM-DD` separadas por vírgula, sem espaços (ex.: `2026-11-02,2026-11-15`); vazio = `''`.
  - O servidor **não valida** o formato das datas. Valores já salvos que não sejam `AAAA-MM-DD` aparecem como pill com o texto original e podem ser removidos.
- Rótulo de cada campo: texto amigável em pt-BR com o nome da coluna do n8n em texto pequeno ao lado:

  | Coluna                | Rótulo                         |
  | --------------------- | ------------------------------ |
  | `PERSONA_E_REGRAS`    | Persona e regras               |
  | `FATOS_DO_PARQUE`     | Fatos do parque                |
  | `AVISOS_DE_HOJE`      | Avisos de hoje                 |
  | `FERIADOS`            | Feriados                       |
  | `MSG_HANDOFF_CLIENTE` | Mensagem de handoff ao cliente |
  | `MSG_MIDIA`           | Mensagem de mídia              |
  | `MSG_CONFIRMACAO`     | Mensagem de confirmação        |

- Limite de **20.000 caracteres por campo**, validado no servidor e no `maxLength` do textarea.

### 2.4 Salvar

- Um único botão salva **todos os campos de uma vez**.

### 2.5 Estados e mensagens

Textos definidos a critério da implementação, conforme pedido do usuário. A proposta abaixo pode ser ajustada:

| Situação                          | Comportamento / texto                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Carregando os valores do n8n      | Skeleton no lugar dos campos; botão de salvar desabilitado.                                                   |
| Erro ao carregar (n8n indisponível) | "Não foi possível carregar as configurações do bot. Tente novamente em instantes." + botão "Tentar novamente". |
| Datatable vazio                   | Campos vazios, sem mensagem de erro.                                                                          |
| Salvando                          | Botão desabilitado com o texto "Salvando…".                                                                   |
| Sucesso ao salvar                 | Toast: "Configurações do bot salvas com sucesso."                                                             |
| Erro ao salvar                    | Toast de erro: "Não foi possível salvar as configurações do bot. Tente novamente." Os valores digitados continuam nos campos. |

## 3. Anexos e referências

- Feature de FAQs (`docs/features/faqs/`): referência para o padrão de conexão com o n8n.

## 4. Pontos em aberto

_Nenhum no momento._
