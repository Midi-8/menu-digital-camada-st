/**
 * Camada QR Code Generator & Table Stand Manager
 */

(function() {
  let selectedTableNumber = 1;
  let customBaseUrl = '';
  let qrCodeInstance = null;

  const el = {
    tablesGrid: document.getElementById('qrTablesGrid'),
    qrContainer: document.getElementById('qrCodeContainer'),
    standTableBadge: document.getElementById('standTableBadge'),
    standUrlPreview: document.getElementById('standUrlPreview'),
    customBaseUrlInput: document.getElementById('customBaseUrlInput'),
    downloadQrBtn: document.getElementById('downloadQrBtn'),
    printStandBtn: document.getElementById('printStandBtn'),
    printAllStandsBtn: document.getElementById('printAllStandsBtn')
  };

  function init() {
    initDefaultBaseUrl();
    renderTableSelectorButtons();
    updateQrCode();
    bindEvents();
  }

  function initDefaultBaseUrl() {
    let currentOrigin = window.location.origin;
    let path = window.location.pathname;
    // Replace qrcodes.html with menu.html
    let menuPath = path.replace(/qrcodes\.html$/i, 'menu.html');
    if (!menuPath.endsWith('menu.html')) {
      menuPath = menuPath.replace(/\/?$/, '/menu.html');
    }
    customBaseUrl = `${currentOrigin}${menuPath}`;
    if (el.customBaseUrlInput) {
      el.customBaseUrlInput.value = customBaseUrl;
    }
  }

  function getFullTableUrl(tableNum) {
    const base = (el.customBaseUrlInput ? el.customBaseUrlInput.value.trim() : '') || customBaseUrl;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}mesa=${encodeURIComponent('Mesa ' + tableNum)}`;
  }

  function renderTableSelectorButtons() {
    if (!el.tablesGrid) return;
    let html = '';
    for (let i = 1; i <= 24; i++) {
      html += `
        <button class="table-select-btn ${i === selectedTableNumber ? 'active' : ''}" data-table-num="${i}">
          Mesa ${i}
        </button>
      `;
    }
    el.tablesGrid.innerHTML = html;

    el.tablesGrid.querySelectorAll('.table-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.tablesGrid.querySelectorAll('.table-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTableNumber = parseInt(btn.getAttribute('data-table-num'), 10);
        updateQrCode();
      });
    });
  }

  function updateQrCode() {
    const tableUrl = getFullTableUrl(selectedTableNumber);

    if (el.standTableBadge) {
      el.standTableBadge.textContent = `MESA ${selectedTableNumber}`;
    }
    if (el.standUrlPreview) {
      el.standUrlPreview.textContent = tableUrl;
    }

    if (el.qrContainer && window.QRCode) {
      el.qrContainer.innerHTML = '';
      qrCodeInstance = new window.QRCode(el.qrContainer, {
        text: tableUrl,
        width: 220,
        height: 220,
        colorDark: '#0d0f14',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : 2
      });
    }
  }

  function downloadQrCode() {
    const canvas = el.qrContainer ? el.qrContainer.querySelector('canvas') : null;
    if (!canvas) {
      alert('Não foi possível gerar a imagem do QR Code.');
      return;
    }
    const link = document.createElement('a');
    link.download = `QR_Camada_Mesa_${selectedTableNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function printCurrentStand() {
    window.print();
  }

  function printAllStands() {
    // Generate temporary printable batch in a print-ready container
    const printArea = document.createElement('div');
    printArea.id = 'batchPrintArea';
    printArea.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: #fff;
      z-index: 99999;
    `;

    for (let i = 1; i <= 24; i++) {
      const stand = document.createElement('div');
      stand.className = 'printable-stand-preview';
      stand.style.margin = '2cm auto';
      stand.style.pageBreakAfter = 'always';
      stand.style.width = '12cm';
      stand.style.border = '2px solid #ddd';

      stand.innerHTML = `
        <div class="stand-brand">CAMADA</div>
        <div class="stand-city">SANTO TIRSO</div>
        <div class="stand-table-badge">MESA ${i}</div>
        <div class="stand-qr-box" id="batchQr_${i}" style="margin:1rem auto;width:200px;height:200px"></div>
        <div class="stand-instruction">Aponte a câmara do telemóvel</div>
        <div class="stand-subtext">Aceda à ementa digital e envie o pedido diretamente à cozinha</div>
      `;

      printArea.appendChild(stand);
    }

    document.body.appendChild(printArea);

    // Render QRs for all
    for (let i = 1; i <= 24; i++) {
      const qrEl = document.getElementById(`batchQr_${i}`);
      if (qrEl && window.QRCode) {
        new window.QRCode(qrEl, {
          text: getFullTableUrl(i),
          width: 180,
          height: 180,
          colorDark: '#0d0f14',
          colorLight: '#ffffff'
        });
      }
    }

    setTimeout(() => {
      window.print();
      printArea.remove();
    }, 500);
  }

  function bindEvents() {
    if (el.customBaseUrlInput) {
      el.customBaseUrlInput.addEventListener('input', () => {
        updateQrCode();
      });
    }

    if (el.downloadQrBtn) {
      el.downloadQrBtn.addEventListener('click', downloadQrCode);
    }

    if (el.printStandBtn) {
      el.printStandBtn.addEventListener('click', printCurrentStand);
    }

    if (el.printAllStandsBtn) {
      el.printAllStandsBtn.addEventListener('click', printAllStands);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
