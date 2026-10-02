/**
 * Camada Digital Menu - Client Application Logic
 */

(function() {
  // State
  let currentTable = 'Mesa 1';
  let cart = [];
  let currentCustomizingDish = null;
  let customizerState = {
    qty: 1,
    sauce: 'Tradicional Camada',
    selectedExtras: [],
    notes: ''
  };

  // DOM Elements Cache
  const el = {
    tableLabel: document.getElementById('heroTableLabel'),
    menuContainer: document.getElementById('menuSectionsContainer'),
    categoryPills: document.querySelectorAll('.category-pill'),
    floatingCart: document.getElementById('floatingCartBar'),
    cartBadgeCount: document.getElementById('cartBadgeCount'),
    cartTotalDisplay: document.getElementById('cartTotalDisplay'),
    cartItemsCountText: document.getElementById('cartItemsCountText'),
    // Modals
    customizerModal: document.getElementById('customizerModal'),
    cartDrawer: document.getElementById('cartDrawer'),
    tableModal: document.getElementById('tableSelectModal'),
    serviceModal: document.getElementById('serviceModal'),
    // Customizer Modal Elements
    modalDishImg: document.getElementById('modalDishImg'),
    modalDishTitle: document.getElementById('modalDishTitle'),
    modalDishPrice: document.getElementById('modalDishPrice'),
    modalDishDesc: document.getElementById('modalDishDesc'),
    sauceGroup: document.getElementById('sauceSelectionGroup'),
    saucePills: document.getElementById('saucePillsContainer'),
    extrasContainer: document.getElementById('extrasContainer'),
    customNotes: document.getElementById('customNotesInput'),
    modalQtyVal: document.getElementById('modalQtyVal'),
    modalSubmitBtn: document.getElementById('modalSubmitBtn'),
    modalSubmitPrice: document.getElementById('modalSubmitPrice'),
    // Cart Drawer Elements
    drawerCartItems: document.getElementById('drawerCartItems'),
    drawerSubtotal: document.getElementById('drawerSubtotal'),
    drawerTableBadge: document.getElementById('drawerTableBadge'),
    sendOrderBtn: document.getElementById('sendOrderBtn'),
    // Order Tracking
    activeOrdersContainer: document.getElementById('activeOrdersContainer')
  };

  // 1. Initialize
  function init() {
    initTableFromUrl();
    renderMenu();
    updateCartUI();
    renderActiveTableOrders();
    bindEvents();
    bindSyncEvents();
  }

  // Parse mesa from URL: e.g. index.html?mesa=4
  function initTableFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('mesa');
    if (tableParam) {
      currentTable = tableParam.toLowerCase().startsWith('mesa') ? tableParam : `Mesa ${tableParam}`;
    }
    if (el.tableLabel) el.tableLabel.textContent = currentTable;
    if (el.drawerTableBadge) el.drawerTableBadge.textContent = currentTable;
  }

  // 2. Render Menu Disply
  function renderMenu() {
    if (!el.menuContainer) return;
    const items = CamadaDB.getMenuItems();

    const categories = [
      { key: 'francesinhas', title: 'Francesinhas' },
      { key: 'cachorrinhos', title: 'Cachorrinhos' },
      { key: 'entradas', title: 'Entradas & Petiscos' },
      { key: 'bebidas', title: 'Bebidas' },
      { key: 'sobremesas', title: 'Sobremesas' }
    ];

    let html = '';

    categories.forEach(cat => {
      const catItems = items.filter(i => i.category === cat.key);
      if (catItems.length === 0) return;

      html += `
        <section class="menu-section" id="cat-${cat.key}">
          <div class="section-header">
            <h2 class="section-title">${cat.title}</h2>
            <span class="section-count">${catItems.length} opções</span>
          </div>
          <div class="dishes-grid">
      `;

      catItems.forEach(dish => {
        const isOutOfStock = dish.available === false;
        html += `
          <div class="dish-card ${isOutOfStock ? 'out-of-stock' : ''}" data-dish-id="${dish.id}">
            <div class="dish-details">
              <div>
                <h3 class="dish-name">${dish.name}</h3>
                <p class="dish-desc">${dish.description}</p>
              </div>
              <div class="dish-footer">
                <span class="dish-price">${dish.price.toFixed(2).replace('.', ',')} €</span>
                ${isOutOfStock ? 
                  `<span class="out-of-stock-tag">Esgotado</span>` : 
                  `<button class="add-btn" title="Personalizar e adicionar" aria-label="Adicionar">+</button>`
                }
              </div>
            </div>
            <div class="dish-image-wrapper">
              <img src="${dish.image}" alt="${dish.name}" class="dish-img" loading="lazy">
              ${dish.badge ? `<span class="dish-badge">${dish.badge}</span>` : ''}
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </section>
      `;
    });

    el.menuContainer.innerHTML = html;

    // Attach click listeners to cards
    document.querySelectorAll('.dish-card:not(.out-of-stock)').forEach(card => {
      card.addEventListener('click', () => {
        const dishId = card.getAttribute('data-dish-id');
        openDishCustomizer(dishId);
      });
    });
  }

  // 3. Dish Customizer Modal
  function openDishCustomizer(dishId) {
    const items = CamadaDB.getMenuItems();
    const dish = items.find(i => i.id === dishId);
    if (!dish || dish.available === false) return;

    currentCustomizingDish = dish;
    customizerState = {
      qty: 1,
      sauce: dish.hasSauceChoice ? 'Tradicional' : null,
      selectedExtras: [],
      notes: ''
    };

    // Populate modal
    el.modalDishImg.src = dish.image;
    el.modalDishTitle.textContent = dish.name;
    el.modalDishPrice.textContent = `${dish.price.toFixed(2).replace('.', ',')} €`;
    el.modalDishDesc.textContent = dish.description;
    el.modalQtyVal.textContent = '1';
    el.customNotes.value = '';

    // Render Sauce options if applicable
    if (dish.hasSauceChoice) {
      el.sauceGroup.style.display = 'block';
      const sauces = [
        { id: 'tradicional', name: 'Tradicional' },
        { id: 'picante', name: 'Picante' },
        { id: 'muito_picante', name: 'Muito Picante' },
        { id: 'sem_picante', name: 'Sem Picante' }
      ];

      el.saucePills.innerHTML = sauces.map((s, idx) => `
        <div class="pill-option ${idx === 0 ? 'active' : ''}" data-sauce="${s.name}">
          <span class="pill-option-name">${s.name}</span>
        </div>
      `).join('');

      el.saucePills.querySelectorAll('.pill-option').forEach(p => {
        p.addEventListener('click', () => {
          el.saucePills.querySelectorAll('.pill-option').forEach(x => x.classList.remove('active'));
          p.classList.add('active');
          customizerState.sauce = p.getAttribute('data-sauce');
        });
      });
    } else {
      el.sauceGroup.style.display = 'none';
      customizerState.sauce = null;
    }

    // Render Extras checkboxes
    if (dish.options && dish.options.length > 0) {
      el.extrasContainer.innerHTML = dish.options.map((opt, i) => `
        <div class="addon-row" data-extra-idx="${i}" data-extra-name="${opt.name}" data-extra-price="${opt.price}">
          <div class="addon-left">
            <div class="addon-checkbox">✓</div>
            <span class="addon-label">${opt.name}</span>
          </div>
          <span class="addon-price">+${opt.price.toFixed(2)}€</span>
        </div>
      `).join('');

      el.extrasContainer.querySelectorAll('.addon-row').forEach(row => {
        row.addEventListener('click', () => {
          row.classList.toggle('active');
          const name = row.getAttribute('data-extra-name');
          const price = parseFloat(row.getAttribute('data-extra-price'));

          const existingIndex = customizerState.selectedExtras.findIndex(e => e.name === name);
          if (existingIndex > -1) {
            customizerState.selectedExtras.splice(existingIndex, 1);
          } else {
            customizerState.selectedExtras.push({ name, price });
          }
          updateCustomizerTotal();
        });
      });
    } else {
      el.extrasContainer.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;">Sem opções adicionais para este item.</p>';
    }

    updateCustomizerTotal();
    openModal(el.customizerModal);
  }

  function updateCustomizerTotal() {
    if (!currentCustomizingDish) return;
    const basePrice = currentCustomizingDish.price;
    const extrasTotal = customizerState.selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
    const itemTotal = (basePrice + extrasTotal) * customizerState.qty;
    el.modalSubmitPrice.textContent = `${itemTotal.toFixed(2)}€`;
  }

  // 4. Cart Logic
  function addItemToCart() {
    if (!currentCustomizingDish) return;

    const extrasTotal = customizerState.selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = currentCustomizingDish.price + extrasTotal;

    const cartItem = {
      cartItemId: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      id: currentCustomizingDish.id,
      name: currentCustomizingDish.name,
      basePrice: currentCustomizingDish.price,
      price: unitPrice,
      qty: customizerState.qty,
      sauce: customizerState.sauce,
      extras: [...customizerState.selectedExtras],
      notes: el.customNotes.value.trim()
    };

    cart.push(cartItem);
    closeModal(el.customizerModal);
    updateCartUI();

    // Haptic bounce animation on floating bar
    if (el.floatingCart) {
      el.floatingCart.style.transform = 'translateX(-50%) scale(1.08)';
      setTimeout(() => {
        el.floatingCart.style.transform = '';
      }, 250);
    }
  }

  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (totalQty > 0) {
      el.floatingCart.classList.remove('hidden');
      el.cartBadgeCount.textContent = totalQty;
      el.cartTotalDisplay.textContent = `${totalAmount.toFixed(2).replace('.', ',')} €`;
      el.cartItemsCountText.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'itens'}`;
    } else {
      el.floatingCart.classList.add('hidden');
    }

    renderCartDrawerItems(totalAmount);
  }

  function renderCartDrawerItems(totalAmount) {
    if (!el.drawerCartItems) return;

    if (cart.length === 0) {
      el.drawerCartItems.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1rem;color:var(--text-secondary)">
          <p style="font-weight:700;color:var(--text-primary);margin-bottom:0.25rem">O seu pedido está vazio</p>
          <p style="font-size:0.8rem">Selecione pratos da ementa para adicionar ao pedido.</p>
        </div>
      `;
      el.drawerSubtotal.textContent = '0,00 €';
      el.sendOrderBtn.disabled = true;
      el.sendOrderBtn.style.opacity = '0.5';
      return;
    }

    el.sendOrderBtn.disabled = false;
    el.sendOrderBtn.style.opacity = '1';

    let html = '';
    cart.forEach(item => {
      const customsText = [
        item.sauce ? `Molho: ${item.sauce}` : '',
        ...(item.extras || []).map(e => `+ ${e.name}`),
        item.notes ? `Nota: "${item.notes}"` : ''
      ].filter(Boolean).join(' • ');

      html += `
        <div class="cart-item-row">
          <div class="quantity-control" style="transform:scale(0.85);margin-left:-4px">
            <button class="qty-btn" data-action="dec" data-id="${item.cartItemId}">-</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.cartItemId}">+</button>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            ${customsText ? `<div class="cart-item-customs">${customsText}</div>` : ''}
          </div>
          <div style="text-align:right">
            <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
            <button class="cart-item-remove-btn" data-remove-id="${item.cartItemId}" title="Remover">✕</button>
          </div>
        </div>
      `;
    });

    el.drawerCartItems.innerHTML = html;
    el.drawerSubtotal.textContent = `${totalAmount.toFixed(2).replace('.', ',')} €`;

    // Bind quantity handlers inside cart drawer
    el.drawerCartItems.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const item = cart.find(i => i.cartItemId === id);
        if (!item) return;

        if (action === 'inc') {
          item.qty++;
        } else if (action === 'dec') {
          item.qty--;
          if (item.qty <= 0) {
            cart = cart.filter(i => i.cartItemId !== id);
          }
        }
        updateCartUI();
      });
    });

    el.drawerCartItems.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-remove-id');
        cart = cart.filter(i => i.cartItemId !== id);
        updateCartUI();
      });
    });
  }

  // 5. Submit Order to Kitchen
  function sendOrderToKitchen() {
    if (cart.length === 0) return;

    // Trigger audio & order creation
    CamadaAudio.initContext();

    const order = CamadaDB.createOrder({
      mesa: currentTable,
      items: cart,
      notes: ''
    });

    CamadaAudio.playSuccessTone();

    // Close drawer and reset cart
    closeModal(el.cartDrawer);
    cart = [];
    updateCartUI();

    // Show toast confirmation
    showToastNotification(`Pedido ${order.id} enviado à cozinha com sucesso.`);

    // Render order tracking card immediately
    renderActiveTableOrders();

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 6. Render Active Orders for current Table (Live Tracking)
  function renderActiveTableOrders() {
    if (!el.activeOrdersContainer) return;
    const tableOrders = CamadaDB.getOrdersByTable(currentTable);
    const activeOrders = tableOrders.filter(o => o.status !== 'entregue');

    if (activeOrders.length === 0) {
      el.activeOrdersContainer.innerHTML = '';
      return;
    }

    let html = '';
    activeOrders.forEach(order => {
      const stepIndex = order.status === 'pendente' ? 1 : (order.status === 'preparando' ? 2 : 3);
      const statusLabels = {
        pendente: 'Recebido na cozinha',
        preparando: 'A preparar no forno',
        pronto: 'Pronto a servir'
      };

      html += `
        <div class="order-tracking-card">
          <div class="tracking-header">
            <div>
              <div class="tracking-order-id">Pedido ${order.id} • ${order.mesa}</div>
              <span style="font-size:0.75rem;color:var(--text-secondary)">Enviado às ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <span class="tracking-status-badge status-${order.status}">
              ${statusLabels[order.status] || order.status}
            </span>
          </div>

          <!-- Progress Stepper -->
          <div class="tracking-steps">
            <div class="tracking-step ${stepIndex >= 1 ? 'done' : ''} ${stepIndex === 1 ? 'current' : ''}">
              <div class="step-circle">1</div>
              <span class="step-label">Recebido</span>
            </div>
            <div class="tracking-step ${stepIndex >= 2 ? 'done' : ''} ${stepIndex === 2 ? 'current' : ''}">
              <div class="step-circle">2</div>
              <span class="step-label">No forno</span>
            </div>
            <div class="tracking-step ${stepIndex >= 3 ? 'done' : ''} ${stepIndex === 3 ? 'current' : ''}">
              <div class="step-circle">3</div>
              <span class="step-label">Pronto</span>
            </div>
          </div>

          <!-- Items list in this order -->
          <div style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:0.75rem;margin-top:0.75rem">
            <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;margin-bottom:0.4rem;text-transform:uppercase">Itens a preparar:</div>
            ${order.items.map(it => `
              <div style="display:flex;justify-content:space-between;font-size:0.83rem;margin-bottom:4px">
                <span><strong>${it.qty}x</strong> ${it.name}</span>
                <span style="color:var(--camada-red);font-weight:700">${(it.price * it.qty).toFixed(2).replace('.', ',')} €</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    el.activeOrdersContainer.innerHTML = html;
  }

  // 7. Helpers: Modals & Toasts
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function showToastNotification(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 68px;
      left: 50%;
      transform: translateX(-50%);
      background: #191c21;
      color: #fff;
      padding: 0.65rem 1.25rem;
      border-radius: var(--radius-full);
      font-size: 0.84rem;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: opacity 0.3s;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function showToastNotification(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 75px;
      left: 50%;
      transform: translateX(-50%);
      background: #1e2533;
      border: 1px solid var(--primary);
      color: #fff;
      padding: 0.75rem 1.4rem;
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: fadeInDown 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // 8. Bind Events
  function bindEvents() {
    // Category pill click smooth scroll
    el.categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        el.categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const targetId = pill.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Floating cart bar click -> open cart drawer
    if (el.floatingCart) {
      el.floatingCart.addEventListener('click', () => {
        openModal(el.cartDrawer);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        closeModal(modal);
      });
    });

    // Click outside modal sheet to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
    });

    // Customizer Quantity controls
    document.getElementById('modalQtyDec')?.addEventListener('click', () => {
      if (customizerState.qty > 1) {
        customizerState.qty--;
        el.modalQtyVal.textContent = customizerState.qty;
        updateCustomizerTotal();
      }
    });

    document.getElementById('modalQtyInc')?.addEventListener('click', () => {
      customizerState.qty++;
      el.modalQtyVal.textContent = customizerState.qty;
      updateCustomizerTotal();
    });

    // Add to cart button
    el.modalSubmitBtn?.addEventListener('click', addItemToCart);

    // Send order button
    el.sendOrderBtn?.addEventListener('click', sendOrderToKitchen);

    // Table change pill click
    document.getElementById('changeTableBtn')?.addEventListener('click', () => {
      openModal(el.tableModal);
    });

    // Populate Table Select Modal options
    const tableOptionsGrid = document.getElementById('tableSelectModalOptions');
    if (tableOptionsGrid) {
      let tHtml = '';
      for (let i = 1; i <= 24; i++) {
        const tName = `Mesa ${i}`;
        const isCurrent = tName.toLowerCase() === currentTable.toLowerCase();
        tHtml += `
          <button class="table-select-btn ${isCurrent ? 'active' : ''}" data-table="${tName}">
            ${i}
          </button>
        `;
      }
      tableOptionsGrid.innerHTML = tHtml;

      tableOptionsGrid.querySelectorAll('.table-select-btn').forEach(b => {
        b.addEventListener('click', () => {
          currentTable = b.getAttribute('data-table');
          if (el.tableLabel) el.tableLabel.textContent = currentTable;
          if (el.drawerTableBadge) el.drawerTableBadge.textContent = currentTable;
          tableOptionsGrid.querySelectorAll('.table-select-btn').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          closeModal(el.tableModal);
          renderActiveTableOrders();
          showToastNotification(`Mesa alterada para ${currentTable}`);
        });
      });
    }

    // Call Waiter / Empregado Button
    document.getElementById('callWaiterBtn')?.addEventListener('click', () => {
      CamadaDB.callService({ mesa: currentTable, type: 'chamar_empregado' });
      showToastNotification(`🔔 Empregado chamado para a ${currentTable}. Já a caminho!`);
    });

    // Ask for Bill / Pedir Conta Button
    document.getElementById('askBillBtn')?.addEventListener('click', () => {
      openModal(el.serviceModal);
    });

    // Service Modal Bill confirmation
    document.getElementById('confirmBillBtn')?.addEventListener('click', () => {
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Multibanco';
      CamadaDB.callService({
        mesa: currentTable,
        type: 'pedir_conta',
        details: `Método de Pagamento: ${paymentMethod}`
      });
      closeModal(el.serviceModal);
      showToastNotification(`🧾 Conta pedida (${paymentMethod}) para a ${currentTable}!`);
    });
  }

  // 9. Real-Time Sync Event Listeners
  function bindSyncEvents() {
    // When kitchen updates order status (e.g. Preparing -> Ready)
    document.addEventListener('camada:order_updated', () => {
      renderActiveTableOrders();
    });

    // When menu is modified in back office (e.g., dish toggled out of stock)
    document.addEventListener('camada:menu_updated', () => {
      renderMenu();
    });

    document.addEventListener('camada:menu_storage_changed', () => {
      renderMenu();
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
