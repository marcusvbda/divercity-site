# Party Contract

Este documento especifica os ajustes necessários no fluxo de contratos, confirmação da reserva e gestão dos convidados das festas.

A feature de contratos já existe no sistema e deve ser reutilizada e adaptada sempre que possível.

## Objetivo

Automatizar o processo após o pagamento da reserva, desde a geração e assinatura do contrato até o preenchimento da lista de convidados.

## 1. Reserva no Admin

Após a confirmação do pagamento:

1. A reserva deverá aparecer no painel administrativo.
2. Todos os dados informados pelo cliente deverão ser armazenados.
3. O sistema deverá gerar o contrato utilizando esses dados.
4. Um atendente deverá receber uma notificação sobre a nova reserva.
5. O atendente deverá conseguir conferir as informações.

## 2. Contrato

Após a conferência:

- O contrato deverá ser gerado utilizando as informações fornecidas durante a reserva.
- O contrato deverá ser enviado ao cliente para assinatura digital.
- O sistema deverá registrar o status da assinatura.
- Após a assinatura/aceite, a reserva deverá ser considerada confirmada.

## 3. Termo e Condições como contrato

Existe a possibilidade de utilizar o próprio aceite do Termo e Condições realizado durante a reserva como aceite contratual.

Essa decisão ainda depende de validação jurídica.

NÃO substituir a assinatura digital pelo aceite do termo até que essa regra seja definida.

## 4. Lista de convidados

Após a confirmação da reserva e assinatura/aceite do contrato, o cliente deverá receber um link para preenchimento da lista de convidados.

A lista deverá estar vinculada à respectiva reserva/festa.

## 5. Participantes

A lista deverá diferenciar:

### Crianças

Crianças que utilizarão os brinquedos e precisarão de passaporte.

### Adultos

Adultos que participarão da festa, mas não utilizarão os brinquedos.

## 6. Limite de participantes

O sistema deverá:

- Considerar crianças, aniversariante e adultos no número total de participantes.
- Limitar a festa a no máximo 50 participantes.
- Impedir a inclusão de participantes acima desse limite.
- Exibir de forma clara a quantidade de participantes cadastrados e o limite disponível.

A limitação de 50 participantes também deverá ser apresentada ao cliente antes da contratação da festa.
