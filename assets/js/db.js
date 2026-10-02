/**
 * Camada Database & Real-Time Synchronization Engine
 * Handles persistent storage, initial Camada menu, orders state & cross-tab messaging.
 */

const CamadaDB = (function() {
  const STORAGE_KEYS = {
    MENU: 'camada_menu_items_v1',
    ORDERS: 'camada_orders_v1',
    SERVICE_CALLS: 'camada_service_calls_v1',
    RESTAURANT_CONFIG: 'camada_restaurant_config_v1'
  };

  // Initial Menu for Camada Santo Tirso
  const DEFAULT_MENU = [
    // --- FRANCESINHAS ---
    {
      id: 'fra-01',
      name: 'Francesinha Camada Forno a Lenha',
      category: 'francesinhas',
      badge: 'Assinatura',
      price: 13.50,
      image: 'assets/images/francesinha.jpg',
      description: 'Bife de novilho tenro, queijo flamengo abundante, fiambre, linguiça regional, salsicha fresca e molho secreto Camada apurado com cerveja artesanal e toque de especiarias.',
      prepTime: '15-20 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Ovo Estrelado à Francesinha', price: 1.00 },
        { name: 'Dose de Batata Frita Rústica Extra', price: 2.20 },
        { name: 'Molho Camada Extra em Molheira', price: 1.50 },
        { name: 'Bacon Crocante Fumado', price: 1.50 },
        { name: 'Queijo Extra Gratinado', price: 1.50 }
      ]
    },
    {
      id: 'fra-02',
      name: 'Francesinha Especial Camada c/ Ovo e Batata',
      category: 'francesinhas',
      badge: 'Mais Pedido',
      price: 14.90,
      image: 'assets/images/francesinha.jpg',
      description: 'A clássica Francesinha Camada coroada com ovo estrelado de gema líquida perfeita e rodeada de batatas fritas rústicas e estaladiças da casa.',
      prepTime: '15-20 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Bife Extra de Novilho', price: 3.50 },
        { name: 'Molho Camada Extra em Molheira', price: 1.50 },
        { name: 'Bacon Crocante Fumado', price: 1.50 },
        { name: 'Queijo da Serra Adicional', price: 2.50 }
      ]
    },
    {
      id: 'fra-03',
      name: 'Francesinha de Frango & Cogumelos Frescos',
      category: 'francesinhas',
      badge: 'Suave',
      price: 12.90,
      image: 'assets/images/francesinha.jpg',
      description: 'Bife de frango suculento grelhado na chapa, cogumelos frescos laminados, queijo fundido e molho suave especial Camada.',
      prepTime: '15 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Ovo Estrelado', price: 1.00 },
        { name: 'Batata Rústica Estaladiça', price: 2.00 },
        { name: 'Molho Extra', price: 1.50 }
      ]
    },
    {
      id: 'fra-04',
      name: 'Francesinha Vegetariana Camada',
      category: 'francesinhas',
      badge: 'Vegetariano',
      price: 12.50,
      image: 'assets/images/francesinha.jpg',
      description: 'Hambúrguer artesanal de grão e legumes da época, cogumelos Portobello grelhados, courgette, queijo fundido e molho vegetariano exclusivo.',
      prepTime: '15 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Ovo Estrelado Bio', price: 1.00 },
        { name: 'Batata Rústica Extra', price: 2.00 },
        { name: 'Queijo Vegan Alternativo', price: 1.50 }
      ]
    },

    // --- CACHORRINHOS ---
    {
      id: 'cac-01',
      name: 'Cachorrinho Camada Especial',
      category: 'cachorrinhos',
      badge: 'Petisco de Ouro',
      price: 7.20,
      image: 'assets/images/cachorrinho.jpg',
      description: 'Pão rústico fino e super crocante, salsicha fresca e linguiça selecionada, queijo derretido a fio, pincelado generosamente com molho picante artesanal. Fatiado em pedaços.',
      prepTime: '10-12 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Dose Batata Frita Camada', price: 2.00 },
        { name: 'Molho Picante Extra', price: 0.80 },
        { name: 'Bacon Picado', price: 1.20 }
      ]
    },
    {
      id: 'cac-02',
      name: 'Cachorrinho c/ Queijo Cheddar & Bacon',
      category: 'cachorrinhos',
      badge: 'Crocante',
      price: 7.90,
      image: 'assets/images/cachorrinho.jpg',
      description: 'Variante moderna do cachorrinho tradicional com blend de cheddar inglês cremoso, pedaços estaladiços de bacon e molho especial tostado no forno.',
      prepTime: '10-12 min',
      available: true,
      hasSauceChoice: true,
      options: [
        { name: 'Dose Batata Frita Camada', price: 2.00 },
        { name: 'Molho Piri-Piri da Casa', price: 0.80 }
      ]
    },

    // --- ENTRADAS & PETISCOS ---
    {
      id: 'ent-01',
      name: 'Batatas Camada c/ Cheddar Fundido & Bacon',
      category: 'entradas',
      badge: 'Para Partilhar',
      price: 6.50,
      image: 'assets/images/entradas.jpg',
      description: 'Batata rústica aos gomos com casca frita em azeite, coberta com creme aveludado de queijo cheddar derretido, pedacinhos crocantes de bacon e cebolinho fresco.',
      prepTime: '8-10 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Molho Picante Camada à parte', price: 1.00 },
        { name: 'Dose Dupla de Queijo Cheddar', price: 1.80 }
      ]
    },
    {
      id: 'ent-02',
      name: 'Croquetes Artesanais de Alheira c/ Mostarda e Mel',
      category: 'entradas',
      badge: '4 Unidades',
      price: 5.90,
      image: 'assets/images/entradas.jpg',
      description: 'Croquetes estaladiços feitos de alheira tradicional de Trás-os-Montes e maçã reineta, acompanhados pelo nosso dip de mostarda Dijon antiga e mel silvestre.',
      prepTime: '8 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Unidade Adicional (+1 Croquete)', price: 1.50 }
      ]
    },
    {
      id: 'ent-03',
      name: 'Pica-Pau do Lombo à Moda de Santo Tirso',
      category: 'entradas',
      badge: 'Típico',
      price: 9.80,
      image: 'assets/images/entradas.jpg',
      description: 'Cubos tenros de vitela nacional salteados em azeite, alho esmagado, louro, vinho branco e pickles artesanais com azeitonas marinadas.',
      prepTime: '12 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Cesto de Pão Tostado a Lenha', price: 1.20 }
      ]
    },

    // --- BEBIDAS & SANGRIA ---
    {
      id: 'beb-01',
      name: 'Sangria Especial de Frutos Vermelhos (Jarro 1.5L)',
      category: 'bebidas',
      badge: 'Exclusivo',
      price: 13.90,
      image: 'assets/images/sangria.jpg',
      description: 'A sangria de referência do Camada: vinho tinto ou espumante, morangos, framboesas, mirtilos frescos, canela em pau, hortelã da horta e espelho de licor.',
      prepTime: '5 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Base com Vinho Branco', price: 0.00 },
        { name: 'Base com Espumante Bruto (+2.50€)', price: 2.50 }
      ]
    },
    {
      id: 'beb-02',
      name: 'Fino Super Bock Especial Tirado à Pressão (25cl)',
      category: 'bebidas',
      badge: 'Bem Fresco',
      price: 1.80,
      image: 'assets/images/sangria.jpg',
      description: 'Fino de pressão gelado servido com colarinho cremoso em copo fresco e impecável.',
      prepTime: '2 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Tamanho Príncipe / Caneca (40cl)', price: 1.00 }
      ]
    },
    {
      id: 'beb-03',
      name: 'Cerveja Artesanal IPA Nortada (33cl)',
      category: 'bebidas',
      badge: 'Artesanal',
      price: 3.50,
      image: 'assets/images/sangria.jpg',
      description: 'Cerveja artesanal com notas cítricas e amargor equilibrado que harmoniza na perfeição com o molho da Francesinha.',
      prepTime: '2 min',
      available: true,
      hasSauceChoice: false,
      options: []
    },
    {
      id: 'beb-04',
      name: 'Vinho Verde Loureiro D.O.C. (Garrafa 75cl)',
      category: 'bebidas',
      badge: 'Região do Minho',
      price: 11.50,
      image: 'assets/images/sangria.jpg',
      description: 'Vinho verde regional de aroma floral elegante, acidez fresca e final de boca mineral vibrante.',
      prepTime: '2 min',
      available: true,
      hasSauceChoice: false,
      options: []
    },

    // --- SOBREMESAS ---
    {
      id: 'sob-01',
      name: 'Cheesecake Forno Camada c/ Coulis de Frutos Silvestres',
      category: 'sobremesas',
      badge: 'Caseiro',
      price: 4.80,
      image: 'assets/images/sobremesa.jpg',
      description: 'Base estaladiça de bolacha torrada com manteiga, creme rico de queijo assado ao forno e calda brilhante e sumarenta de frutos silvestres com hortelã fresca.',
      prepTime: '3 min',
      available: true,
      hasSauceChoice: false,
      options: [
        { name: 'Bola de Gelado de Baunilha', price: 1.50 }
      ]
    },
    {
      id: 'sob-02',
      name: 'Bolo de Bolacha Especial da Avó c/ Creme de Manteiga',
      category: 'sobremesas',
      badge: 'Tradição',
      price: 4.20,
      image: 'assets/images/sobremesa.jpg',
      description: 'Camadas generosas de bolacha Maria embebida em café aromático e intercalada com creme aveludado tradicional de manteiga.',
      prepTime: '3 min',
      available: true,
      hasSauceChoice: false,
      options: []
    },
    {
      id: 'sob-03',
      name: 'Mousse de Chocolate Negro 70% c/ Flor de Sal',
      category: 'sobremesas',
      badge: 'Intenso',
      price: 4.50,
      image: 'assets/images/sobremesa.jpg',
      description: 'Textura arejada e rica feita com cacau puro, finalizada com raspas de chocolate e um toque delicado de flor de sal.',
      prepTime: '3 min',
      available: true,
      hasSauceChoice: false,
      options: []
    }
  ];

  // Broadcast Channel for live zero-latency cross-tab communication
  let broadcastChannel = null;
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('camada_sync_channel');
      broadcastChannel.onmessage = function(event) {
        handleIncomingMessage(event.data);
      };
    }
  } catch (e) {
    console.warn("BroadcastChannel not supported in this context, using storage listener fallback.");
  }

  // Cross-tab storage event fallback
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEYS.ORDERS || e.key === STORAGE_KEYS.MENU || e.key === STORAGE_KEYS.SERVICE_CALLS) {
      notifyListeners(e.key);
    }
  });

  function broadcastEvent(type, payload) {
    const message = { type, payload, timestamp: Date.now() };
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(message);
      } catch (err) {
        console.warn("BroadcastChannel post error", err);
      }
    }
    // Also trigger in current window
    handleIncomingMessage(message);
  }

  function handleIncomingMessage(msg) {
    if (!msg || !msg.type) return;
    const customEvt = new CustomEvent('camada:sync', { detail: msg });
    document.dispatchEvent(customEvt);

    if (msg.type === 'NEW_ORDER') {
      document.dispatchEvent(new CustomEvent('camada:new_order', { detail: msg.payload }));
    } else if (msg.type === 'ORDER_STATUS_CHANGED') {
      document.dispatchEvent(new CustomEvent('camada:order_updated', { detail: msg.payload }));
    } else if (msg.type === 'MENU_UPDATED') {
      document.dispatchEvent(new CustomEvent('camada:menu_updated', { detail: msg.payload }));
    } else if (msg.type === 'SERVICE_CALL') {
      document.dispatchEvent(new CustomEvent('camada:service_call', { detail: msg.payload }));
    }
  }

  function notifyListeners(key) {
    if (key === STORAGE_KEYS.ORDERS) {
      document.dispatchEvent(new CustomEvent('camada:orders_storage_changed', { detail: getOrders() }));
    } else if (key === STORAGE_KEYS.MENU) {
      document.dispatchEvent(new CustomEvent('camada:menu_storage_changed', { detail: getMenuItems() }));
    }
  }

  // --- MENU METHODS ---
  function getMenuItems() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading menu from storage", e);
    }
    // Initialize default menu
    saveMenuItems(DEFAULT_MENU, false);
    return DEFAULT_MENU;
  }

  function saveMenuItems(items, notify = true) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
    if (notify) {
      broadcastEvent('MENU_UPDATED', items);
    }
  }

  function toggleItemAvailability(itemId) {
    const items = getMenuItems();
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.available = !item.available;
      saveMenuItems(items, true);
      return item.available;
    }
    return false;
  }

  function updateMenuItem(updatedItem) {
    const items = getMenuItems();
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
    } else {
      items.push(updatedItem);
    }
    saveMenuItems(items, true);
  }

  function deleteMenuItem(itemId) {
    let items = getMenuItems();
    items = items.filter(i => i.id !== itemId);
    saveMenuItems(items, true);
  }

  function resetMenuToDefault() {
    saveMenuItems(DEFAULT_MENU, true);
    return DEFAULT_MENU;
  }

  // --- ORDERS METHODS ---
  function getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading orders", e);
    }
    return [];
  }

  function saveOrders(orders, notify = true) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    if (notify) {
      // triggers storage listener on other tabs
    }
  }

  function createOrder({ mesa, items, notes = '', customerName = '', paymentPreference = 'No Fim (Multibanco / Dinheiro)' }) {
    const orders = getOrders();
    const orderNumber = 100 + orders.length + 1;
    const orderId = `CAM-${orderNumber}`;

    const total = items.reduce((sum, item) => {
      const extrasSum = (item.extras || []).reduce((eSum, ext) => eSum + (ext.price || 0), 0);
      return sum + ((item.price + extrasSum) * item.qty);
    }, 0);

    const newOrder = {
      id: orderId,
      mesa: mesa || 'Mesa 1',
      items: items,
      notes: notes,
      customerName: customerName,
      paymentPreference: paymentPreference,
      total: parseFloat(total.toFixed(2)),
      status: 'pendente', // 'pendente' | 'preparando' | 'pronto' | 'entregue'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        { status: 'pendente', timestamp: new Date().toISOString(), label: 'Recebido na Cozinha' }
      ]
    };

    orders.unshift(newOrder); // newest first
    saveOrders(orders, true);

    broadcastEvent('NEW_ORDER', newOrder);
    return newOrder;
  }

  function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    
    let statusLabel = 'Atualizado';
    if (newStatus === 'preparando') statusLabel = 'Em Preparação no Forno';
    else if (newStatus === 'pronto') statusLabel = 'Pronto a Servir';
    else if (newStatus === 'entregue') statusLabel = 'Entregue na Mesa';

    if (!order.history) order.history = [];
    order.history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      label: statusLabel
    });

    saveOrders(orders, true);
    broadcastEvent('ORDER_STATUS_CHANGED', order);
    return order;
  }

  function getOrdersByTable(mesa) {
    const orders = getOrders();
    return orders.filter(o => o.mesa.toLowerCase() === mesa.toLowerCase());
  }

  function clearAllOrders() {
    saveOrders([], true);
    broadcastEvent('ORDER_STATUS_CHANGED', { cleared: true });
  }

  // --- SERVICE CALLS (Chamar Empregado / Conta) ---
  function getServiceCalls() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICE_CALLS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn(e);
    }
    return [];
  }

  function callService({ mesa, type = 'chamar_empregado', details = '' }) {
    const calls = getServiceCalls();
    const callObj = {
      id: `CALL-${Date.now().toString().slice(-4)}`,
      mesa,
      type, // 'chamar_empregado' | 'pedir_conta' | 'talheres'
      details,
      status: 'pendente',
      timestamp: new Date().toISOString()
    };
    calls.unshift(callObj);
    localStorage.setItem(STORAGE_KEYS.SERVICE_CALLS, JSON.stringify(calls));
    broadcastEvent('SERVICE_CALL', callObj);
    return callObj;
  }

  function dismissServiceCall(callId) {
    const calls = getServiceCalls();
    const item = calls.find(c => c.id === callId);
    if (item) {
      item.status = 'atendido';
      localStorage.setItem(STORAGE_KEYS.SERVICE_CALLS, JSON.stringify(calls));
      broadcastEvent('SERVICE_CALL', { dismissed: callId });
    }
  }

  // --- CONFIG / RESTAURANT INFO ---
  function getRestaurantConfig() {
    return {
      name: 'CAMADA',
      subname: 'Francesinhas & Cerveja Artesanal',
      city: 'Santo Tirso',
      address: 'Largo Coronel Baptista Coelho, Santo Tirso',
      phone: '+351 252 851 200',
      currency: '€',
      tablesCount: 24,
      isOpen: true
    };
  }

  return {
    getMenuItems,
    saveMenuItems,
    toggleItemAvailability,
    updateMenuItem,
    deleteMenuItem,
    resetMenuToDefault,
    getOrders,
    createOrder,
    updateOrderStatus,
    getOrdersByTable,
    clearAllOrders,
    getServiceCalls,
    callService,
    dismissServiceCall,
    getRestaurantConfig,
    broadcastEvent
  };
})();

window.CamadaDB = CamadaDB;
