# Ticket in Advance

Este documento especifica a feature de compra antecipada de ingressos.

A feature será dividida em duas frentes principais:

## 1. Compra antecipada de ingressos no site

### Objetivo

Permitir que o cliente compre ingressos antecipadamente pelo site.

### Escopo inicial

Nesta etapa será criado o fluxo de compra no frontend do site.

O cliente deverá:

- Selecionar o ingresso desejado.
- Informar os dados necessários para a compra.
- Informar os dados necessários da criança.
- Realizar o pagamento.
- Receber uma confirmação da compra.
- Receber um QR Code relacionado ao ingresso adquirido.

### Detalhamento

Os campos, regras de negócio, formas de pagamento, tipos de ingresso e comportamento completo deste fluxo serão detalhados posteriormente.

---

## 2. Validação de ingressos no Admin

### Objetivo

Permitir que a equipe administrativa valide os ingressos comprados antecipadamente.

### Escopo inicial

Dentro do painel administrativo deverá existir um fluxo para leitura do QR Code apresentado pelo cliente.

A partir da leitura, o sistema deverá identificar o ingresso correspondente e informar se ele pode ou não ser utilizado.

### Fluxo geral

1. Cliente apresenta o QR Code.
2. Funcionário realiza a leitura pelo Admin.
3. Sistema consulta os dados da compra.
4. Sistema verifica a validade do ingresso.
5. Admin informa se o ingresso pode ser utilizado.
6. Caso válido, o ingresso é marcado conforme a regra de utilização que será definida posteriormente.

### Detalhamento

As regras de validação, estados possíveis do ingresso, permissões de acesso, informações apresentadas ao funcionário e comportamento após a validação serão detalhados posteriormente.
