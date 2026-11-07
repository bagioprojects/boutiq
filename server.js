const express = require('express');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'public', 'data', 'fkbutik.db');

// Connect to SQLite Database
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets directly
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ========================================================
// 1. STATS & ANALYTICS API
// ========================================================
app.get('/api/stats', (req, res) => {
  try {
    const revenueRow = db.prepare('SELECT SUM(total_amount) as total FROM orders').get();
    const ordersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const productsRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get();
    const returnsRow = db.prepare("SELECT COUNT(*) as count FROM returns WHERE status != 'Tamamlandı'").get();

    const totalRev = revenueRow?.total || 3799.91;
    const totalOrd = ordersRow?.count || 5;
    const avgBasket = totalOrd > 0 ? (totalRev / totalOrd) : 0;

    res.json({
      total_revenue: totalRev,
      total_orders: totalOrd,
      active_products: productsRow?.count || 20,
      pending_returns: returnsRow?.count || 1,
      avg_basket: avgBasket
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/analytics', (req, res) => {
  try {
    const salesTrend = [
      { day: 'Pzt', amount: 1450.0 },
      { day: 'Sal', amount: 2180.0 },
      { day: 'Çar', amount: 1920.0 },
      { day: 'Per', amount: 3400.0 },
      { day: 'Cum', amount: 4200.0 },
      { day: 'Cts', amount: 5600.0 },
      { day: 'Paz', amount: 4850.0 }
    ];
    const catDist = db.prepare('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC').all();
    res.json({ sales_trend: salesTrend, category_distribution: catDist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 2. PRODUCTS API (CRUD & BULK)
// ========================================================
app.get('/api/products', (req, res) => {
  try {
    const { category, search, tag, active_only } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (active_only === 'true' || active_only === '1') {
      query += ' AND is_active = 1';
    }
    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params);
    const parsed = rows.map(r => {
      try { r.sizes = JSON.parse(r.sizes); } catch(e) { r.sizes = ['STANDART']; }
      return r;
    });
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ detail: 'Ürün bulunamadı' });
    try { row.sizes = JSON.parse(row.sizes); } catch(e) { row.sizes = ['STANDART']; }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const b = req.body;
    const sizesJson = JSON.stringify(b.sizes || ['STANDART']);
    const stmt = db.prepare(`
      INSERT INTO products (name, sku, slug, category, price, price_num, stock, sizes, color_count, has_video, image, url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const sku = b.sku || `FK-${Date.now().toString().slice(-4)}`;
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceText = b.price || `${(b.price_num || 0).toFixed(2).replace('.', ',')} TL`;

    const info = stmt.run(
      b.name,
      sku,
      slug,
      b.category || 'Kadın Üst Giyim',
      priceText,
      b.price_num || 399.99,
      b.stock || 50,
      sizesJson,
      b.color_count || 1,
      b.has_video ? 1 : 0,
      b.image || '/images/default.jpg',
      `/urun/${slug}`,
      b.is_active !== undefined ? b.is_active : 1
    );

    res.json({ success: true, id: Number(info.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const b = req.body;
    const id = req.params.id;
    const fields = [];
    const params = [];

    const allowed = ['name', 'sku', 'category', 'price', 'price_num', 'stock', 'sizes', 'color_count', 'has_video', 'image', 'is_active'];
    for (const k of allowed) {
      if (b[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(k === 'sizes' && typeof b[k] !== 'string' ? JSON.stringify(b[k]) : b[k]);
      }
    }
    if (fields.length > 0) {
      params.push(id);
      db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
    res.json({ success: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/products/bulk', (req, res) => {
  try {
    const { product_ids, action } = req.body;
    if (!product_ids || !product_ids.length) return res.json({ success: false, affected_count: 0 });

    const placeholders = product_ids.map(() => '?').join(',');
    if (action === 'activate') {
      db.prepare(`UPDATE products SET is_active = 1 WHERE id IN (${placeholders})`).run(...product_ids);
    } else if (action === 'deactivate') {
      db.prepare(`UPDATE products SET is_active = 0 WHERE id IN (${placeholders})`).run(...product_ids);
    } else if (action === 'delete') {
      db.prepare(`DELETE FROM products WHERE id IN (${placeholders})`).run(...product_ids);
    }
    res.json({ success: true, affected_count: product_ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 3. ORDERS API
// ========================================================
app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY id DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const idOrNum = req.params.id;
    let row = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(idOrNum, idOrNum);
    if (!row) return res.status(404).json({ detail: 'Sipariş bulunamadı' });

    let items = [];
    try {
      items = JSON.parse(row.items_json);
    } catch(e) {
      items = [];
    }
    res.json({ ...row, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const idOrNum = req.params.id;
    const { status, tracking_code } = req.body;
    db.prepare('UPDATE orders SET status = ?, tracking_code = ? WHERE id = ? OR order_number = ?').run(
      status,
      tracking_code || null,
      idOrNum,
      idOrNum
    );
    res.json({ success: true, order_id: idOrNum, status, tracking_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 4. PAYMENTS & FINANCIALS API
// ========================================================
app.get('/api/payments', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    if (status) {
      query += ' AND payout_status LIKE ?';
      params.push(`%${status}%`);
    }
    query += ' ORDER BY id DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 5. RETURNS API
// ========================================================
app.get('/api/returns', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM returns ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/returns/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE returns SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, return_id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 6. COUPONS & DISCOUNTS API
// ========================================================
app.get('/api/coupons', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons', (req, res) => {
  try {
    const b = req.body;
    const stmt = db.prepare(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      b.code.toUpperCase().trim(),
      b.discount_type || 'percentage',
      b.discount_value || 10,
      b.min_order_amount || 0,
      b.is_active !== undefined ? b.is_active : 1
    );
    const row = db.prepare('SELECT * FROM coupons WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, coupon: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 7. CATEGORIES API
// ========================================================
app.get('/api/categories', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const b = req.body;
    const stmt = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
    const info = stmt.run(b.name, b.slug, b.sort_order || 10);
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, category: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const b = req.body;
    db.prepare('UPDATE categories SET name = ?, slug = ?, sort_order = ? WHERE id = ?').run(
      b.name, b.slug, b.sort_order || 10, req.params.id
    );
    const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json({ success: true, category: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 8. BANNERS CMS API
// ========================================================
app.get('/api/banners', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/banners', (req, res) => {
  try {
    const b = req.body;
    const stmt = db.prepare(`
      INSERT INTO banners (title, subtitle, image_url, link_url, cta_text, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      b.title, b.subtitle, b.image_url, b.link_url, b.cta_text || 'HEMEN KEŞFET', b.sort_order || 1, b.is_active || 1
    );
    const row = db.prepare('SELECT * FROM banners WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, banner: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/banners/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 9. VARIATIONS API (BEDEN & RENK)
// ========================================================
app.get('/api/variations', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM variations ORDER BY group_name ASC, sort_order ASC, id ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/variations', (req, res) => {
  try {
    const b = req.body;
    const stmt = db.prepare('INSERT INTO variations (group_name, value, color_hex, sort_order, is_active) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(b.group_name || 'Beden', b.value, b.color_hex || null, b.sort_order || 1, b.is_active !== undefined ? b.is_active : 1);
    const row = db.prepare('SELECT * FROM variations WHERE id = ?').get(info.lastInsertRowid);
    res.json({ success: true, variation: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/variations/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM variations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 10. INTEGRATIONS & ACCOUNT API
// ========================================================
app.get('/api/integrations', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM integrations ORDER BY category ASC').all();
    const mapped = rows.map(r => {
      try { r.config = JSON.parse(r.config_json); } catch(e) { r.config = {}; }
      return r;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/integrations/:key', (req, res) => {
  try {
    const { is_enabled, config } = req.body;
    db.prepare('UPDATE integrations SET is_enabled = ?, config_json = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(
      is_enabled ? 1 : 0, JSON.stringify(config || {}), req.params.key
    );
    res.json({ success: true, key: req.params.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/account/profile', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM store_profile WHERE id = 1').get();
    res.json(row || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/account/profile', (req, res) => {
  try {
    const b = req.body;
    const fields = [];
    const params = [];
    for (const k of ['store_name', 'legal_title', 'tax_office', 'tax_number', 'support_email', 'support_phone', 'store_address', 'instagram_handle', 'maintenance_mode']) {
      if (b[k] !== undefined) {
        fields.push(`${k} = ?`);
        params.push(b[k]);
      }
    }
    if (fields.length) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(1);
      db.prepare(`UPDATE store_profile SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
    const row = db.prepare('SELECT * FROM store_profile WHERE id = 1').get();
    res.json({ success: true, profile: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 11. SHOP SETTINGS API
// ========================================================
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM shop_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const b = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO shop_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(b)) {
      stmt.run(k, String(v));
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tags', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tags ORDER BY sort_order ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 12. STOREFRONT & ADMIN MULTI-ROUTE HANDLERS
// ========================================================
// Admin Panel: ANY route starting with /admin serves public/admin/index.html
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Storefront routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/^\/koleksiyon(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/^\/urun(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sepet', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(/^\/hesap(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FK BUTIK NODE.JS SERVER RUNNING ON PORT ${PORT}]`);
});
