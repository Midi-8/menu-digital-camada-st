# 🥪 CAMADA Santo Tirso • Menu Digital & Sistema de Cozinha (KDS)

Sistema completo dividido nos dois módulos solicitados:

1. **O Site do Cliente (Menu Digital por QR Code)**: [`menu.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/menu.html)
2. **O Site da Cozinha (Ecrã de Receção de Pedidos em Tempo Real)**: [`cozinha.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/cozinha.html)

---

## 📌 1. Site do Cliente (Menu Digital) — [`menu.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/menu.html)

> **É o site para onde os clientes vão ao fazer scan do QR Code da mesa.**

- **Acesso com Mesa Automática**: Ao ler o QR Code da mesa (ex: `menu.html?mesa=4`), o site identifica de imediato a mesa do cliente.
- **Ementa Gastronómica do Camada**: Francesinhas em forno a lenha, cachorrinhos crocantes, petiscos, sangrias de frutos vermelhos e sobremesas artesanais com fotos em alta definição.
- **Personalização de Pratos**:
  - Escolha da intensidade do molho (Tradicional Camada, Picante 🔥, Muito Picante 🔥🔥, Sem Picante).
  - Adição de ingredientes extra (Ovo estrelado, Queijo gratinado extra, Bacon crocante, Batata rústica).
  - Caixa de notas para a cozinha (alergias, pedidos especiais).
- **Carrinho e Envio em 1 Toque**: O cliente clica em "Enviar Pedido para a Cozinha".
- **Acompanhamento ao Vivo na Mesa**: Assim que o pedido é enviado, surge um painel de progresso na mesa:
  - 🟡 *Recebido na Cozinha*
  - 🟠 *No Forno / A Preparar*
  - 🟢 *Pronto / A Caminho da Mesa*
- **Serviço de Sala**: Botões "Chamar Empregado" e "Pedir a Conta" (Multibanco, MB WAY ou Dinheiro).

---

## 👨‍🍳 2. Site da Cozinha (Ecrã KDS) — [`cozinha.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/cozinha.html)

> **É o site para onde chegam os pedidos no tablet ou ecrã da cozinha.**

- **Receção Instantânea**: Quando o cliente faz o pedido no telemóvel, o ecrã da cozinha recebe-o **em milissegundos**.
- **Aviso Sonoro 🔔**: Emite um toque de sino de cozinha sintetizado (não falha e funciona mesmo sem ligação à internet).
- **Identificação Clara**: Número da mesa em destaque (`MESA 4`), número do pedido (`#CAM-101`), hora de envio e contador de tempo ao vivo (`⏱️ 2m`, com avisos a amarelo se passar dos 10m e a vermelho se passar dos 18m).
- **Detalhes da Preparação**: Lista de itens com quantidades grandes, molho pretendido e notas especiais destacadas a cores (ex: `[MUITO PICANTE]`, `[SEM CEBOLA]`).
- **Botões de Gestão do Cozinheiro**:
  - `🔥 Começar Preparação` (avança para "No Forno")
  - `✓ Marcar como Pronto` (notifica o cliente de que o prato está pronto a servir)
  - `🍽️ Servido na Mesa` (conclui e arquiva o pedido)

---

## 🖨️ 3. Gerador de QR Codes para Mesas — [`qrcodes.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/qrcodes.html)

> **Gera os QR Codes que serão colados ou colocados em cavaletes nas mesas do Camada.**

- Selecione a mesa (Mesas 1 a 24).
- O QR Code é gerado apontando diretamente para `menu.html?mesa=X`.
- Pré-visualização do cavalete com design do Camada Santo Tirso.
- Botão para **Descarregar em PNG** ou **Imprimir todos os expositores prontos a recortar**.

---

## 📊 4. Back Office & Gestão de Stock — [`admin.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/admin.html)

- Marcar pratos como "Disponível" ou "Esgotado" em tempo real (atualiza logo no telemóvel dos clientes).
- Faturação estimada do dia e total de pedidos.

---

## ⚡ Como Experimentar Agora em 3 Passos

1. Abra o **Site da Cozinha**: abra no seu navegador o ficheiro [`cozinha.html`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/cozinha.html).
2. Abra o **Site do Cliente**: numa outra janela ou aba ao lado, abra [`menu.html?mesa=4`](file:///c:/Users/pimen/Documents/MIDI8/menu-digital-camada/menu.html?mesa=4).
3. Na janela do cliente, adicione pratos ao carrinho e clique em **Enviar Pedido para a Cozinha**:
   - Irá ouvir a **campainha da cozinha a tocar** na outra janela e o pedido a surgir imediatamente no ecrã da cozinha atribuído à **Mesa 4**!
