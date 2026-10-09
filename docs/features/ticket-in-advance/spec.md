# Compra antecipada de ingressos

> Estado atual, descrito a partir do código. Este documento descreve o que o sistema faz hoje; o que o usuário quiser mudar entra em `## 3. Anexos e referências

- Spec legado (anterior ao fluxo SDD, não reconciliado com este): `docs/ticket-in-advance/specs.md`. Comentários do código citam "spec seção N" dele.

## 4. Pontos em aberto

- Pedidos `pending_payment` nunca expiram e `cancelled` nunca é gravado: não há fluxo de cancelamento, reembolso ou limpeza de pedidos abandonados.
- Se o envio do e-mail falhar (Resend), não há reenvio nem retentativa; o comprovante continua disponível na página de confirmação.
- Valores de excedente não são calculados pelo sistema (cobrança é feita à parte no caixa).
- Conteúdo não verificável pelo código: preços, durações e passaportes cadastrados no banco; textos do `AdvancePurchaseSection` no CMS; configuração do Stripe (webhook, chaves) e do Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
