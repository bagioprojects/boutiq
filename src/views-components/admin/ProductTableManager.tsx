'use client';

import React, { useState } from 'react';
import { ParsedProduct } from '@/src/models/entities/product.entity';

interface ProductTableManagerProps {
  products: ParsedProduct[];
}

export const ProductTableManager: React.FC<ProductTableManagerProps> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState<ParsedProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ParsedProduct | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Kadın Üst Giyim');
  const [formPrice, setFormPrice] = useState('599.99');
  const [formStock, setFormStock] = useState('50');
  const [formImage, setFormImage] = useState('/images/default.jpg');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formBadge, setFormBadge] = useState('');
  const [customBadge, setCustomBadge] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const PRESET_BADGES = [
    'Son 14 Günün En Düşük Fiyatı!',
    'En Çok Satan',
    'Tükeniyor',
    'Yeni Sezon',
    'Fırsat Ürünü',
  ];

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('Kadın Üst Giyim');
    setFormPrice('599.99');
    setFormStock('50');
    setFormImage('/images/default.jpg');
    setFormIsActive(true);
    setFormBadge('');
    setCustomBadge('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: ParsedProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(String(p.price));
    setFormStock(String(p.stock));
    setFormImage(p.image);
    setFormIsActive(p.isActive);

    const b = p.badge || '';
    if (!b) {
      setFormBadge('');
      setCustomBadge('');
    } else if (PRESET_BADGES.includes(b)) {
      setFormBadge(b);
      setCustomBadge('');
    } else {
      setFormBadge('custom');
      setCustomBadge(b);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Ürün silinemedi.');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Ürün başarıyla silindi.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Silme işleminde hata oluştu.', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const resolvedBadge = formBadge === 'custom' ? customBadge.trim() : formBadge.trim();
    const finalBadge = resolvedBadge ? resolvedBadge : null;

    try {
      if (editingProduct) {
        // UPDATE
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formName.trim(),
            category: formCategory.trim(),
            price: Number(formPrice),
            stock: Number(formStock),
            image: formImage.trim(),
            badge: finalBadge,
            is_active: formIsActive ? 1 : 0,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Ürün güncellenemedi.');

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formName.trim(),
                  category: formCategory.trim(),
                  price: Number(formPrice),
                  priceFormatted: `${Number(formPrice).toFixed(2)} ₺`,
                  stock: Number(formStock),
                  image: formImage.trim(),
                  badge: finalBadge,
                  isActive: formIsActive,
                }
              : p
          )
        );

        showToast('Ürün başarıyla güncellendi.', 'success');
        setEditingProduct(null);
      } else {
        // CREATE
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            category: formCategory.trim(),
            price: Number(formPrice),
            stock: Number(formStock),
            image: formImage.trim(),
            badge: finalBadge,
            is_active: formIsActive ? 1 : 0,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Ürün eklenemedi.');

        const newId = data.id || Math.floor(1000 + Math.random() * 9000);
        const newProduct: ParsedProduct = {
          id: newId,
          name: formName.trim(),
          sku: `FK-${newId}`,
          category: formCategory.trim(),
          price: Number(formPrice),
          priceFormatted: `${Number(formPrice).toFixed(2)} ₺`,
          stock: Number(formStock),
          sizes: ['STANDART'],
          colorCount: 1,
          hasVideo: false,
          hasBackInset: false,
          image: formImage.trim(),
          images: [formImage.trim()],
          url: `/urun/${newId}`,
          badge: finalBadge,
          isActive: formIsActive,
          createdAt: new Date().toISOString(),
        };

        setProducts((prev) => [newProduct, ...prev]);
        showToast('Yeni ürün kataloğa eklendi.', 'success');
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Toast Bildirimi */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: toastMsg.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Üst Bar: Başlık & Yeni Ürün Ekle Butonu */}
      <div className="shopier-view-header flex-between" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="view-title">ÜRÜN YÖNETİMİ</h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Toplam {filteredProducts.length} adet ürün listeleniyor. Fiyat, stok ve durumları yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            padding: '10px 20px',
            background: '#ff6000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 96, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>+</span> Yeni Ürün Ekle
        </button>
      </div>

      {/* Arama ve Kategori Filtresi Barı */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Ürün adı veya SKU ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '240px',
            maxWidth: '400px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13.5px',
            outline: 'none',
            background: '#ffffff',
          }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13.5px',
            outline: 'none',
            background: '#ffffff',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          <option value="all">Tüm Kategoriler ({products.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Ürünler Tablo Kartı */}
      <div className="shopier-table-container">
        <table className="shopier-table">
          <thead>
            <tr>
              <th>Görsel</th>
              <th>Ürün Adı &amp; SKU</th>
              <th>Kategori</th>
              <th>Rozet</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Arama kriterlerine uygun ürün bulunamadı.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ width: '60px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '58px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        backgroundImage: `url(${p.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{p.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      SKU: <code style={{ color: '#ff6000' }}>{p.sku}</code>
                    </div>
                  </td>
                  <td>
                    <span className="badge-pill">{p.category}</span>
                  </td>
                  <td>
                    {p.badge ? (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #ffedd5',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        🏷️ {p.badge}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Rozetsiz</span>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{p.priceFormatted}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color: p.stock < 5 ? '#dc2626' : '#16a34a',
                        backgroundColor: p.stock < 5 ? '#fef2f2' : '#f0fdf4',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {p.stock} adet
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {p.isActive ? '✓ Yayında' : '✕ Pasif'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          textDecoration: 'none',
                        }}
                      >
                        Önizle
                      </a>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                        }}
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          background: '#fef2f2',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#dc2626',
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Ürün Ekle / Düzenle Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  FK Butik e-ticaret veritabanında anında güncellenir.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Örn: Kuşaklı Keten Elbise"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Örn: Elbise, Üst Giyim"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="599.99"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Stok Adedi
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Yayın Durumu
                  </label>
                  <select
                    value={formIsActive ? '1' : '0'}
                    onChange={(e) => setFormIsActive(e.target.value === '1')}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                  >
                    <option value="1">Yayında (Aktif)</option>
                    <option value="0">Taslak (Pasif)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="/images/products/example.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Ürün Rozeti / Bilgi Kartı */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                  🏷️ Ürün Rozeti / Bilgi Kartı (Varsayılan: Rozetsiz)
                </label>
                <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Ürünler varsayılan olarak rozetsizdir. Bilgi kartı (&quot;Son 14 gün en düşük fiyatı&quot; vb.) sadece buradan seçilirse gösterilir.
                </span>
                <select
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: formBadge ? '#ff6000' : '#475569',
                  }}
                >
                  <option value="">Yok (Rozetsiz - Standart Ürün)</option>
                  <option value="Son 14 Günün En Düşük Fiyatı!">Son 14 Günün En Düşük Fiyatı! (Trendyol stili indirim kartı)</option>
                  <option value="En Çok Satan">En Çok Satan</option>
                  <option value="Tükeniyor">Tükeniyor</option>
                  <option value="Yeni Sezon">Yeni Sezon</option>
                  <option value="Fırsat Ürünü">Fırsat Ürünü</option>
                  <option value="custom">Özel Rozet Metni Girin...</option>
                </select>

                {formBadge === 'custom' && (
                  <input
                    type="text"
                    placeholder="Özel rozet metni (örn: Sınırlı Koleksiyon)"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 96, 0, 0.3)',
                  }}
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

