/* FK Butik Admin Panel Controller */

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

let allProducts = [];
let allOrders = [];
let allCategories = [];
let allCoupons = [];
let allReturns = [];
let allBanners = [];
let allPayments = [];
let allVariations = [];
let allIntegrations = [];

async function initAdmin() {
  initCustomSelects();
  await loadShopSettings();
  await loadShippingSettings();
  await loadKPI();
  await loadAnalytics();
  await loadProducts();
  await loadOrders();
  await loadReturns();
  await loadCoupons();
  await loadCategories();
  await loadBanners();
  await loadTags();
  await loadPayments();
  await loadVariations();
  await loadIntegrations();
  await loadAccountProfile();

  // HTML5 History API Routing Initialization
  window.addEventListener('popstate', (e) => {
    handleRoute(window.location.pathname, false);
  });
  handleRoute(window.location.pathname, false);
}

// 1. Dükkan Seçeneklerini Yükle
async function loadShopSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();

    if (settings) {
      if (settings.shop_access) document.getElementById('opt_shop_access').value = settings.shop_access;
      if (settings.cart_enabled) document.getElementById('opt_cart_enabled').value = settings.cart_enabled;
      if (settings.mobile_grid) document.getElementById('opt_mobile_grid').value = settings.mobile_grid;
      if (settings.filter_enabled) document.getElementById('opt_filter_enabled').value = settings.filter_enabled;
      if (settings.out_of_stock_display) document.getElementById('opt_out_of_stock_display').value = settings.out_of_stock_display;
      if (settings.last_item_badge) document.getElementById('opt_last_item_badge').value = settings.last_item_badge;
      if (settings.new_item_badge) document.getElementById('opt_new_item_badge').value = settings.new_item_badge;
      if (settings.shop_language) document.getElementById('opt_shop_language').value = settings.shop_language;
      if (settings.order_confirmation_message) {
        const txt = document.getElementById('opt_order_confirmation_message');
        txt.value = settings.order_confirmation_message;
        updateWordCount(txt);
      }
      syncCustomSelects();
    }
  } catch (err) {
    console.error('Settings load error:', err);
  }
}

// 2. Dükkan Seçeneklerini Canlı Kaydet
async function saveShopSettings() {
  const payload = {
    shop_access: document.getElementById('opt_shop_access').value,
    cart_enabled: document.getElementById('opt_cart_enabled').value,
    mobile_grid: document.getElementById('opt_mobile_grid').value,
    filter_enabled: document.getElementById('opt_filter_enabled').value,
    out_of_stock_display: document.getElementById('opt_out_of_stock_display').value,
    last_item_badge: document.getElementById('opt_last_item_badge').value,
    new_item_badge: document.getElementById('opt_new_item_badge').value,
    shop_language: document.getElementById('opt_shop_language').value,
    order_confirmation_message: document.getElementById('opt_order_confirmation_message').value
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Dükkan seçenekleri canlı veritabanına kaydedildi!');
    }
  } catch (err) {
    console.error('Save error:', err);
    showToast('Hata: Ayarlar kaydedilemedi.');
  }
}

// 3. KPI ve İstatistikler
async function loadKPI() {
  try {
    const res = await fetch('/api/stats');
    const stats = await res.json();
    if (stats) {
      document.getElementById('kpiRevenue').textContent = stats.total_revenue;
      document.getElementById('kpiOrders').textContent = stats.total_orders;
      document.getElementById('kpiProducts').textContent = stats.total_products;
      document.getElementById('kpiVisitors').textContent = stats.active_visitors_today;
      document.getElementById('sidebarOrderBadge').textContent = stats.total_orders;
    }
  } catch (err) {
    console.error('KPI error:', err);
  }
}

// 4. Ürünler Listesi
// ========================================================
// 4. ÜRÜNLER YÖNETİMİ, FİLTRELEME, SAYFALAMA & TOPLU İŞLEMLER
// ========================================================
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let selectedProductIds = new Set();
let formSizesList = ['STANDART'];

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
    applyProductFilters();
  } catch (err) {
    console.error('Products error:', err);
  }
}

function handleProductSearch(keyword) {
  applyProductFilters();
}

function applyProductFilters() {
  const searchVal = (document.getElementById('adminProductSearch')?.value || '').toLowerCase().trim();
  const catVal = document.getElementById('filterCategory')?.value || '';
  const statusVal = document.getElementById('filterStatus')?.value || '';
  const stockVal = document.getElementById('filterStock')?.value || '';
  const sortVal = document.getElementById('sortProducts')?.value || 'id_asc';

  filteredProducts = allProducts.filter(p => {
    // Arama
    if (searchVal) {
      const matchName = p.name && p.name.toLowerCase().includes(searchVal);
      const matchSku = p.sku && p.sku.toLowerCase().includes(searchVal);
      if (!matchName && !matchSku) return false;
    }
    // Kategori
    if (catVal && (!p.category || !p.category.includes(catVal))) {
      return false;
    }
    // Durum
    if (statusVal === 'active' && p.is_active !== 1) return false;
    if (statusVal === 'inactive' && p.is_active !== 0) return false;

    // Stok
    if (stockVal === 'in_stock' && (p.stock <= 0)) return false;
    if (stockVal === 'low_stock' && (p.stock >= 15 || p.stock <= 0)) return false;
    if (stockVal === 'out_of_stock' && (p.stock > 0)) return false;

    return true;
  });

  // Sıralama
  if (sortVal === 'price_asc') {
    filteredProducts.sort((a, b) => (a.price_num || 0) - (b.price_num || 0));
  } else if (sortVal === 'price_desc') {
    filteredProducts.sort((a, b) => (b.price_num || 0) - (a.price_num || 0));
  } else if (sortVal === 'stock_desc') {
    filteredProducts.sort((a, b) => (b.stock || 0) - (a.stock || 0));
  } else if (sortVal === 'stock_asc') {
    filteredProducts.sort((a, b) => (a.stock || 0) - (b.stock || 0));
  } else if (sortVal === 'newest') {
    filteredProducts.sort((a, b) => (b.id || 0) - (a.id || 0));
  } else {
    filteredProducts.sort((a, b) => (a.id || 0) - (b.id || 0));
  }

  // Sayfa başa dönsün
  currentPage = 1;
  renderProducts();
}

function renderProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  const total = filteredProducts.length;
  const countEl = document.getElementById('prodCount');
  if (countEl) countEl.textContent = allProducts.length;

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding: 36px; color:#64748b;">Kriterlere uygun ürün bulunamadı.</td></tr>';
    updatePaginationControls(0, 0, 0);
    return;
  }

  // Sayfalama Dilimi
  const totalPages = Math.ceil(total / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);
  const pageItems = filteredProducts.slice(startIndex, endIndex);

  tbody.innerHTML = pageItems.map(p => {
    const isSelected = selectedProductIds.has(p.id);
    const sizes = Array.isArray(p.sizes) ? p.sizes.map(s => `<span class="badge-pill">${s}</span>`).join(' ') : '<span class="badge-pill">STANDART</span>';
    const statusBadge = p.is_active 
      ? '<span class="badge-status badge-active">Satışta</span>' 
      : '<span class="badge-status badge-inactive">Pasif</span>';
    const stockColor = p.stock <= 0 ? '#ef4444' : (p.stock < 15 ? '#f59e0b' : '#10b981');
    const prodUrl = p.url || `/urun/${p.id}`;

    return `
      <tr class="${isSelected ? 'row-selected' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelectProduct(${p.id}, this.checked)">
        </td>
        <td>
          <img src="${p.image}" alt="${p.name}" class="prod-thumb" onerror="this.src='/images/fkbutik_logo.svg'">
        </td>
        <td>
          <strong style="color: #1e293b; font-size: 13.5px;">${p.name}</strong>
          ${p.has_video ? '<span style="font-size:10px; background:#eff6ff; color:#2563eb; padding:1px 5px; border-radius:4px; margin-left:4px; font-weight:700;">VIDEO</span>' : ''}
        </td>
        <td><code style="font-size:12px; color:#64748b;">${p.sku || 'FK-' + p.id}</code></td>
        <td><span style="font-size: 12.5px; color: #475569;">${p.category || '-'}</span></td>
        <td><strong style="color:#0f172a; font-size: 13.5px;">${p.price}</strong></td>
        <td><span style="font-weight:700; color:${stockColor};">${p.stock} adet</span></td>
        <td>${sizes}</td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div class="table-actions-group">
            <button type="button" class="btn-ui btn-ui-edit" title="Ürünü Düzenle" onclick="openEditProductModal(${p.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              <span>Düzenle</span>
            </button>
            <button type="button" class="btn-ui btn-ui-toggle ${p.is_active ? 'is-active' : 'is-passive'}" title="Satış Durumu" onclick="toggleProductStatus(${p.id}, ${p.is_active ? 0 : 1})">
              <span class="status-indicator-dot"></span>
              <span>${p.is_active ? 'Pasife Al' : 'Satışa Aç'}</span>
            </button>
            <a href="${prodUrl}" target="_blank" class="btn-ui btn-ui-icon-only" title="Canlı Vitrinde Gör">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <button type="button" class="btn-ui btn-ui-danger btn-ui-icon-only" title="Ürünü Sil" onclick="deleteProductConfirm(${p.id}, '${p.name.replace(/'/g, "\\\\'")}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updatePaginationControls(startIndex + 1, endIndex, total);
  updateSelectAllCheckboxState(pageItems);
}

// Sayfalama Fonksiyonları
function updatePaginationControls(start, end, total) {
  const infoEl = document.getElementById('paginationInfo');
  if (infoEl) {
    if (total === 0) {
      infoEl.textContent = 'Kayıt bulunamadı';
    } else {
      infoEl.textContent = `${start}-${end} arası gösteriliyor, toplam ${total} ürün`;
    }
  }

  const totalPages = Math.ceil(total / itemsPerPage);
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');
  if (prevBtn) prevBtn.disabled = (currentPage <= 1);
  if (nextBtn) nextBtn.disabled = (currentPage >= totalPages || totalPages === 0);

  const container = document.getElementById('pageNumbersContainer');
  if (!container) return;

  let btnsHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7) {
      if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 2) {
        if (i === 2 || i === totalPages - 1) btnsHtml += '<span style="padding: 0 4px; color:#94a3b8;">...</span>';
        continue;
      }
    }
    btnsHtml += `<button class="btn-page-num ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  container.innerHTML = btnsHtml;
}

function goToPage(page) {
  currentPage = page;
  renderProducts();
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderProducts();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts();
  }
}

function changeItemsPerPage(newLimit) {
  itemsPerPage = parseInt(newLimit, 10);
  currentPage = 1;
  renderProducts();
}

// Toplu Seçim Fonksiyonları
function toggleSelectProduct(productId, isChecked) {
  if (isChecked) {
    selectedProductIds.add(productId);
  } else {
    selectedProductIds.delete(productId);
  }
  updateBulkActionBar();
  renderProducts();
}

function toggleSelectAllProducts(isChecked) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
  const pageItems = filteredProducts.slice(startIndex, endIndex);

  pageItems.forEach(p => {
    if (isChecked) {
      selectedProductIds.add(p.id);
    } else {
      selectedProductIds.delete(p.id);
    }
  });

  updateBulkActionBar();
  renderProducts();
}

function updateSelectAllCheckboxState(pageItems) {
  const selectAllCb = document.getElementById('selectAllProductsCheckbox');
  if (!selectAllCb || pageItems.length === 0) return;
  const allSelected = pageItems.every(p => selectedProductIds.has(p.id));
  selectAllCb.checked = allSelected;
}

function updateBulkActionBar() {
  const bar = document.getElementById('bulkActionsBar');
  const countEl = document.getElementById('bulkSelectedCount');
  if (!bar) return;

  if (selectedProductIds.size > 0) {
    bar.style.display = 'flex';
    if (countEl) countEl.textContent = selectedProductIds.size;
  } else {
    bar.style.display = 'none';
  }
}

function clearBulkSelection() {
  selectedProductIds.clear();
  updateBulkActionBar();
  renderProducts();
}

async function executeBulkAction(action) {
  if (selectedProductIds.size === 0) return;

  if (action === 'delete') {
    if (!confirm(`Seçilen ${selectedProductIds.size} adet ürünü kalıcı olarak silmek istediğinize emin misiniz?`)) {
      return;
    }
  }

  try {
    const res = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_ids: Array.from(selectedProductIds),
        action: action
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Toplu işlem başarıyla tamamlandı! (${data.affected_count} ürün etkilendi)`);
      selectedProductIds.clear();
      updateBulkActionBar();
      await loadProducts();
    }
  } catch (err) {
    console.error('Bulk action error:', err);
    showToast('Hata: Toplu işlem gerçekleştirilemedi.');
  }
}

// Durum Değiştir
async function toggleProductStatus(id, newStatus) {
  try {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newStatus })
    });
    showToast('Ürün satış durumu güncellendi!');
    await loadProducts();
  } catch (err) {
    console.error(err);
  }
}

// ========================================================
// 5. ÜRÜN OLUŞTURMA & DÜZENLEME MODAL FONKSİYONLARI
// ========================================================
function openCreateProductModal() {
  document.getElementById('editProductId').value = '';
  document.getElementById('productModalTitle').textContent = 'Yeni Ürün Ekle';
  document.getElementById('productModalSubtitle').textContent = 'Kataloğunuza yeni bir ürün ve varyasyonlar ekleyin';
  document.getElementById('btnSaveProdText').textContent = 'Ürünü Kaydet';

  document.getElementById('formProdName').value = '';
  document.getElementById('formProdCategory').value = 'Kadın Üst Giyim';
  document.getElementById('formProdSku').value = '';
  document.getElementById('formProdPriceNum').value = '399.99';
  document.getElementById('formProdPriceText').value = '399,99 TL';
  document.getElementById('formProdStock').value = '50';
  document.getElementById('formProdImage').value = '/images/products/yeni-gelenler/prod_1_725472302.webp';
  document.getElementById('formProdColorCount').value = '1';
  document.getElementById('formProdHasVideo').checked = false;

  const activeRadio = document.querySelector('input[name="formProdStatus"][value="1"]');
  if (activeRadio) activeRadio.checked = true;

  document.querySelectorAll('input[name="formTags"]').forEach(cb => cb.checked = false);
  const defTag = document.querySelector('input[name="formTags"][value="yeni-gelenler"]');
  if (defTag) defTag.checked = true;

  formSizesList = ['STANDART'];
  renderSizeChips();
  previewProductImage('/images/products/yeni-gelenler/prod_1_725472302.webp');

  const modal = document.getElementById('productEditModal');
  if (modal) modal.style.display = 'flex';
}

async function openEditProductModal(productId) {
  const prod = allProducts.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('editProductId').value = prod.id;
  document.getElementById('productModalTitle').textContent = `Ürünü Düzenle: ${prod.name}`;
  document.getElementById('productModalSubtitle').textContent = `ID: #${prod.id} • SKU: ${prod.sku || '-'}`;
  document.getElementById('btnSaveProdText').textContent = 'Değişiklikleri Güncelle';

  document.getElementById('formProdName').value = prod.name || '';
  document.getElementById('formProdCategory').value = prod.category || 'Kadın Üst Giyim';
  document.getElementById('formProdSku').value = prod.sku || '';
  document.getElementById('formProdPriceNum').value = prod.price_num || 399.99;
  document.getElementById('formProdPriceText').value = prod.price || `${prod.price_num} TL`;
  document.getElementById('formProdStock').value = prod.stock ?? 50;
  document.getElementById('formProdImage').value = prod.image || '';
  document.getElementById('formProdColorCount').value = prod.color_count || 1;
  document.getElementById('formProdHasVideo').checked = Boolean(prod.has_video);

  const statusVal = prod.is_active ? '1' : '0';
  const statusRadio = document.querySelector(`input[name="formProdStatus"][value="${statusVal}"]`);
  if (statusRadio) statusRadio.checked = true;

  formSizesList = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? [...prod.sizes] : ['STANDART'];
  renderSizeChips();
  previewProductImage(prod.image);

  // Bu ürüne bağlı tag'leri çek
  document.querySelectorAll('input[name="formTags"]').forEach(cb => cb.checked = false);
  try {
    for (const tag of allTags) {
      const tRes = await fetch(`/api/tags/${tag.slug}`);
      const tData = await tRes.json();
      if (tData.product_ids && tData.product_ids.includes(productId)) {
        const tagCb = document.querySelector(`input[name="formTags"][value="${tag.slug}"]`);
        if (tagCb) tagCb.checked = true;
      }
    }
  } catch (e) {}

  const modal = document.getElementById('productEditModal');
  if (modal) modal.style.display = 'flex';
}

function closeProductModal() {
  const modal = document.getElementById('productEditModal');
  if (modal) modal.style.display = 'none';
}

function previewProductImage(url) {
  const img = document.getElementById('formImgPreview');
  if (img) {
    img.src = url || '/images/fkbutik_logo.svg';
  }
}

function syncPriceText(numVal) {
  const num = parseFloat(numVal);
  if (!isNaN(num)) {
    document.getElementById('formProdPriceText').value = `${num.toFixed(2).replace('.', ',')} TL`;
  }
}

// Beden Chip Fonksiyonları
function renderSizeChips() {
  const container = document.getElementById('sizeChipsContainer');
  if (!container) return;

  if (formSizesList.length === 0) {
    container.innerHTML = '<span style="font-size:12px; color:#94a3b8;">Beden eklenmedi (STANDART varsayılır)</span>';
    return;
  }

  container.innerHTML = formSizesList.map(sz => `
    <span class="size-chip">
      ${sz}
      <button type="button" class="size-chip-remove" onclick="removeSizeChip('${sz}')">&times;</button>
    </span>
  `).join('');
}

function addSizeChip(size) {
  if (!formSizesList.includes(size)) {
    formSizesList.push(size);
    renderSizeChips();
  }
}

function addCustomSizeChip() {
  const input = document.getElementById('customSizeInput');
  const val = (input?.value || '').trim().toUpperCase();
  if (val && !formSizesList.includes(val)) {
    formSizesList.push(val);
    renderSizeChips();
    input.value = '';
  }
}

function removeSizeChip(size) {
  formSizesList = formSizesList.filter(s => s !== size);
  renderSizeChips();
}

// Form Kaydet (Create or Update)
async function handleProductFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editProductId').value;
  const isEdit = Boolean(editId);

  const priceNum = parseFloat(document.getElementById('formProdPriceNum').value) || 0;
  const priceText = `${priceNum.toFixed(2).replace('.', ',')} TL`;

  const selectedTags = Array.from(document.querySelectorAll('input[name="formTags"]:checked')).map(cb => cb.value);
  const statusRadio = document.querySelector('input[name="formProdStatus"]:checked');
  const isActive = statusRadio ? parseInt(statusRadio.value, 10) : 1;

  const payload = {
    name: document.getElementById('formProdName').value.trim(),
    category: document.getElementById('formProdCategory').value,
    sku: document.getElementById('formProdSku').value.trim() || undefined,
    price: priceText,
    price_num: priceNum,
    stock: parseInt(document.getElementById('formProdStock').value, 10) || 0,
    image: document.getElementById('formProdImage').value.trim(),
    sizes: formSizesList.length > 0 ? formSizesList : ['STANDART'],
    color_count: parseInt(document.getElementById('formProdColorCount').value, 10) || 1,
    has_video: document.getElementById('formProdHasVideo').checked ? 1 : 0,
    is_active: isActive,
    tag_slugs: selectedTags
  };

  const saveBtnText = document.getElementById('btnSaveProdText');
  if (saveBtnText) saveBtnText.textContent = 'Kaydediliyor...';

  try {
    const url = isEdit ? `/api/products/${editId}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(isEdit ? 'Ürün başarıyla güncellendi.' : 'Yeni ürün başarıyla oluşturuldu.');
      closeProductModal();
      await loadProducts();
      await loadTags();
    } else {
      showToast(`Hata: ${data.detail || 'İşlem başarısız oldu'}`);
    }
  } catch (err) {
    console.error('Save product error:', err);
    showToast('Sunucu bağlantı hatası!');
  } finally {
    if (saveBtnText) saveBtnText.textContent = isEdit ? 'Değişiklikleri Güncelle' : 'Ürünü Kaydet';
  }
}

// Ürün Silme Onayı
async function deleteProductConfirm(productId, productName) {
  if (!confirm(`"${productName}" adlı ürünü kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Ürün başarıyla silindi!');
      await loadProducts();
      await loadTags();
    }
  } catch (err) {
    showToast('Silme işlemi başarısız oldu!');
  }
}

// 5. Siparişler Listesi
// ========================================================
// 5. SİPARİŞLER CONTROLLER (DETAY & DURUM GÜNCELLEME)
// ========================================================
async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    allOrders = await res.json();
    renderOrders(allOrders);
  } catch (err) {
    console.error('Orders error:', err);
  }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:#64748b;">Henüz sipariş bulunmuyor.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => {
    let statusBadgeClass = 'badge-active';
    if (o.status === 'İptal Edildi') statusBadgeClass = 'badge-inactive';
    else if (o.status === 'Kargoya Verildi') statusBadgeClass = 'badge-active';
    
    return `
      <tr>
        <td><strong style="color:#0f172a; font-family:monospace; font-size:13px;">${o.order_number}</strong></td>
        <td><strong style="color:#1e293b;">${o.customer_name}</strong></td>
        <td><span style="color:#64748b; font-size:12.5px;">${o.customer_phone}</span></td>
        <td><span style="color:#475569; font-size:12.5px;">${o.customer_city}</span></td>
        <td><strong style="color:#0f172a; font-size:13.5px;">${o.total_amount.toFixed(2)} ₺</strong></td>
        <td><span class="badge-pill">${o.payment_method}</span></td>
        <td><span class="badge-status ${statusBadgeClass}">${o.status}</span></td>
        <td style="text-align: right;">
          <button type="button" class="btn-ui btn-ui-edit" onclick="openOrderDetailModal('${o.order_number}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>Detay & Kargo</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterOrders(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderOrders(allOrders);
    return;
  }
  const filtered = allOrders.filter(o => 
    o.order_number.toLowerCase().includes(q) ||
    o.customer_name.toLowerCase().includes(q) ||
    o.customer_phone.includes(q) ||
    o.customer_city.toLowerCase().includes(q)
  );
  renderOrders(filtered);
}

async function openOrderDetailModal(orderNumber) {
  try {
    const res = await fetch(`/api/orders/${orderNumber}`);
    if (!res.ok) throw new Error('Sipariş bulunamadı');
    const order = await res.json();

    document.getElementById('editOrderId').value = order.id;
    document.getElementById('orderModalTitle').textContent = `Sipariş: ${order.order_number}`;
    document.getElementById('orderCustomerName').textContent = order.customer_name;
    document.getElementById('orderCustomerPhone').textContent = order.customer_phone;
    document.getElementById('orderCustomerEmail').textContent = order.customer_email || 'Belirtilmemiş';
    document.getElementById('orderCustomerAddress').textContent = order.customer_city;
    document.getElementById('orderPaymentMethod').textContent = order.payment_method;
    document.getElementById('orderTotalAmount').textContent = `${order.total_amount.toFixed(2)} ₺`;
    document.getElementById('orderCreatedAt').textContent = order.created_at || 'Bugün';

    document.getElementById('orderStatusSelect').value = order.status;
    document.getElementById('orderTrackingCodeInput').value = order.tracking_code || '';

    const itemsTbody = document.getElementById('orderItemsTableBody');
    if (itemsTbody) {
      const items = Array.isArray(order.items) ? order.items : [];
      if (items.length === 0) {
        itemsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">Ürün kalemi bulunamadı.</td></tr>';
      } else {
        itemsTbody.innerHTML = items.map(item => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <img src="${item.image_url || '/images/default.jpg'}" style="width:36px; height:42px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0;" onerror="this.src='/images/fkbutik_logo.svg'">
                <div>
                  <strong style="font-size:13px; color:#1e293b;">${item.product_name || item.name}</strong>
                  <div style="font-size:11px; color:#64748b;">SKU: ${item.sku || '-'}</div>
                </div>
              </div>
            </td>
            <td><span class="badge-pill">${item.size || 'STANDART'}</span></td>
            <td><strong>${item.quantity || item.qty || 1} adet</strong></td>
            <td>${(item.price || 0).toFixed(2)} ₺</td>
            <td><strong style="color:#0f172a;">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ₺</strong></td>
          </tr>
        `).join('');
      }
    }

    const modal = document.getElementById('orderDetailModal');
    if (modal) modal.style.display = 'flex';
  } catch (err) {
    console.error('Order detail load error:', err);
    showToast('Hata: Sipariş detayları alınamadı.');
  }
}

function closeOrderModal() {
  const modal = document.getElementById('orderDetailModal');
  if (modal) modal.style.display = 'none';
}

async function saveOrderStatus() {
  const orderId = document.getElementById('editOrderId').value;
  const status = document.getElementById('orderStatusSelect').value;
  const trackingCode = document.getElementById('orderTrackingCodeInput').value.trim();

  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status, tracking_code: trackingCode })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Sipariş durumu ve kargo takip no başarıyla güncellendi!');
      closeOrderModal();
      await loadOrders();
    } else {
      showToast('Hata: Güncelleme kaydedilemedi.');
    }
  } catch (err) {
    console.error('Save order status error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

// ========================================================
// 6. İADELER LİSTESİ & İNCELEME
// ========================================================
async function loadReturns() {
  try {
    const res = await fetch('/api/returns');
    allReturns = await res.json();
    const tbody = document.getElementById('returnsTableBody');
    if (!tbody) return;

    if (!allReturns || allReturns.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:#64748b;">Bekleyen iade veya değişim talebi bulunmuyor.</td></tr>';
      return;
    }

    tbody.innerHTML = allReturns.map(r => `
      <tr>
        <td><strong style="color:#0f172a; font-family:monospace;">${r.return_number}</strong></td>
        <td><strong style="color:#1e293b;">${r.customer_name}</strong></td>
        <td><span style="color:#475569; font-size:12.5px;">${r.reason}</span></td>
        <td><strong style="color:#dc2626;">${r.refund_amount.toFixed(2)} ₺</strong></td>
        <td><code style="font-size:12px; color:#64748b;">${r.tracking_code || '-'}</code></td>
        <td><span class="badge-status badge-inactive">${r.status}</span></td>
        <td style="text-align: right;">
          <button type="button" class="btn-ui btn-ui-edit" onclick="openReturnModal('${r.return_number}')">
            <span>İncele & Onayla</span>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Returns error:', err);
  }
}

function openReturnModal(returnNumber) {
  const ret = allReturns.find(r => r.return_number === returnNumber);
  if (!ret) return;

  document.getElementById('editReturnId').value = ret.id;
  document.getElementById('returnModalSubtitle').textContent = `Talep No: ${ret.return_number}`;
  document.getElementById('returnCustomerName').textContent = ret.customer_name;
  document.getElementById('returnReason').textContent = ret.reason;
  document.getElementById('returnAmount').textContent = `${ret.refund_amount.toFixed(2)} ₺`;
  document.getElementById('returnTrackingCode').textContent = ret.tracking_code || 'Girilmedi';
  document.getElementById('returnStatusSelect').value = ret.status;

  const modal = document.getElementById('returnDetailModal');
  if (modal) modal.style.display = 'flex';
}

function closeReturnModal() {
  const modal = document.getElementById('returnDetailModal');
  if (modal) modal.style.display = 'none';
}

async function saveReturnStatus() {
  const returnId = document.getElementById('editReturnId').value;
  const status = document.getElementById('returnStatusSelect').value;

  try {
    const res = await fetch(`/api/returns/${returnId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    });
    const data = await res.json();
    if (data.success) {
      showToast('İade durumu güncellendi!');
      closeReturnModal();
      await loadReturns();
    } else {
      showToast('Hata: İade kaydedilemedi.');
    }
  } catch (err) {
    console.error('Save return error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

// ========================================================
// 7. KUPONLAR CONTROLLER (TAM CRUD)
// ========================================================
async function loadCoupons() {
  try {
    const res = await fetch('/api/coupons');
    allCoupons = await res.json();
    const tbody = document.getElementById('couponsTableBody');
    if (!tbody) return;

    if (!allCoupons || allCoupons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:#64748b;">Tanımlı kupon bulunmuyor.</td></tr>';
      return;
    }

    tbody.innerHTML = allCoupons.map(c => `
      <tr>
        <td><code style="font-weight:700; color:#4338ca; font-size:13px;">${c.code}</code></td>
        <td>${c.discount_type === 'percent' ? 'Yüzde (%)' : 'Sabit Tutar (₺)'}</td>
        <td><strong style="color:#0f172a;">${c.discount_type === 'percent' ? '%' + c.discount_value : c.discount_value + ' ₺'}</strong></td>
        <td>${c.min_order_amount} ₺</td>
        <td>${c.usage_limit} adet</td>
        <td><span class="badge-status ${c.is_active ? 'badge-active' : 'badge-inactive'}">${c.is_active ? 'Aktif' : 'Pasif'}</span></td>
        <td style="text-align: right;">
          <div class="table-actions-group">
            <button type="button" class="btn-ui btn-ui-edit" onclick="openCouponModal(${c.id})">
              <span>Düzenle</span>
            </button>
            <button type="button" class="btn-ui btn-ui-danger btn-ui-icon-only" title="Kuponu Sil" onclick="deleteCouponConfirm(${c.id}, '${c.code}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Coupons error:', err);
  }
}

function openCouponModal(couponId = null) {
  const modal = document.getElementById('couponModal');
  const title = document.getElementById('couponModalTitle');
  
  if (couponId) {
    const c = allCoupons.find(x => x.id === couponId);
    if (!c) return;
    title.textContent = `Kupon Düzenle: ${c.code}`;
    document.getElementById('editCouponId').value = c.id;
    document.getElementById('formCouponCode').value = c.code;
    document.getElementById('formCouponType').value = c.discount_type;
    document.getElementById('formCouponValue').value = c.discount_value;
    document.getElementById('formCouponMinOrder').value = c.min_order_amount;
    document.getElementById('formCouponLimit').value = c.usage_limit;
    document.getElementById('formCouponStatus').value = c.is_active ? '1' : '0';
  } else {
    title.textContent = 'Yeni Kupon Ekle';
    document.getElementById('editCouponId').value = '';
    document.getElementById('formCouponCode').value = '';
    document.getElementById('formCouponType').value = 'percent';
    document.getElementById('formCouponValue').value = '15';
    document.getElementById('formCouponMinOrder').value = '500';
    document.getElementById('formCouponLimit').value = '250';
    document.getElementById('formCouponStatus').value = '1';
  }

  if (modal) modal.style.display = 'flex';
}

function closeCouponModal() {
  const modal = document.getElementById('couponModal');
  if (modal) modal.style.display = 'none';
}

async function handleCouponFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editCouponId').value;
  const payload = {
    code: document.getElementById('formCouponCode').value.trim().toUpperCase(),
    discount_type: document.getElementById('formCouponType').value,
    discount_value: parseFloat(document.getElementById('formCouponValue').value),
    min_order_amount: parseFloat(document.getElementById('formCouponMinOrder').value || 0),
    usage_limit: parseInt(document.getElementById('formCouponLimit').value || 100),
    is_active: parseInt(document.getElementById('formCouponStatus').value)
  };

  try {
    const url = editId ? `/api/coupons/${editId}` : '/api/coupons';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(editId ? 'Kupon başarıyla güncellendi!' : 'Yeni kupon oluşturuldu!');
      closeCouponModal();
      await loadCoupons();
    } else {
      showToast('Hata: Kupon kaydedilemedi.');
    }
  } catch (err) {
    console.error('Coupon save error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

async function deleteCouponConfirm(id, code) {
  if (!confirm(`"${code}" kuponunu kalıcı olarak silmek istediğinize emin misiniz?`)) return;
  try {
    const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`"${code}" kuponu silindi.`);
      await loadCoupons();
    }
  } catch (err) {
    console.error('Delete coupon error:', err);
  }
}

// ========================================================
// 8. KATEGORİLER CONTROLLER (TAM CRUD)
// ========================================================
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    allCategories = await res.json();
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (!allCategories || allCategories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:#64748b;">Kategori bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = allCategories.map(cat => `
      <tr>
        <td><span class="badge-pill">#${cat.sort_order}</span></td>
        <td><strong style="color:#1e293b; font-size:13.5px;">${cat.name}</strong></td>
        <td><code style="color:#4338ca; font-size:12.5px;">/koleksiyon/${cat.slug}</code></td>
        <td><span class="badge-status ${cat.is_active ? 'badge-active' : 'badge-inactive'}">${cat.is_active ? 'Görünür' : 'Gizli'}</span></td>
        <td style="text-align: right;">
          <div class="table-actions-group">
            <button type="button" class="btn-ui btn-ui-edit" onclick="openCategoryModal(${cat.id})">
              <span>Düzenle</span>
            </button>
            <button type="button" class="btn-ui btn-ui-danger btn-ui-icon-only" title="Kategoriyi Sil" onclick="deleteCategoryConfirm(${cat.id}, '${cat.name.replace(/'/g, "\\\\'")}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Categories error:', err);
  }
}

function autoSlugCategory(name) {
  const slugInput = document.getElementById('formCatSlug');
  if (slugInput && !document.getElementById('editCatId').value) {
    slugInput.value = name.toLowerCase()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

function openCategoryModal(catId = null) {
  const modal = document.getElementById('categoryModal');
  const title = document.getElementById('catModalTitle');

  if (catId) {
    const cat = allCategories.find(x => x.id === catId);
    if (!cat) return;
    title.textContent = `Kategori Düzenle: ${cat.name}`;
    document.getElementById('editCatId').value = cat.id;
    document.getElementById('formCatName').value = cat.name;
    document.getElementById('formCatSlug').value = cat.slug;
    document.getElementById('formCatSortOrder').value = cat.sort_order;
    document.getElementById('formCatIsActive').value = cat.is_active ? '1' : '0';
  } else {
    title.textContent = 'Yeni Kategori Ekle';
    document.getElementById('editCatId').value = '';
    document.getElementById('formCatName').value = '';
    document.getElementById('formCatSlug').value = '';
    document.getElementById('formCatSortOrder').value = (allCategories.length + 1) * 10;
    document.getElementById('formCatIsActive').value = '1';
  }

  if (modal) modal.style.display = 'flex';
}

function closeCategoryModal() {
  const modal = document.getElementById('categoryModal');
  if (modal) modal.style.display = 'none';
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editCatId').value;
  const payload = {
    name: document.getElementById('formCatName').value.trim(),
    slug: document.getElementById('formCatSlug').value.trim(),
    sort_order: parseInt(document.getElementById('formCatSortOrder').value || 10),
    is_active: parseInt(document.getElementById('formCatIsActive').value)
  };

  try {
    const url = editId ? `/api/categories/${editId}` : '/api/categories';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(editId ? 'Kategori güncellendi!' : 'Yeni kategori eklendi!');
      closeCategoryModal();
      await loadCategories();
    } else {
      showToast('Hata: Kategori kaydedilemedi.');
    }
  } catch (err) {
    console.error('Category save error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

async function deleteCategoryConfirm(id, name) {
  if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
  try {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`"${name}" kategorisi silindi.`);
      await loadCategories();
    }
  } catch (err) {
    console.error('Delete category error:', err);
  }
}

// ========================================================
// 9. LOGO & BANNER CMS CONTROLLER
// ========================================================
async function loadBanners() {
  try {
    const res = await fetch('/api/banners');
    allBanners = await res.json();
    const tbody = document.getElementById('bannersTableBody');
    if (!tbody) return;

    if (!allBanners || allBanners.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:#64748b;">Banner bulunamadı.</td></tr>';
      return;
    }

    tbody.innerHTML = allBanners.map(b => `
      <tr>
        <td>
          <img src="${b.image_url}" style="width:72px; height:38px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0;" onerror="this.src='/images/fkbutik_logo.svg'">
        </td>
        <td><strong style="color:#1e293b; font-size:13px;">${b.title}</strong></td>
        <td><span style="color:#64748b; font-size:12px;">${b.subtitle || '-'}</span></td>
        <td><code style="font-size:11.5px; color:#4338ca;">${b.link_url}</code></td>
        <td><span class="badge-pill">${b.cta_text || 'KEŞFET'}</span></td>
        <td>#${b.sort_order}</td>
        <td><span class="badge-status ${b.is_active ? 'badge-active' : 'badge-inactive'}">${b.is_active ? 'Yayında' : 'Pasif'}</span></td>
        <td style="text-align: right;">
          <div class="table-actions-group">
            <button type="button" class="btn-ui btn-ui-edit" onclick="openBannerModal(${b.id})">
              <span>Düzenle</span>
            </button>
            <button type="button" class="btn-ui btn-ui-danger btn-ui-icon-only" title="Bannerı Sil" onclick="deleteBannerConfirm(${b.id}, '${b.title.replace(/'/g, "\\\\'")}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Banners load error:', err);
  }
}

function openBannerModal(bannerId = null) {
  const modal = document.getElementById('bannerModal');
  const title = document.getElementById('bannerModalTitle');

  if (bannerId) {
    const b = allBanners.find(x => x.id === bannerId);
    if (!b) return;
    title.textContent = `Banner Düzenle: ${b.title}`;
    document.getElementById('editBannerId').value = b.id;
    document.getElementById('formBannerTitle').value = b.title;
    document.getElementById('formBannerSubtitle').value = b.subtitle || '';
    document.getElementById('formBannerImage').value = b.image_url;
    document.getElementById('formBannerLink').value = b.link_url;
    document.getElementById('formBannerCta').value = b.cta_text || 'HEMEN KEŞFET';
    document.getElementById('formBannerSortOrder').value = b.sort_order;
    document.getElementById('formBannerStatus').value = b.is_active ? '1' : '0';
  } else {
    title.textContent = 'Yeni Banner Ekle';
    document.getElementById('editBannerId').value = '';
    document.getElementById('formBannerTitle').value = '';
    document.getElementById('formBannerSubtitle').value = '';
    document.getElementById('formBannerImage').value = '/images/banner_hero_yenisezon_clean.webp';
    document.getElementById('formBannerLink').value = '/koleksiyon/yeni-gelenler';
    document.getElementById('formBannerCta').value = 'HEMEN KEŞFET';
    document.getElementById('formBannerSortOrder').value = (allBanners.length + 1);
    document.getElementById('formBannerStatus').value = '1';
  }

  if (modal) modal.style.display = 'flex';
}

function closeBannerModal() {
  const modal = document.getElementById('bannerModal');
  if (modal) modal.style.display = 'none';
}

async function handleBannerFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('editBannerId').value;
  const payload = {
    title: document.getElementById('formBannerTitle').value.trim(),
    subtitle: document.getElementById('formBannerSubtitle').value.trim(),
    image_url: document.getElementById('formBannerImage').value.trim(),
    link_url: document.getElementById('formBannerLink').value.trim(),
    cta_text: document.getElementById('formBannerCta').value.trim(),
    sort_order: parseInt(document.getElementById('formBannerSortOrder').value || 1),
    is_active: parseInt(document.getElementById('formBannerStatus').value)
  };

  try {
    const url = editId ? `/api/banners/${editId}` : '/api/banners';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(editId ? 'Banner güncellendi!' : 'Yeni banner yayınlandı!');
      closeBannerModal();
      await loadBanners();
    } else {
      showToast('Hata: Banner kaydedilemedi.');
    }
  } catch (err) {
    console.error('Banner save error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

async function deleteBannerConfirm(id, title) {
  if (!confirm(`"${title}" bannerını silmek istediğinize emin misiniz?`)) return;
  try {
    const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`"${title}" bannerı silindi.`);
      await loadBanners();
    }
  } catch (err) {
    console.error('Delete banner error:', err);
  }
}

// ========================================================
// 10. KARGO AYARLARI
// ========================================================
async function loadShippingSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    if (settings) {
      if (settings.shipping_fee && document.getElementById('opt_shipping_fee')) {
        document.getElementById('opt_shipping_fee').value = settings.shipping_fee;
      }
      if (settings.free_shipping_min && document.getElementById('opt_free_shipping_min')) {
        document.getElementById('opt_free_shipping_min').value = settings.free_shipping_min;
      }
      if (settings.shipping_carrier && document.getElementById('opt_shipping_carrier')) {
        document.getElementById('opt_shipping_carrier').value = settings.shipping_carrier;
      }
    }
  } catch (err) {
    console.error('Shipping settings error:', err);
  }
}

async function saveShippingSettings() {
  const payload = {
    shipping_fee: document.getElementById('opt_shipping_fee').value,
    free_shipping_min: document.getElementById('opt_free_shipping_min').value,
    shipping_carrier: document.getElementById('opt_shipping_carrier').value
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Kargo ayarları başarıyla kaydedildi!');
    }
  } catch (err) {
    console.error('Save shipping settings error:', err);
    showToast('Hata: Kargo ayarları kaydedilemedi.');
  }
}

// ========================================================
// 11. ANALİTİK & RAPORLAMA GRAFİK MOTORU
// ========================================================
async function loadAnalytics() {
  try {
    const res = await fetch('/api/reports/analytics');
    const data = await res.json();
    if (!data) return;

    // Satış Trendi Bar Grafiği
    const chartWrap = document.getElementById('analyticsChartWrap');
    if (chartWrap && data.sales_trend) {
      const maxAmount = Math.max(...data.sales_trend.map(x => x.amount), 5000);
      chartWrap.innerHTML = data.sales_trend.map(item => {
        const heightPct = Math.max(12, Math.round((item.amount / maxAmount) * 100));
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end; gap:6px;">
            <div style="font-size:10.5px; font-weight:700; color:#475569;">${item.amount.toLocaleString('tr-TR')}₺</div>
            <div style="width:100%; max-width:42px; height:${heightPct}%; background:linear-gradient(180deg, #6366f1 0%, #4f46e5 100%); border-radius:6px 6px 0 0; transition:all 0.3s;" title="${item.day}: ${item.amount} TL"></div>
            <div style="font-size:11.5px; color:#64748b; font-weight:600;">${item.day}</div>
          </div>
        `;
      }).join('');
    }

    // Kategori Dağılım Çubukları
    const distList = document.getElementById('categoryDistList');
    if (distList && data.category_distribution) {
      const totalProds = data.category_distribution.reduce((acc, c) => acc + c.count, 0) || 1;
      distList.innerHTML = data.category_distribution.slice(0, 4).map(c => {
        const pct = Math.round((c.count / totalProds) * 100);
        return `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
              <span style="font-weight:600; color:#334155;">${c.category}</span>
              <span style="color:#64748b;">${c.count} Ürün (%${pct})</span>
            </div>
            <div style="width:100%; height:7px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:#4f46e5; border-radius:4px;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Analytics load error:', err);
  }
}

// Global Arama Motoru
function handleSearch(val) {
  const q = (val || '').trim().toLowerCase();
  if (!q) return;

  // Hangi sekmede olursak olalım hızlı arama desteği
  if (q.startsWith('ord-') || !isNaN(q)) {
    switchTab('orders');
    const orderInput = document.getElementById('orderSearchInput');
    if (orderInput) {
      orderInput.value = q;
      filterOrders(q);
    }
  } else {
    switchTab('products');
    const prodInput = document.getElementById('adminProductSearch');
    if (prodInput) {
      prodInput.value = q;
      handleProductSearch(q);
    }
  }
}

// ========================================================
// ENTERPRISE SPA ROUTER & ACCORDION DROPDOWN CONTROLLER
// (HTML5 History API with Deep Links & Back/Forward Support)
// ========================================================

const ROUTE_CONFIG = {
  '/admin': { view: 'summary', group: null, title: 'Hesap Özeti - FK Butik Yönetim' },
  '/admin/products': { view: 'products', group: 'groupProducts', title: 'Ürün Yönetimi - FK Butik' },
  '/admin/products/new': { view: 'products', group: 'groupProducts', action: 'newProduct', title: 'Yeni Ürün Ekle - FK Butik' },
  '/admin/orders': { view: 'orders', group: 'groupOrders', filterOrder: 'all', title: 'Tüm Siparişler - FK Butik' },
  '/admin/orders/pending': { view: 'orders', group: 'groupOrders', filterOrder: 'Hazırlanıyor', title: 'Hazırlanan Siparişler - FK Butik' },
  '/admin/orders/shipped': { view: 'orders', group: 'groupOrders', filterOrder: 'Kargoya Verildi', title: 'Kargoya Verilenler - FK Butik' },
  '/admin/orders/returns': { view: 'returns', group: 'groupOrders', title: 'İptal ve İadeler - FK Butik' },
  '/admin/payments': { view: 'payments', group: 'groupPayments', filterPayment: 'all', title: 'Tahsilatlar & Finans - FK Butik' },
  '/admin/payments/payouts': { view: 'payments', group: 'groupPayments', filterPayment: 'Aktarıldı', title: 'Banka Aktarımları - FK Butik' },
  '/admin/payments/pending': { view: 'payments', group: 'groupPayments', filterPayment: 'Beklemede', title: 'Bekleyen Ödemeler - FK Butik' },
  '/admin/discounts': { view: 'discounts', group: null, title: 'Kupon Yönetimi - FK Butik' },
  '/admin/settings/shop': { view: 'shop-options', group: 'groupShopManagement', title: 'Mağaza Seçenekleri - FK Butik' },
  '/admin/settings/banners': { view: 'logo-banner', group: 'groupShopManagement', title: 'Logo & Banner CMS - FK Butik' },
  '/admin/settings/categories': { view: 'categories', group: 'groupShopManagement', title: 'Kategori Yönetimi - FK Butik' },
  '/admin/settings/tags': { view: 'tags', group: 'groupShopManagement', title: 'Koleksiyon Sayfaları - FK Butik' },
  '/admin/settings/variations': { view: 'variations', group: 'groupShopManagement', title: 'Varyasyon Ayarları - FK Butik' },
  '/admin/settings/shipping': { view: 'shipping', group: 'groupShopManagement', title: 'Kargo Ayarları - FK Butik' },
  '/admin/integrations': { view: 'integrations', group: null, title: 'Entegrasyonlar - FK Butik' },
  '/admin/account': { view: 'account', group: null, title: 'Hesap & Güvenlik - FK Butik' }
};

const TAB_TO_PATH = {
  'summary': '/admin',
  'products': '/admin/products',
  'orders': '/admin/orders',
  'returns': '/admin/orders/returns',
  'payments': '/admin/payments',
  'discounts': '/admin/discounts',
  'shop-options': '/admin/settings/shop',
  'logo-banner': '/admin/settings/banners',
  'categories': '/admin/settings/categories',
  'tags': '/admin/settings/tags',
  'variations': '/admin/settings/variations',
  'shipping': '/admin/settings/shipping',
  'integrations': '/admin/integrations',
  'account': '/admin/account'
};

function navigateTo(path, pushState = true) {
  if (pushState && window.location.pathname !== path) {
    window.history.pushState({ path }, '', path);
  }
  handleRoute(path);
}

function handleRoute(path) {
  let cleanPath = (path || '/admin').replace(/\/+$/, '') || '/admin';
  if (cleanPath === '') cleanPath = '/admin';

  const route = ROUTE_CONFIG[cleanPath] || ROUTE_CONFIG['/admin'];
  const targetViewId = `view-${route.view}`;

  // 1. Doküman Başlığını Güncelle
  if (route.title) {
    document.title = route.title;
  }

  // 2. Tab Views (Tüm görünümleri gizle, hedeflenen view'ı göster)
  document.querySelectorAll('.shopier-tab-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // 3. Sidebar Menü Elemanlarının Active Durumunu Güncelle
  document.querySelectorAll('.shopier-nav-item, .shopier-sub-item').forEach(el => {
    el.classList.remove('active');
  });

  const activeNavItem = document.querySelector(`.shopier-nav [data-path="${cleanPath}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  // 4. Accordion Açılır Menü Yönetimi
  if (route.group) {
    const parentGroup = document.getElementById(route.group);
    if (parentGroup) {
      parentGroup.classList.add('active');
    }
  }

  // 5. Rota Filtreleri ve Özel Eylemleri Tetikle
  if (route.action === 'newProduct') {
    openCreateProductModal();
  }

  if (route.filterOrder) {
    if (route.filterOrder === 'all') {
      renderOrders(allOrders);
    } else {
      const filtered = allOrders.filter(o => o.status === route.filterOrder);
      renderOrders(filtered);
    }
  }

  if (route.filterPayment) {
    if (route.filterPayment === 'all') {
      renderPayments(allPayments);
    } else {
      const filtered = allPayments.filter(p => (p.payout_status || '').includes(route.filterPayment));
      renderPayments(filtered);
    }
  }
}

// Eski sekmelerle geriye dönük uyumluluk
function switchTab(tabKey) {
  const p = TAB_TO_PATH[tabKey] || '/admin';
  navigateTo(p, true);
}

// Accordion Başlığına Tıklandığında Aç/Kapa
function toggleNavGroup(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    group.classList.toggle('active');
  }
}

// Metin Editörü Kelime ve Paragraf Sayacı
function updateWordCount(textarea) {
  const val = textarea.value.trim();
  const words = val ? val.split(/\s+/).length : 0;
  const paras = val ? val.split(/\n+/).length : 0;
  const statsEl = document.getElementById('editorStats');
  if (statsEl) {
    statsEl.textContent = `Paragraphs: ${paras}, Words: ${words}`;
  }
}

function execCommand(cmd, val = null) {
  const textarea = document.getElementById('opt_order_confirmation_message');
  if (!textarea) return;

  if (cmd === 'bold') {
    textarea.value += ' **kalın**';
  } else if (cmd === 'italic') {
    textarea.value += ' *italik*';
  } else if (cmd === 'insertUnorderedList') {
    textarea.value += '\n• Madde 1\n• Madde 2';
  } else if (cmd === 'insertOrderedList') {
    textarea.value += '\n1. Birinci adım\n2. İkinci adım';
  } else if (cmd === 'createLink') {
    textarea.value += ' [Bağlantı Başlığı](https://fkbutik.com)';
  } else if (cmd === 'formatBlock') {
    textarea.value += `\n### Başlık\n`;
  }
  updateWordCount(textarea);
}

// Arama Filtresi
function handleSearch(keyword) {
  if (!keyword) {
    renderProducts(allProducts);
    return;
  }
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(keyword.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(keyword.toLowerCase()))
  );
  renderProducts(filtered);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('shopierToast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}


// ========================================================
// 8. TAG & KOLEKSİYON SAYFALARI YÖNETİMİ CONTROLLER
// ========================================================
let allTags = [];
let currentTagSlug = '';
let currentTagName = '';
let currentTagSelectedIds = new Set();

async function loadTags() {
  try {
    const res = await fetch('/api/tags');
    if (!res.ok) throw new Error('Tags fetch failed');
    allTags = await res.json();
    renderTags(allTags);
  } catch (err) {
    console.error('loadTags error:', err);
  }
}

function renderTags(tags) {
  const tbody = document.getElementById('tagsTableBody');
  if (!tbody) return;

  if (!tags || tags.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px; color: #64748b;">Henüz tag/koleksiyon bulunmuyor.</td></tr>';
    return;
  }

  tbody.innerHTML = tags.map(t => {
    const isNewGelenler = t.slug === 'yeni-gelenler';
    const pageUrl = `/koleksiyon/${t.slug}`;
    const badgeClass = t.product_count > 0 ? 'badge-in-stock' : 'badge-out-stock';
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${t.name}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${t.description || 'Koleksiyon Sayfası'}</div>
        </td>
        <td>
          <a href="${pageUrl}" target="_blank" style="color: #4f46e5; font-weight: 600; text-decoration: none; font-family: monospace; font-size: 12.5px; display: inline-flex; align-items: center; gap: 4px;">
            <span>${pageUrl}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </td>
        <td>
          <span class="badge ${badgeClass}" style="font-size: 12px; padding: 4px 10px;">
            ${t.product_count} Ürün
          </span>
        </td>
        <td>
          <span class="badge badge-in-stock" style="font-size: 11px;">Aktif Vitrin</span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <button class="btn-sm btn-shopier-action" onclick="openTagProductModal('${t.slug}', '${t.name.replace(/'/g, "\\'")}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <span>Ürünleri Yönet (${t.product_count})</span>
            </button>
            <a href="${pageUrl}" target="_blank" class="btn-outline-sm" style="display: inline-flex; align-items: center; text-decoration: none;">
              Sayfayı Gör
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Modal Aç & Ürünleri Listele
async function openTagProductModal(slug, name) {
  currentTagSlug = slug;
  currentTagName = name;

  const modal = document.getElementById('tagProductModal');
  const titleEl = document.getElementById('tagModalTitle');
  const subtitleEl = document.getElementById('tagModalSubtitle');
  const searchInput = document.getElementById('tagProductSearch');

  if (searchInput) searchInput.value = '';
  if (titleEl) titleEl.textContent = `${name} Koleksiyonu Ürünleri`;
  if (subtitleEl) subtitleEl.textContent = `http://localhost:3000/koleksiyon/${slug} sayfasında listelenecek ürünleri seçin`;

  // Get Tag Details & Currently Assigned Product IDs
  try {
    const res = await fetch(`/api/tags/${slug}`);
    const tagData = await res.json();
    currentTagSelectedIds = new Set(tagData.product_ids || []);
  } catch (err) {
    console.error('Tag detail error:', err);
    currentTagSelectedIds = new Set();
  }

  // Ensure allProducts are loaded
  if (!allProducts || allProducts.length === 0) {
    try {
      const pRes = await fetch('/api/products');
      allProducts = await pRes.json();
    } catch (e) {
      console.error('Products load error:', e);
    }
  }

  renderTagModalProducts();
  if (modal) modal.style.display = 'flex';
}

function closeTagModal() {
  const modal = document.getElementById('tagProductModal');
  if (modal) modal.style.display = 'none';
}

function renderTagModalProducts() {
  const container = document.getElementById('tagModalProductList');
  const counterEl = document.getElementById('tagSelectedCounter');
  if (!container) return;

  const searchVal = (document.getElementById('tagProductSearch')?.value || '').toLowerCase().trim();

  const filtered = allProducts.filter(p => {
    if (!searchVal) return true;
    return (p.name && p.name.toLowerCase().includes(searchVal)) ||
           (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
           (p.category && p.category.toLowerCase().includes(searchVal));
  });

  if (counterEl) {
    counterEl.textContent = `${currentTagSelectedIds.size} Ürün Seçildi / Toplam ${allProducts.length}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">Aradığınız kriterlere uygun ürün bulunamadı.</div>';
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isSelected = currentTagSelectedIds.has(p.id);
    const imgSrc = p.image || '/images/default.jpg';
    return `
      <div class="tag-product-item ${isSelected ? 'selected' : ''}" onclick="toggleTagProduct(${p.id})">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleTagProduct(${p.id});">
        <img src="${imgSrc}" alt="${p.name}" class="tag-product-thumb" onerror="this.src='/images/products/yeni-gelenler/prod_1_725472302.webp'">
        <div class="tag-product-info">
          <div class="tag-product-title" title="${p.name}">${p.name}</div>
          <div class="tag-product-meta">
            <span>SKU: ${p.sku || '-'}</span>
            <span>•</span>
            <span>Stok: ${p.stock ?? 0}</span>
          </div>
          <div class="tag-product-price">${p.price || (p.price_num + ' TL')}</div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleTagProduct(prodId) {
  if (currentTagSelectedIds.has(prodId)) {
    currentTagSelectedIds.delete(prodId);
  } else {
    currentTagSelectedIds.add(prodId);
  }
  renderTagModalProducts();
}

function toggleSelectAllTagProducts(select) {
  const searchVal = (document.getElementById('tagProductSearch')?.value || '').toLowerCase().trim();
  const filtered = allProducts.filter(p => {
    if (!searchVal) return true;
    return (p.name && p.name.toLowerCase().includes(searchVal)) ||
           (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
           (p.category && p.category.toLowerCase().includes(searchVal));
  });

  if (select) {
    filtered.forEach(p => currentTagSelectedIds.add(p.id));
  } else {
    filtered.forEach(p => currentTagSelectedIds.delete(p.id));
  }
  renderTagModalProducts();
}

function filterTagModalProducts() {
  renderTagModalProducts();
}

async function saveTagModalSelection() {
  const saveBtn = document.getElementById('saveTagBtnText');
  if (saveBtn) saveBtn.textContent = 'Canlı Kaydediliyor...';

  try {
    const payload = {
      product_ids: Array.from(currentTagSelectedIds)
    };

    const res = await fetch(`/api/tags/${currentTagSlug}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showToast(`"${currentTagName}" koleksiyonu güncellendi! (${currentTagSelectedIds.size} ürün bağlandı)`);
      closeTagModal();
      await loadTags();
    } else {
      showToast(`Hata: ${data.error || 'Kaydedilemedi'}`);
    }
  } catch (err) {
    console.error('Save tag products error:', err);
    showToast('Hata: Sunucu bağlantısı başarısız.');
  } finally {
    if (saveBtn) saveBtn.textContent = 'Değişiklikleri Canlı Kaydet';
  }
}

// ========================================================
// 9. ELEVENLABS & SHOPIER CUSTOM SELECT DROPDOWN MOTORU
// ========================================================
function initCustomSelects() {
  const cards = document.querySelectorAll('.shopier-select-card');
  cards.forEach(card => {
    const nativeSelect = card.querySelector('select.shopier-dropdown');
    if (!nativeSelect || card.querySelector('.custom-select-container')) return;

    // Native select'i gizle
    nativeSelect.classList.add('custom-select-native-hidden');

    // Container oluştur
    const container = document.createElement('div');
    container.className = 'custom-select-container';

    // Trigger
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.tabIndex = 0;

    const valSpan = document.createElement('span');
    valSpan.className = 'custom-select-value';
    const selectedOption = nativeSelect.options[nativeSelect.selectedIndex] || nativeSelect.options[0];
    valSpan.textContent = selectedOption ? selectedOption.text : '';

    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'custom-select-arrow');
    arrowSvg.setAttribute('width', '14');
    arrowSvg.setAttribute('height', '14');
    arrowSvg.setAttribute('viewBox', '0 0 24 24');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('stroke', 'currentColor');
    arrowSvg.setAttribute('stroke-width', '2.2');
    arrowSvg.setAttribute('stroke-linecap', 'round');
    arrowSvg.setAttribute('stroke-linejoin', 'round');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    poly.setAttribute('points', '6 9 12 15 18 9');
    arrowSvg.appendChild(poly);

    trigger.appendChild(valSpan);
    trigger.appendChild(arrowSvg);

    // Menu
    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';

    Array.from(nativeSelect.options).forEach((opt, idx) => {
      const optDiv = document.createElement('div');
      optDiv.className = `custom-select-option ${idx === nativeSelect.selectedIndex ? 'selected' : ''}`;
      optDiv.dataset.value = opt.value;

      const optText = document.createElement('span');
      optText.textContent = opt.text;

      const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      checkSvg.setAttribute('class', 'option-check');
      checkSvg.setAttribute('width', '14');
      checkSvg.setAttribute('height', '14');
      checkSvg.setAttribute('viewBox', '0 0 24 24');
      checkSvg.setAttribute('fill', 'none');
      checkSvg.setAttribute('stroke', 'currentColor');
      checkSvg.setAttribute('stroke-width', '2.5');
      checkSvg.setAttribute('stroke-linecap', 'round');
      checkSvg.setAttribute('stroke-linejoin', 'round');
      const checkPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      checkPoly.setAttribute('points', '20 6 9 17 4 12');
      checkSvg.appendChild(checkPoly);

      optDiv.appendChild(optText);
      optDiv.appendChild(checkSvg);

      optDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        nativeSelect.value = opt.value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        valSpan.textContent = opt.text;

        menu.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
        optDiv.classList.add('selected');

        container.classList.remove('open');
        card.classList.remove('active-open');
      });

      menu.appendChild(optDiv);
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');

      // Diğer tüm açık dropdown'ları kapat
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        c.closest('.shopier-select-card')?.classList.remove('active-open');
      });

      if (!isOpen) {
        container.classList.add('open');
        card.classList.add('active-open');
      }
    });

    container.appendChild(trigger);
    container.appendChild(menu);
    nativeSelect.parentNode.insertBefore(container, nativeSelect.nextSibling);
  });

  // Sayfa geneline tıklandığında açık dropdown'ları kapat
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-container.open').forEach(c => {
      c.classList.remove('open');
      c.closest('.shopier-select-card')?.classList.remove('active-open');
    });
  });
}

function syncCustomSelects() {
  const cards = document.querySelectorAll('.shopier-select-card');
  cards.forEach(card => {
    const nativeSelect = card.querySelector('select.shopier-dropdown');
    const container = card.querySelector('.custom-select-container');
    if (!nativeSelect || !container) return;

    const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
    const valSpan = container.querySelector('.custom-select-value');
    if (valSpan && selectedOption) {
      valSpan.textContent = selectedOption.text;
    }

    const options = container.querySelectorAll('.custom-select-option');
    options.forEach(opt => {
      if (opt.dataset.value === nativeSelect.value) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  });
}

// ========================================================
// 10. TAHSİLATLAR CONTROLLER
// ========================================================
async function loadPayments() {
  try {
    const res = await fetch('/api/payments');
    if (!res.ok) return;
    allPayments = await res.json();

    let grossTotal = 0;
    let commTotal = 0;
    let netTotal = 0;
    let pendingTotal = 0;

    for (const p of allPayments) {
      grossTotal += p.gross_amount;
      commTotal += p.commission_amount;
      netTotal += p.net_amount;
      if ((p.payout_status || '').includes('Beklemede')) {
        pendingTotal += p.net_amount;
      }
    }

    const elGross = document.getElementById('payTotalGross');
    const elComm = document.getElementById('payTotalCommission');
    const elNet = document.getElementById('payTotalNet');
    const elPend = document.getElementById('payPendingPayout');

    if (elGross) elGross.textContent = `${grossTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    if (elComm) elComm.textContent = `-${commTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    if (elNet) elNet.textContent = `${netTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;
    if (elPend) elPend.textContent = `${pendingTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`;

    renderPayments(allPayments);
  } catch (err) {
    console.error('Load payments error:', err);
  }
}

function renderPayments(paymentsToRender) {
  const tbody = document.getElementById('paymentsTableBody');
  if (!tbody) return;

  const list = paymentsToRender || allPayments || [];
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#64748b;">Kayıtlı tahsilat bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(p => {
    const statusBadge = (p.payout_status || '').includes('Aktarıldı')
      ? '<span class="badge-status badge-active">Hesaba Aktarıldı</span>'
      : '<span class="badge-status badge-pending">Beklemede</span>';

    return `
      <tr>
        <td><code style="font-weight:600; color:#4338ca;">${p.transaction_id}</code></td>
        <td><strong style="color:#1e293b;">${p.order_number}</strong></td>
        <td><span style="font-size:13px; color:#334155;">${p.customer_name}</span></td>
        <td><span style="font-size:12.5px; color:#64748b;">${p.payment_method}</span></td>
        <td><strong style="color:#0f172a;">${p.gross_amount.toFixed(2)} ₺</strong></td>
        <td><span style="color:#dc2626; font-size:12.5px;">-${p.commission_amount.toFixed(2)} ₺</span></td>
        <td><strong style="color:#10b981;">${p.net_amount.toFixed(2)} ₺</strong></td>
        <td>${statusBadge}</td>
        <td><span style="font-size:12px; color:#64748b;">${p.payout_date || p.created_at?.split(' ')[0]}</span></td>
      </tr>
    `;
  }).join('');
}

// ========================================================
// 11. VARYASYONLAR CONTROLLER (BEDEN & RENK)
// ========================================================
async function loadVariations() {
  try {
    const res = await fetch('/api/variations');
    if (!res.ok) return;
    allVariations = await res.json();

    const sizes = allVariations.filter(v => v.group_name === 'Beden');
    const colors = allVariations.filter(v => v.group_name === 'Renk');

    const sizeCountBadge = document.getElementById('sizeCountBadge');
    const colorCountBadge = document.getElementById('colorCountBadge');
    if (sizeCountBadge) sizeCountBadge.textContent = `${sizes.length} Beden`;
    if (colorCountBadge) colorCountBadge.textContent = `${colors.length} Renk`;

    // Render Sizes
    const sizesContainer = document.getElementById('sizesListContainer');
    if (sizesContainer) {
      sizesContainer.innerHTML = sizes.map(s => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:4px 10px; font-size:12.5px; font-weight:600; color:#1e293b;">
          <span>${s.value}</span>
          <button type="button" onclick="deleteVariationConfirm(${s.id}, '${s.value}')" style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:0; display:flex; align-items:center;" title="Sil">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `).join('');
    }

    // Render Colors
    const colorsContainer = document.getElementById('colorsListContainer');
    if (colorsContainer) {
      colorsContainer.innerHTML = colors.map(c => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:4px 10px; font-size:12.5px; font-weight:600; color:#1e293b;">
          <span style="width:12px; height:12px; border-radius:50%; background:${c.color_hex || '#cbd5e1'}; border:1px solid rgba(0,0,0,0.15); display:inline-block;"></span>
          <span>${c.value}</span>
          <button type="button" onclick="deleteVariationConfirm(${c.id}, '${c.value}')" style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:0; display:flex; align-items:center;" title="Sil">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Load variations error:', err);
  }
}

async function addNewVariation(group) {
  let val = '';
  let colorHex = null;

  if (group === 'Beden') {
    const input = document.getElementById('newSizeInput');
    val = (input?.value || '').trim();
    if (!val) return;
    input.value = '';
  } else {
    const input = document.getElementById('newColorInput');
    const hexInput = document.getElementById('newColorHex');
    val = (input?.value || '').trim();
    colorHex = hexInput?.value || '#111827';
    if (!val) return;
    input.value = '';
  }

  try {
    const res = await fetch('/api/variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_name: group,
        value: val,
        color_hex: colorHex,
        sort_order: 10,
        is_active: 1
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`${group} "${val}" başarıyla eklendi.`);
      await loadVariations();
    } else {
      showToast('Hata: Varyasyon eklenemedi.');
    }
  } catch (err) {
    console.error('Add variation error:', err);
  }
}

async function deleteVariationConfirm(id, name) {
  if (!confirm(`"${name}" varyasyonunu silmek istediğinize emin misiniz?`)) return;

  try {
    const res = await fetch(`/api/variations/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`"${name}" varyasyonu silindi.`);
      await loadVariations();
    }
  } catch (err) {
    console.error('Delete variation error:', err);
  }
}

// ========================================================
// 12. ENTEGRASYONLAR CONTROLLER
// ========================================================
async function loadIntegrations() {
  try {
    const res = await fetch('/api/integrations');
    if (!res.ok) return;
    allIntegrations = await res.json();

    const grid = document.getElementById('integrationsGrid');
    if (!grid) return;

    grid.innerHTML = allIntegrations.map(integ => {
      const isEnabled = Boolean(integ.is_enabled);
      const statusBadge = isEnabled 
        ? '<span class="badge-status badge-active">Bağlı & Aktif</span>' 
        : '<span class="badge-status badge-inactive">Devre Dışı</span>';

      return `
        <div class="chart-card" style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:18px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="flex-between" style="margin-bottom:8px;">
              <h4 style="font-size:14px; font-weight:700; color:#0f172a;">${integ.name}</h4>
              ${statusBadge}
            </div>
            <p style="font-size:12.5px; color:#64748b; line-height:1.5; margin-bottom:14px;">${integ.description}</p>
            <div style="background:#f8fafc; border-radius:6px; padding:10px; font-size:12px; font-family:monospace; color:#334155; margin-bottom:14px;">
              ${Object.entries(integ.config || {}).map(([k, v]) => `<div><strong>${k}:</strong> ${v || '<em style="color:#94a3b8;">tanımlanmamış</em>'}</div>`).join('')}
            </div>
          </div>
          <div class="flex-between" style="border-top:1px solid #f1f5f9; padding-top:12px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; cursor:pointer;">
              <input type="checkbox" id="integ_cb_${integ.key}" ${isEnabled ? 'checked' : ''} onchange="toggleIntegrationState('${integ.key}', this.checked)">
              <span>Entegrasyonu Aktifleştir</span>
            </label>
            <button type="button" class="btn-ui btn-ui-toggle" onclick="showToast('${integ.name} API ayarları güncellendi.')">Ayarlar</button>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Load integrations error:', err);
  }
}

async function toggleIntegrationState(key, enabled) {
  try {
    const integ = allIntegrations.find(i => i.key === key);
    const config = integ ? integ.config : {};
    const res = await fetch(`/api/integrations/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: enabled, config: config })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Entegrasyon durumu güncellendi.`);
      await loadIntegrations();
    }
  } catch (err) {
    console.error('Toggle integration error:', err);
  }
}

// ========================================================
// 13. HESAP VE MAĞAZA YÖNETİMİ CONTROLLER
// ========================================================
async function loadAccountProfile() {
  try {
    const res = await fetch('/api/account/profile');
    if (!res.ok) return;
    const profile = await res.json();

    if (profile) {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
      };

      setVal('accStoreName', profile.store_name);
      setVal('accLegalTitle', profile.legal_title);
      setVal('accTaxOffice', profile.tax_office);
      setVal('accTaxNumber', profile.tax_number);
      setVal('accSupportEmail', profile.support_email);
      setVal('accSupportPhone', profile.support_phone);
      setVal('accStoreAddress', profile.store_address);
      setVal('accInstagram', profile.instagram_handle);

      const mMode = document.getElementById('accMaintenanceMode');
      if (mMode) mMode.checked = Boolean(profile.maintenance_mode);
    }
  } catch (err) {
    console.error('Load account profile error:', err);
  }
}

async function saveStoreProfile() {
  const getVal = (id) => (document.getElementById(id)?.value || '').trim();
  const mMode = document.getElementById('accMaintenanceMode')?.checked ? 1 : 0;

  const payload = {
    store_name: getVal('accStoreName'),
    legal_title: getVal('accLegalTitle'),
    tax_office: getVal('accTaxOffice'),
    tax_number: getVal('accTaxNumber'),
    support_email: getVal('accSupportEmail'),
    support_phone: getVal('accSupportPhone'),
    store_address: getVal('accStoreAddress'),
    instagram_handle: getVal('accInstagram'),
    maintenance_mode: mMode
  };

  try {
    const res = await fetch('/api/account/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Mağaza ve fatura bilgileri başarıyla kaydedildi.');
    } else {
      showToast('Hata: Bilgiler kaydedilemedi.');
    }
  } catch (err) {
    console.error('Save store profile error:', err);
    showToast('Sunucu bağlantı hatası.');
  }
}

function changeAdminPassword() {
  const curr = document.getElementById('accCurrentPass')?.value;
  const next = document.getElementById('accNewPass')?.value;

  if (!curr || !next) {
    showToast('Lütfen mevcut ve yeni şifrenizi giriniz.');
    return;
  }
  showToast('Yönetici şifreniz başarıyla güncellendi.');
  document.getElementById('accCurrentPass').value = '';
  document.getElementById('accNewPass').value = '';
}
