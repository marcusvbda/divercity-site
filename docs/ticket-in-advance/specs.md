# Ticket in Advance

Este documento especifica a evolução da compra antecipada de passaportes pelo site, o processo de pagamento, geração dos ingressos e o fluxo operacional de entrada e saída no Divercity Park.

A compra antecipada já existe parcialmente no sistema. Antes de criar novos componentes, páginas, entidades ou estruturas, ANALISE A IMPLEMENTAÇÃO ATUAL e reutilize/adapte tudo que já existir sempre que possível.

## Objetivo

Permitir que o cliente compre antecipadamente seus passaportes pelo site, realize o pagamento online e receba um QR Code/código de acesso para utilizar no parque.

No parque, uma área operacional deverá permitir:

Compra → Pagamento → QR Code → Check-in → Controle de tempo → Check-out

O objetivo é reduzir a dependência do caixa para entrada e, ao mesmo tempo, preparar a arquitetura para futuras funcionalidades operacionais, como caixa, venda presencial e totem.

---

# IMPORTANTE - Implementação existente

O sistema já possui:

- Uma implementação parcial da compra antecipada.
- Entidades e estruturas de preços.
- Painel administrativo.
- Usuários administrativos.
- Configuração das credenciais do Stripe pelo Admin.
- CMS e demais configurações administrativas.

Antes de implementar qualquer coisa:

1. Analise o código existente.
2. Identifique o que já pode ser reutilizado.
3. Prefira evoluir componentes, entidades e fluxos existentes.
4. NÃO duplique estruturas que já resolvam o mesmo problema.
5. Preserve o padrão arquitetural atual do projeto.

---

# IMPORTANTE - UX/UI

Esta feature terá bastante interação com usuários finais e operadores do parque.

UTILIZE A SKILL `UI UX Pro Max Skill` durante a criação/refatoração das interfaces desta feature.

A experiência deve ser simples, bonita e objetiva.

Isso vale principalmente para:

- Fluxo de compra antecipada.
- Seleção de passaportes.
- Checkout.
- Confirmação da compra.
- Apresentação do QR Code.
- Área operacional.
- Busca por código.
- Check-in.
- Check-out.
- Controle de tempo.
- Alertas de documentação.
- Alertas de tempo excedente.

Manter consistência com a identidade visual e os componentes já existentes no projeto.

A interface operacional deve priorizar velocidade de uso, leitura fácil das informações e ações claras, pois será utilizada por funcionários durante o funcionamento do parque.

---

# 1. Preços

O sistema já possui estrutura de preços e gerenciamento desses valores pelo Admin.

Os preços relacionados à compra antecipada devem utilizar essa estrutura existente.

NÃO deixar preços fixos/hardcoded no código.

O administrador deverá conseguir alterar os preços pelo painel administrativo sem necessidade de deploy ou alteração de código.

Caso a estrutura atual de preços precise ser adaptada para suportar os novos tipos de preço, adapte a estrutura existente em vez de criar uma solução paralela.

---

# 2. Dados da compra

A compra poderá conter uma ou mais crianças/passaportes.

Para cada criança, solicitar as informações necessárias, incluindo:

- Nome.
- Data de nascimento.
- Tipo de passaporte.
- Indicação de PNE quando aplicável.
- Informações sobre acompanhante quando aplicável.

Também solicitar os dados necessários do responsável pela compra:

- Nome.
- E-mail.
- Telefone.
- WhatsApp.
- Demais dados necessários para identificação da compra.

A data de nascimento da criança é obrigatória.

O e-mail é necessário para envio do comprovante e QR Code após o pagamento.

---

# 3. Regras de preço

## Crianças de 0 a 12 meses

Aplicar 50% de desconto sobre o valor aplicável do passaporte.

## PNE

Aplicar 50% de desconto.

## Crianças a partir de 1 ano

Aplicar o valor integral do passaporte correspondente.

O sistema deverá calcular automaticamente o valor correto com base:

- Na data de nascimento.
- No tipo de passaporte.
- Na condição PNE quando aplicável.
- Nos preços configurados pelo administrador.

Nenhuma dessas regras deve depender de valores monetários fixos no frontend.

---

# 4. Crianças de 0 a 4 anos

Uma criança de 0 a 4 anos possui direito a 1 acompanhante gratuito maior de 18 anos.

Durante a compra, perguntar se a criança ficará:

- Com acompanhante.
- Sem acompanhante.

## Com acompanhante

- Informar claramente que o acompanhante deverá possuir mais de 18 anos.
- Solicitar os dados necessários do acompanhante.
- Informar que esse acompanhante está incluído gratuitamente.
- Registrar essa informação na compra.

## Sem acompanhante

O responsável deverá:

- Ler e aceitar o Termo de Responsabilidade.
- Informar telefone e WhatsApp.
- Autorizar contato caso necessário.

O aceite deverá ficar registrado no sistema.

Durante o check-in, a interface operacional deverá apresentar um ALERTA CLARO informando que aquela criança ficará sem acompanhante.

---

# 5. Acompanhantes adicionais

Permitir adicionar acompanhantes adicionais quando aplicável.

Deixar claro durante a compra que:

- O ingresso de acompanhante não permite utilização dos brinquedos.
- Para utilizar os brinquedos, a pessoa deverá possuir o passaporte correspondente.

Essas informações devem estar claras antes da confirmação da compra.

---

# 6. Carrinho/resumo da compra

Antes do pagamento, apresentar um resumo claro contendo:

- Crianças incluídas.
- Tipos de passaporte.
- Acompanhantes.
- Descontos aplicados.
- Quantidades.
- Valores individuais.
- Valor total.

A compra precisa ser simples e exigir o mínimo possível de passos desnecessários.

---

# 7. Pagamento

Utilizar o Stripe já integrado/configurável pelo painel administrativo.

NÃO adicionar credenciais fixas diretamente no código.

Utilizar exclusivamente as credenciais configuradas pelo administrador.

O cliente deverá conseguir pagar utilizando:

- Cartão de crédito.
- PIX.

A implementação deverá considerar os métodos efetivamente suportados/configurados pelo Stripe para a conta utilizada no Brasil.

O fluxo deverá criar o pagamento utilizando os itens e valores calculados pelo próprio sistema.

A compra somente poderá ser considerada paga após confirmação efetiva do pagamento.

NÃO confiar apenas no redirect do checkout como confirmação de pagamento.

Utilizar o mecanismo apropriado do Stripe, incluindo webhook quando necessário, como fonte autoritativa do status.

O QR Code e o código de acesso somente poderão ser disponibilizados após a confirmação do pagamento.

---

# 8. Compra e código de acesso

Cada compra deverá possuir um identificador público próprio para utilização no parque.

Após a confirmação do pagamento, gerar:

1. Um QR Code.
2. Um código curto de acesso legível por humanos.

Exemplo de código:

`XYZ123`

O exemplo acima é apenas ilustrativo. Defina uma estratégia segura para geração de códigos curtos, evitando colisões.

O QR Code e o código curto representam A MESMA COMPRA.

Uma compra poderá possuir várias crianças/passaportes.

Portanto, NÃO gerar obrigatoriamente um QR Code separado para cada criança.

O código/QR deverá permitir localizar a compra completa e todos os seus participantes.

Não expor IDs sequenciais internos ou informações sensíveis diretamente no QR Code.

---

# 9. Confirmação da compra

Após a confirmação do pagamento, apresentar uma página de sucesso contendo:

- Confirmação do pagamento.
- Resumo da compra.
- QR Code.
- Código curto de acesso.
- Informações necessárias para entrada.
- Avisos relacionados às crianças/acompanhantes daquela compra.

O cliente deverá conseguir:

- Visualizar o QR Code.
- Salvar/baixar o QR Code.
- Tirar print da tela.
- Visualizar/copiar o código curto.

Não é necessário criar área autenticada do cliente nesta versão.

---

# 10. Envio por e-mail

Após a confirmação efetiva do pagamento, enviar automaticamente um e-mail ao responsável.

O e-mail deverá conter:

- Confirmação da compra.
- Resumo da compra.
- QR Code.
- Código curto.
- Informações necessárias para entrada.
- Alertas aplicáveis.
- Orientações para apresentação no parque.

O QR Code enviado por e-mail deverá representar exatamente a mesma compra apresentada na tela de confirmação.

---

# 11. Separação entre Admin e operação

Atualmente o Admin concentra CMS, configurações e demais funcionalidades administrativas.

Precisamos começar a separar administração de operação.

Criar uma nova role:

`operator`

## Admin

O usuário `admin` continua com acesso total ao sistema, incluindo:

- CMS.
- Configurações.
- Preços.
- Usuários.
- Funcionalidades administrativas existentes.
- Funcionalidades operacionais.

## Operator

O usuário `operator` deverá possuir acesso somente às funcionalidades operacionais autorizadas.

Nesta primeira versão:

- Consulta de ingresso/compra.
- Leitura de QR Code.
- Busca pelo código curto.
- Conferência da compra.
- Check-in.
- Controle de tempo.
- Check-out.

O `operator` NÃO deverá conseguir acessar CMS, configurações administrativas, preços ou demais áreas restritas ao Admin.

IMPORTANTE:

A restrição precisa existir também no backend/API.

NÃO implementar somente escondendo menus ou páginas no frontend.

Criar também no seed um usuário `operator` para desenvolvimento/testes seguindo o padrão existente do projeto.

Essa estrutura deverá permitir que futuramente sejam adicionadas outras funcionalidades operacionais, como:

- Caixa.
- Venda presencial.
- Abertura/fechamento de caixa.
- Outras operações do parque.

Não implementar essas funcionalidades agora.

---

# 12. Área operacional

Criar uma interface específica para operação dos ingressos.

Ela deverá ser otimizada para uso rápido por funcionários.

O operador deverá conseguir localizar uma compra de duas formas:

## QR Code

Permitir leitura do QR Code utilizando dispositivo compatível, como câmera do celular/tablet ou leitor disponível.

## Código curto

Disponibilizar um campo onde o operador possa digitar manualmente o código apresentado pelo cliente.

Exemplo:

`XYZ123`

As duas formas deverão localizar exatamente a mesma compra.

---

# 13. Conferência antes da entrada

Ao localizar uma compra, NÃO liberar a entrada imediatamente.

Primeiro apresentar ao operador um resumo claro da compra.

Exibir informações como:

- Código da compra.
- Status do pagamento.
- Crianças.
- Nome de cada criança.
- Data de nascimento.
- Idade.
- Tipo de passaporte.
- Valor pago.
- Condição PNE quando aplicável.
- Acompanhantes.
- Acompanhante gratuito quando aplicável.
- Confirmação de idade mínima do acompanhante.
- Termo de Responsabilidade quando aplicável.
- Telefone.
- WhatsApp.
- Alertas específicos.
- Tempo contratado.

O operador será responsável por conferir as informações/documentos necessários e somente então autorizar a entrada.

A interface deve destacar visualmente qualquer informação que exija atenção.

---

# 14. Avisos de documentação

Destacar durante a confirmação da compra, no e-mail e principalmente na tela operacional:

**IMPORTANTE: APRESENTE UM DOCUMENTO COM FOTO DA CRIANÇA NA ENTRADA DO PARQUE PARA UTILIZAR O PASSAPORTE.**

Para crianças de 0 a 4 anos com acompanhante gratuito:

- Informar a necessidade de comprovar que o acompanhante possui mais de 18 anos.

Para crianças de 0 a 4 anos sem acompanhante:

- Confirmar que o Termo de Responsabilidade foi aceito.
- Mostrar telefone/WhatsApp do responsável.
- Destacar que a criança ficará sem acompanhante.

---

# 15. Check-in

Após conferir os dados, o operador poderá aprovar a entrada.

Nesse momento registrar:

- Data do check-in.
- Horário exato do check-in.
- Usuário/operator responsável pelo check-in.

O check-in deverá iniciar a contagem do tempo contratado.

Exemplo:

Passaporte comprado: 2 horas.

Check-in: 14:00.

Previsão de término: 16:00.

O sistema deverá conseguir calcular e apresentar:

- Horário de entrada.
- Tempo contratado.
- Tempo decorrido.
- Tempo restante.
- Horário previsto de término.

---

# 16. Controle de tempo

Após o check-in, o tempo deverá continuar sendo calculado.

Enquanto estiver dentro do período contratado, mostrar claramente o tempo restante.

Quando o período contratado terminar, NÃO parar a contagem.

O sistema deverá continuar contabilizando o tempo excedente.

Exemplo:

Tempo contratado: 2h  
Tempo utilizado: 3h  
Tempo excedente: 1h

A interface operacional deverá destacar claramente quando existir tempo excedente.

O cálculo não deve depender exclusivamente de um timer mantido no navegador.

Persistir os timestamps necessários e calcular o tempo com base neles, para que recarregar a página, trocar de dispositivo ou reiniciar o navegador não perca o controle.

---

# 17. Check-out

O mesmo QR Code/código utilizado no check-in deverá ser utilizado na saída.

Portanto, o QR Code NÃO deve simplesmente se tornar inválido após o primeiro uso.

O fluxo possui estados.

Exemplo:

`PAID → CHECKED_IN → CHECKED_OUT`

Ao ler um ingresso que já possui check-in e ainda não possui check-out, o sistema deverá entender que se trata do processo de saída.

Antes de confirmar o check-out, apresentar:

- Horário de entrada.
- Horário previsto de término.
- Tempo contratado.
- Tempo total utilizado até aquele momento.
- Tempo excedente, quando existir.

Após a confirmação, registrar:

- Data/hora do check-out.
- Usuário/operator responsável pelo check-out.
- Tempo total utilizado.
- Tempo excedente.

---

# 18. Tempo excedente

Caso o cliente permaneça no parque além do período contratado, o sistema deverá calcular e registrar o excedente.

Exemplo:

Contratado: 2h  
Entrada: 14:00  
Término previsto: 16:00  
Saída: 17:00  
Excedente: 1h

Nesta versão NÃO será implementada cobrança automática do excedente.

Apenas:

- Calcular.
- Registrar.
- Exibir claramente para o operador.
- Sinalizar que existe valor/tempo excedente a ser tratado.

Deixar a arquitetura preparada para futuramente integrar essa informação ao módulo de caixa.

NÃO implementar o caixa agora.

---

# 19. Auditoria operacional

As ações operacionais importantes deverão registrar o usuário autenticado responsável.

No mínimo:

## Check-in

- Operador.
- Data/hora.

## Check-out

- Operador.
- Data/hora.

Evitar armazenar apenas nomes de operadores como texto.

Sempre que possível, relacionar a ação ao usuário real existente no sistema para manter rastreabilidade.

---

# 20. Estados e validações

O sistema deverá tratar claramente estados inválidos.

Exemplos:

- Compra ainda não paga.
- Código inexistente.
- QR Code inválido.
- Compra cancelada.
- Tentativa de check-out sem check-in.
- Tentativa de realizar novo check-in depois do check-out.
- Tentativa de processar novamente uma compra já finalizada.

Não permitir que uma mesma compra seja utilizada para múltiplas entradas independentes depois de finalizada.

Mostrar mensagens claras ao operador em vez de falhas genéricas.

---

# 21. Arquitetura preparada para Totem

NÃO implementar o modo Totem nesta task.

Porém, esta feature será adaptada em um futuro muito próximo para utilização em um totem com tela em orientação portrait.

Por isso:

- Evitar acoplamento desnecessário da lógica de compra à página atual.
- Separar lógica de negócio da apresentação.
- Criar componentes reutilizáveis.
- Evitar assumir exclusivamente layout desktop horizontal.
- Manter os componentes responsivos.
- Estruturar o fluxo de compra de forma que posteriormente seja possível reutilizá-lo em outra rota/layout sem reimplementar toda a lógica.

A implementação do totem propriamente dita está FORA DO ESCOPO atual.

---

# 22. Segurança

Considerar que QR Code e código curto são credenciais públicas apresentadas pelo cliente.

Portanto:

- Não expor IDs internos desnecessariamente.
- Não colocar dados pessoais diretamente dentro do QR Code.
- Validar tudo no backend.
- Não confiar em valores de preço enviados pelo frontend.
- Não confiar em idade/desconto calculado somente no frontend.
- Não confiar no status enviado pelo frontend.
- Recalcular e validar valores/regras no servidor.
- Somente permitir check-in/check-out para usuários autenticados e autorizados.
- Garantir as permissões da role `operator` nas APIs.
- Garantir unicidade do código curto.

---

# 23. Fora do escopo atual

Nesta primeira versão NÃO será criada uma área autenticada para o cliente consultar suas compras.

O acesso do cliente à compra será feito através:

- Da tela de confirmação após o pagamento.
- Do QR Code.
- Do código curto.
- Do e-mail enviado após a confirmação.

Também NÃO fazem parte desta implementação:

- Totem de autoatendimento.
- Retirada automática de pulseira RFID.
- Caixa.
- Cobrança automática de tempo excedente.
- Venda presencial.
- Abertura/fechamento de caixa.
- Área do cliente com histórico de compras.

Essas funcionalidades poderão utilizar a arquitetura criada nesta feature futuramente.

---

# Resultado esperado

Ao final desta task deverá existir um fluxo funcional completo:

1. Cliente acessa a compra antecipada existente.
2. Seleciona/adiciona as crianças e passaportes.
3. Sistema calcula os preços configurados pelo Admin.
4. Cliente informa os dados necessários.
5. Sistema aplica automaticamente as regras de idade/PNE/acompanhante.
6. Cliente revisa a compra.
7. Cliente paga via cartão ou PIX utilizando Stripe.
8. Sistema confirma o pagamento.
9. Sistema gera QR Code e código curto.
10. Cliente visualiza o comprovante.
11. Cliente recebe o comprovante por e-mail.
12. No parque, um `operator` lê o QR Code ou informa o código curto.
13. Sistema apresenta todos os dados e alertas necessários.
14. Operador confere e aprova a entrada.
15. Sistema registra operador/data/hora e inicia o controle de tempo.
16. Sistema acompanha tempo restante e eventual excedente.
17. Na saída, o mesmo QR Code/código é utilizado.
18. Sistema apresenta tempo utilizado e eventual excedente.
19. Operador confirma o check-out.
20. Sistema registra operador/data/hora e finaliza aquela utilização.
