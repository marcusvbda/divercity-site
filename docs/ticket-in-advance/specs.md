# Ticket in Advance

Este documento especifica a compra antecipada de passaportes pelo site e o processo de check-in no Divercity Park.

## Objetivo

Permitir que o cliente compre antecipadamente e chegue ao parque com um QR Code para realizar a conferência e entrada, reduzindo a necessidade de atendimento no caixa.

## 1. Dados da compra

Para cada criança, solicitar:

- Nome.
- Data de nascimento.
- Dados do responsável.
- Telefone.
- WhatsApp.
- Tipo de passaporte.
- Informações sobre acompanhante, quando aplicável.

A data de nascimento é obrigatória.

## 2. Regras de preço

### Crianças de 0 a 12 meses

50% de desconto.

### PNE

50% de desconto.

### Crianças a partir de 1 ano

Valor integral do passaporte.

O sistema deverá calcular automaticamente o valor aplicável utilizando a data de nascimento informada.

## 3. Crianças de 0 a 4 anos

Uma criança de 0 a 4 anos possui direito a 1 acompanhante gratuito maior de 18 anos.

Durante a compra, perguntar se a criança ficará com ou sem acompanhante.

### Com acompanhante

- Informar que o acompanhante deve possuir mais de 18 anos.
- Solicitar os dados necessários do acompanhante.
- Informar que esse acompanhante está incluído gratuitamente.

### Sem acompanhante

O responsável deverá:

- Ler e aceitar o Termo de Responsabilidade.
- Informar telefone e WhatsApp.
- Autorizar contato caso necessário.

O aceite deverá ficar registrado.

O check-in deverá apresentar um alerta indicando que a criança ficará sem acompanhante.

## 4. Acompanhantes adicionais

Permitir adicionar acompanhantes adicionais durante a compra.

Deixar claro que:

- O ingresso de acompanhante não permite utilização dos brinquedos.
- Para utilizar os brinquedos, o acompanhante deverá adquirir o passaporte integral correspondente.

## 5. Pagamento via Stripe

O pagamento da compra antecipada deverá ser realizado utilizando o Stripe.

O sistema já possui no painel administrativo uma área onde o administrador configura as credenciais do Stripe.

### Regras

- Utilizar exclusivamente as credenciais do Stripe configuradas no Admin.
- NÃO adicionar credenciais fixas diretamente no código.
- O fluxo de compra deverá criar um checkout da Stripe com base nos tickets/passaportes selecionados e nos valores calculados pelas regras do sistema.
- A compra somente deverá ser considerada confirmada após a confirmação do pagamento pelo Stripe.
- O QR Code somente deverá ser gerado após a confirmação do pagamento.

## 6. Confirmação da compra e QR Code

Após a confirmação do pagamento:

- Gerar o QR Code relacionado à compra.
- Exibir uma tela de confirmação para o cliente.
- Exibir o QR Code diretamente nessa tela.
- Disponibilizar uma opção para baixar/salvar a imagem do QR Code.
- O cliente também poderá simplesmente tirar um print da tela.
- Enviar o QR Code para o e-mail informado durante a compra.
- O e-mail deverá conter as principais informações da compra e as orientações necessárias para utilização do ingresso.

O mesmo QR Code apresentado na tela deverá ser o enviado por e-mail.

## 7. Check-in pelo Admin

O painel administrativo deverá permitir a leitura do QR Code.

Após a leitura, apresentar:

- Dados da criança.
- Data de nascimento/idade.
- Tipo de passaporte.
- Valor pago.
- Informações do acompanhante.
- Confirmação de que o acompanhante possui mais de 18 anos, quando aplicável.
- Existência de Termo de Responsabilidade, quando aplicável.
- Telefone e WhatsApp do responsável.
- Alertas específicos daquela compra.

Fluxo:

QR Code → conferência → validação → entrada.

## 8. Avisos no comprovante

Destacar no comprovante:

**IMPORTANTE: APRESENTE UM DOCUMENTO COM FOTO DA CRIANÇA NA ENTRADA DO PARQUE PARA UTILIZAR O PASSAPORTE.**

Para crianças de 0 a 4 anos com acompanhante gratuito, informar também a necessidade de comprovar que o acompanhante possui mais de 18 anos.

Para crianças sem acompanhante, informar que o Termo de Responsabilidade deverá ter sido aceito e que telefone/WhatsApp para contato são obrigatórios.

## Fora do escopo atual

Nesta primeira versão NÃO será criada uma área autenticada para o cliente consultar suas compras.

O acesso do cliente à compra será feito apenas através:

- Da tela de confirmação após o pagamento.
- Do QR Code exibido nessa tela.
- Do e-mail enviado após a confirmação da compra.

Também não fazem parte desta implementação:

- Totem de autoatendimento.
- Retirada automática de pulseira RFID.
- Controle automático de tempo.
- Processo automatizado de saída.

Uma área de cliente com histórico de compras poderá ser implementada futuramente.
