/**
 * Camada Back Office & Restaurant Admin Management
 */

(function() {
  const el = {
    menuTableBody: document.getElementById('adminMenuTableBody'),
    totalSalesStat: document.getElementById('adminTotalSales'),
    totalOrdersStat: document.getElementById('adminTotalOrders'),
    topDishStat: document.getElementById('adminTopDish'),
    ordersHistoryBody: document.getElementById('adminOrdersHistoryBody')
  };

  function init() {
    renderAdminMenu();
    renderStatsAndOrders();
    bindEvents();
    bindSyncEvents();
  }

  function renderAdminMenu() {
    if (!el.menuTableBody) return;
    const items = CamadaDB.getMenuItems();

    el.menuTableBody.innerHTML = items.map(item => `
      <tr>
        <td style="width:60px">
          <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover">
        </td>
        <td>
          <div style="font-weight:700;color:#fff">${item.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${item.description.slice(0, 65)}...</div>
        </td>
        <td>
          <span style="background:var(--bg-surface);padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:600;text-transform:capitalize">
            ${item.category}
          </span>
        </td>
        <td>
          <span style="font-family:var(--font-display);font-weight:800;color:var(--primary)">
            ${item.price.toFixed(2)}€
          </span>
        </td>
        <td style="text-align:center">
          <label class="stock-toggle-switch">
            <input type="checkbox" class="dish-stock-toggle" data-dish-id="${item.id}" ${item.available !== false ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
          <div style="font-size:0.7rem;color:${item.available !== false ? 'var(--success)' : 'var(--danger)'};font-weight:700;margin-top:2px">
            ${item.available !== false ? 'Disponível' : 'Esgotado'}
          </div>
        </td>
      </tr>
    `).join('');

    // Bind stock toggle switches
    el.menuTableBody.querySelectorAll('.dish-stock-toggle').forEach(input => {
      input.addEventListener('change', () => {
        const dishId = input.getAttribute('data-dish-id');
        CamadaDB.toggleItemAvailability(dishId);
        renderAdminMenu();
      });
    });
  }

  function renderStatsAndOrders() {
    const orders = CamadaDB.getOrders();
    const totalOrdersCount = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Calculate most ordered dish
    const dishCounts = {};
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        dishCounts[it.name] = (dishCounts[it.name] || 0) + it.qty;
      });
    });

    let topDishName = 'Francesinha Camada';
    let topDishQty = 0;
    for (const [name, qty] of Object.entries(dishCounts)) {
      if (qty > topDishQty) {
        topDishQty = qty;
        topDishName = name;
      }
    }

    if (el.totalOrdersStat) el.totalOrdersStat.textContent = totalOrdersCount;
    if (el.totalSalesStat) el.totalSalesStat.textContent = `${totalSales.toFixed(2)}€`;
    if (el.topDishStat) el.topDishStat.textContent = totalOrdersCount > 0 ? `${topDishName} (${topDishQty})` : '—';

    // Render Orders History
    if (el.ordersHistoryBody) {
      if (orders.length === 0) {
        el.ordersHistoryBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center;color:var(--text-dim);padding:2rem">
              Sem pedidos registados hoje.
            </td>
          </tr>
        `;
        return;
      }

      el.ordersHistoryBody.innerHTML = orders.map(o => `
        <tr>
          <td><strong style="color:var(--primary)">${o.id}</strong></td>
          <td><strong>${o.mesa}</strong></td>
          <td>
            <div style="font-size:0.8rem">
              ${o.items.map(it => `<div>${it.qty}x ${it.name}</div>`).join('')}
            </div>
          </td>
          <td style="font-family:var(--font-display);font-weight:800;color:#fff">${o.total.toFixed(2)}€</td>
          <td>
            <span class="tracking-status-badge status-${o.status}" style="font-size:0.7rem">
              ${o.status}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  function bindEvents() {
    document.getElementById('resetMenuBtn')?.addEventListener('click', () => {
      if (confirm('Tem a certeza que deseja repor a ementa padrão do Camada Santo Tirso?')) {
        CamadaDB.resetMenuToDefault();
        renderAdminMenu();
      }
    });

    document.getElementById('adminClearAllOrdersBtn')?.addEventListener('click', () => {
      if (confirm('Atenção: Deseja apagar todo o histórico de pedidos e reiniciar as métricas?')) {
        CamadaDB.clearAllOrders();
        renderStatsAndOrders();
      }
    });
  }

  function bindSyncEvents() {
    document.addEventListener('camada:new_order', () => renderStatsAndOrders());
    document.addEventListener('camada:order_updated', () => renderStatsAndOrders());
    document.addEventListener('camada:menu_updated', () => renderAdminMenu());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
