# Precificação

> Estado atual, descrito a partir do código. Este documento descreve o que o sistema faz hoje; o que o usuário quiser mudar entra em `## 3. Anexos e referências

- Compra de ingressos (fluxo, regras de elegibilidade, Stripe, tickets): [`../ticket-in-advance/spec.md`](../ticket-in-advance/spec.md).
- Telas admin de Preços e Serviços e Passaportes: [`../admin-interface/spec.md`](../admin-interface/spec.md) (seções 2.7 e 2.8).

## 4. Pontos em aberto

- Feriado: ingressos dependem da escolha do comprador ("Fim de semana / feriado"); festas só consideram sábado e domingo. Não existe calendário de feriados no sistema.
- Conteúdo não verificável pelo código: valores cadastrados em `PassportType`, `Service` (o seed cria os serviços do sistema com valores iniciais) e no CMS `PriceSection` (`prices`, `disclaimers`).
- Desconto de 50% por idade e PNE, limites de 12 e 60 meses, tamanho do pacote (10) e duração da festa (3 h) são constantes no código, não configuráveis pelo admin.
