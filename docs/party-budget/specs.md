# Party Contract

Este documento especifica os ajustes necessários no fluxo de contratos e reservas de festas após a confirmação do pagamento.

A feature de contratos já existe e deve ser reutilizada e adaptada sempre que possível.

## Objetivo

Automatizar o processo entre o pagamento da reserva e a confirmação definitiva da festa.

## 1. Reserva no Admin

Após a confirmação do pagamento:

1. A reserva deverá aparecer no painel administrativo.
2. Todos os dados informados pelo cliente deverão ser armazenados.
3. O sistema deverá gerar o contrato utilizando esses dados.
4. Um atendente deverá receber uma notificação sobre a nova reserva.
5. O atendente deverá conseguir conferir as informações.

## 2. Contrato

Após a conferência:

- O contrato deverá ser enviado ao cliente para assinatura digital.
- O sistema deverá registrar o status da assinatura.
- Após assinatura/aceite, a reserva deverá ser considerada confirmada.

## 3. Termo e Condições como contrato

Existe a possibilidade de utilizar o próprio aceite do Termo e Condições realizado durante a reserva como aceite contratual.

Essa decisão ainda depende de validação jurídica.

Não implementar a substituição da assinatura digital pelo aceite do termo até que essa regra seja definida.
