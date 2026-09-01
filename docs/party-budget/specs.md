# Party Budget

Este documento especifica a feature de orçamento para festas.

A feature terá como objetivo permitir que o cliente informe alguns dados básicos sobre a festa desejada e receba uma estimativa de orçamento com base nas regras e dados de precificação cadastrados pela empresa.

---

## 1. Orçamento de festas no site

### Objetivo

Permitir que o cliente simule um orçamento para realização de festas no salão de festas da empresa.

### Escopo inicial

Nesta etapa será criado um fluxo no frontend onde o cliente poderá informar os dados necessários para a composição do orçamento.

Exemplos de informações que poderão fazer parte do fluxo:

- Quantidade de pessoas.
- Quantidade de crianças.
- Data ou período desejado.
- Duração da festa.
- Serviços ou adicionais desejados.

Os campos definitivos serão detalhados posteriormente.

---

## 2. Dados de precificação

### Objetivo

Utilizar os dados e regras de precificação da empresa como base para o cálculo do orçamento.

### Escopo inicial

O orçamento não deverá utilizar valores fixos definidos diretamente no frontend.

O sistema deverá consumir os dados de precificação disponíveis no backend e aplicar as regras necessárias para calcular o valor estimado da festa.

A estrutura desses dados, regras de cálculo, adicionais e possíveis condições especiais serão detalhadas posteriormente.

---

## 3. Resultado do orçamento

### Objetivo

Apresentar ao cliente uma estimativa de valor com base nas informações fornecidas.

### Fluxo geral

1. Cliente acessa a área de orçamento de festas.
2. Cliente informa os dados básicos da festa.
3. Sistema consulta os dados de precificação.
4. Sistema calcula o orçamento.
5. Cliente visualiza o valor estimado e o resumo das informações utilizadas no cálculo.

### Detalhamento

O formato da apresentação do orçamento, regras de cálculo, validações, possíveis adicionais e próximos passos após a simulação serão definidos posteriormente.
