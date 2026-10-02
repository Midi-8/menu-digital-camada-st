/**
 * Camada Kitchen Display System (KDS) Logic
 * Real-time order monitoring, preparation state management & audio alerts.
 */

(function() {
  let activeFilter = 'active'; // 'active' | 'pendente' | 'preparando' | 'pronto' | 'todos'
  let elapsedTimerInterval = null;

  const el = {
    grid: document.getElementById('kdsOrdersGrid'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    totalActiveStat: document.getElementById('kdsTotalActive'),
    pendentesStat: document.getElementById('kdsPendentesCount'),
    preparandoStat: document.getElementById('kdsPreparandoCount'),
    prontosStat: document.getElementById('kdsProntosCount'),
    filterBtns: document.querySelectorAll('.kds-filter-btn'),
    serviceAlertsContainer: document.getElementById('serviceAlertsContainer')
  };

  function init() {
    renderKdsOrders();
    renderServiceAlerts();
    bindEvents();
    bindSyncEvents();

    // Start interval to update elapsed timers every 15 seconds
    elapsedTimerInterval = setInterval(() => {
      updateElapsedTimes();
    }, 15000);
  }

  function getFilteredOrders() {
    const orders = CamadaDB.getOrders();
    if (activeFilter === 'active') {
      return orders.filter(o => o.status !== 'entregue');
    } else if (activeFilter === 'todos') {
      return orders;
    } else {
      return orders.filter(o => o.status === activeFilter);
    }
  }

  function renderKdsOrders() {
    if (!el.grid) return;
    const allOrders = CamadaDB.getOrders();
    const filtered = getFilteredOrders();

    // Update stats
    const pendentes = allOrders.filter(o => o.status === 'pendente').length;
    const preparando = allOrders.filter(o => o.status === 'preparando').length;
    const prontos = allOrders.filter(o => o.status === 'pronto').length;
    const totalActive = pendentes + preparando + prontos;

    if (el.totalActiveStat) el.totalActiveStat.textContent = totalActive;
    if (el.pendentesStat) el.pendentesStat.textContent = pendentes;
    if (el.preparandoStat) el.preparandoStat.textContent = preparando;
    if (el.prontosStat) el.prontosStat.textContent = prontos;

    if (filtered.length === 0) {
      el.grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-dim);background:var(--bg-card);border-radius:var(--radius-xl);border:1px dashed var(--border-subtle)">
          <div style="font-size:3rem;margin-bottom:0.75rem">👨‍🍳</div>
          <h3 style="font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:0.25rem">Sem pedidos pendentes de momento</h3>
          <p style="font-size:0.85rem">Aguardando novos pedidos dos clientes ou clique em "Criar Pedido de Teste" para simular.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(order => {
      const elapsedMin = getMinutesElapsed(order.createdAt);
      let timerClass = '';
      if (elapsedMin >= 18) timerClass = 'danger';
      else if (elapsedMin >= 10) timerClass = 'warning';

      let actionButtons = '';
      if (order.status === 'pendente') {
        actionButtons = `
          <button class="btn-kds-action btn-start-prep" data-action="preparar" data-order-id="${order.id}">
            Iniciar preparação
          </button>
        `;
      } else if (order.status === 'preparando') {
        actionButtons = `
          <button class="btn-kds-action btn-mark-ready" data-action="pronto" data-order-id="${order.id}">
            Marcar como pronto
          </button>
        `;
      } else if (order.status === 'pronto') {
        actionButtons = `
          <button class="btn-kds-action btn-delivered" data-action="entregue" data-order-id="${order.id}">
            Concluir / Entregue
          </button>
        `;
      } else {
        actionButtons = `
          <span style="font-size:0.75rem;color:#8c98a9;font-weight:600">Concluído</span>
        `;
      }

      html += `
        <div class="kds-card status-${order.status}" data-order-id="${order.id}" data-created-at="${order.createdAt}">
          <div class="kds-card-header">
            <div class="kds-table-badge">
              ${order.mesa}
            </div>
            <div class="kds-order-meta">
              <div class="kds-order-id" style="color:#8c98a9">${order.id}</div>
              <div class="kds-timer-badge ${timerClass}">
                <span class="timer-text">${elapsedMin}m</span>
              </div>
            </div>
          </div>

          <div class="kds-card-body">
            ${order.items.map(item => {
              const tags = [];
              if (item.sauce) {
                const isSpicy = item.sauce.toLowerCase().includes('picante');
                tags.push(`<span class="kds-custom-tag ${isSpicy ? 'spicy' : ''}">Molho: ${item.sauce}</span>`);
              }
              (item.extras || []).forEach(ext => {
                tags.push(`<span class="kds-custom-tag">+ ${ext.name}</span>`);
              });
              if (item.notes) {
                tags.push(`<span class="kds-custom-tag urgent">Obs: "${item.notes}"</span>`);
              }

              return `
                <div class="kds-item-row">
                  <div class="kds-item-qty">${item.qty}</div>
                  <div class="kds-item-content">
                    <div class="kds-item-name">${item.name}</div>
                    ${tags.length > 0 ? `<div>${tags.join('')}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('')}

            ${order.notes ? `
              <div class="kds-notes-box">
                <strong>Nota Geral:</strong> ${order.notes}
              </div>
            ` : ''}
          </div>

          <div class="kds-card-footer">
            ${actionButtons}
          </div>
        </div>
      `;
    });

    el.grid.innerHTML = html;

    // Attach actions
    el.grid.querySelectorAll('.btn-kds-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        const action = btn.getAttribute('data-action');
        let newStatus = 'pendente';
        if (action === 'preparar') newStatus = 'preparando';
        else if (action === 'pronto') newStatus = 'pronto';
        else if (action === 'entregue') newStatus = 'entregue';

        CamadaDB.updateOrderStatus(orderId, newStatus);
        CamadaAudio.playSuccessTone();
        renderKdsOrders();
      });
    });
  }

  function getMinutesElapsed(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  }

  function updateElapsedTimes() {
    document.querySelectorAll('.kds-card').forEach(card => {
      const createdAt = card.getAttribute('data-created-at');
      if (!createdAt) return;
      const mins = getMinutesElapsed(createdAt);
      const timerBadge = card.querySelector('.kds-timer-badge');
      const timerText = card.querySelector('.timer-text');
      if (timerText) timerText.textContent = `${mins}m`;

      if (timerBadge) {
        timerBadge.classList.remove('warning', 'danger');
        if (mins >= 18) timerBadge.classList.add('danger');
        else if (mins >= 10) timerBadge.classList.add('warning');
      }
    });
  }

  // Service Alerts (Chamar Empregado / Conta)
  function renderServiceAlerts() {
    if (!el.serviceAlertsContainer) return;
    const calls = CamadaDB.getServiceCalls();
    const pendingCalls = calls.filter(c => c.status === 'pendente');

    if (pendingCalls.length === 0) {
      el.serviceAlertsContainer.innerHTML = '';
      return;
    }

    el.serviceAlertsContainer.innerHTML = pendingCalls.map(c => `
      <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b);border:1px solid #ef4444;border-radius:var(--radius-md);padding:0.75rem 1.1rem;display:flex;align-items:center;justify-content:space-between;color:#fff;margin-bottom:1rem;animation:pulse-danger 2s infinite">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <span style="font-size:1.5rem">🔔</span>
          <div>
            <div style="font-family:var(--font-display);font-weight:800;font-size:1rem">${c.mesa} - ${c.type === 'pedir_conta' ? 'Pediu a Conta' : 'Chamou Empregado'}</div>
            <div style="font-size:0.78rem;opacity:0.9">${c.details || 'Aguardando atendimento na sala.'}</div>
          </div>
        </div>
        <button class="btn-dismiss-call" data-call-id="${c.id}" style="background:#fff;color:#7f1d1d;border:none;border-radius:var(--radius-full);padding:0.4rem 0.9rem;font-weight:800;font-size:0.78rem;cursor:pointer">
          Atendido ✓
        </button>
      </div>
    `).join('');

    el.serviceAlertsContainer.querySelectorAll('.btn-dismiss-call').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-call-id');
        CamadaDB.dismissServiceCall(id);
        renderServiceAlerts();
      });
    });
  }

  function bindEvents() {
    // Sound alert toggle
    if (el.soundToggleBtn) {
      el.soundToggleBtn.addEventListener('click', () => {
        CamadaAudio.initContext();
        const current = CamadaAudio.isSoundEnabled();
        CamadaAudio.enableSound(!current);
        el.soundToggleBtn.classList.toggle('active', !current);
        el.soundToggleBtn.innerHTML = !current ? '🔔 Som Ativado' : '🔕 Som Desativado';
        if (!current) CamadaAudio.playKitchenBell();
      });
    }

    // Filter pills
    el.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderKdsOrders();
      });
    });

    // Create Test Order Button
    document.getElementById('createTestOrderBtn')?.addEventListener('click', () => {
      CamadaAudio.initContext();
      const randomTables = ['Mesa 2', 'Mesa 4', 'Mesa 7', 'Mesa 12', 'Mesa 18'];
      const pickedTable = randomTables[Math.floor(Math.random() * randomTables.length)];
      
      const sampleItems = [
        {
          id: 'fra-01',
          name: 'Francesinha Camada Forno a Lenha',
          price: 13.50,
          qty: 2,
          sauce: 'Picante Camada 🔥',
          extras: [{ name: 'Ovo Estrelado', price: 1.00 }]
        },
        {
          id: 'ent-01',
          name: 'Batatas Camada c/ Cheddar & Bacon',
          price: 6.50,
          qty: 1,
          sauce: null,
          extras: []
        },
        {
          id: 'beb-01',
          name: 'Sangria Frutos Vermelhos (1.5L)',
          price: 13.90,
          qty: 1,
          sauce: null,
          extras: []
        }
      ];

      CamadaDB.createOrder({
        mesa: pickedTable,
        items: sampleItems,
        notes: 'Cliente pediu molho bem a ferver.'
      });
    });

    // Clear completed orders
    document.getElementById('clearCompletedOrdersBtn')?.addEventListener('click', () => {
      if (confirm('Deseja limpar todos os pedidos concluídos da lista?')) {
        const orders = CamadaDB.getOrders();
        const activeOnly = orders.filter(o => o.status !== 'entregue');
        CamadaDB.saveOrders(activeOnly, true);
        renderKdsOrders();
      }
    });

    // Fullscreen toggle
    document.getElementById('fullscreenToggleBtn')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    });
  }

  function bindSyncEvents() {
    // When a new order arrives from any customer table!
    document.addEventListener('camada:new_order', () => {
      CamadaAudio.playKitchenBell();
      renderKdsOrders();
    });

    // Order status changed
    document.addEventListener('camada:order_updated', () => {
      renderKdsOrders();
    });

    // Storage changed
    document.addEventListener('camada:orders_storage_changed', () => {
      renderKdsOrders();
    });

    // Service calls
    document.addEventListener('camada:service_call', () => {
      CamadaAudio.playKitchenBell();
      renderServiceAlerts();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
