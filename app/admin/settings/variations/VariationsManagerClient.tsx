'use client';

import React, { useState, useMemo } from 'react';
import { VariationEntity } from '@/src/models/entities/settings.entity';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Sliders, Palette, Tag } from 'lucide-react';

interface Props {
  initialVariations: VariationEntity[];
}

export function VariationsManagerClient({ initialVariations }: Props) {
  const [variations, setVariations] = useState<VariationEntity[]>(initialVariations);
  const [activeTab, setActiveTab] = useState<'all' | 'Beden' | 'Renk'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<VariationEntity | null>(null);

  // Form State
  const [formGroup, setFormGroup] = useState<'Beden' | 'Renk'>('Beden');
  const [formValue, setFormValue] = useState('');
  const [formColorHex, setFormColorHex] = useState('#ff6000');
  const [formSortOrder, setFormSortOrder] = useState('1');
  const [formIsActive, setFormIsActive] = useState(true);

  // Status message
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredVariations = useMemo(() => {
    return variations.filter((v) => {
      const matchesGroup = activeTab === 'all' || v.group_name === activeTab;
      const matchesSearch =
        !searchQuery.trim() ||
        v.value.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        v.group_name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (v.color_hex && v.color_hex.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchesGroup && matchesSearch;
    });
  }, [variations, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = variations.length;
    const sizeCount = variations.filter((v) => v.group_name === 'Beden').length;
    const colorCount = variations.filter((v) => v.group_name === 'Renk').length;
    return { total, sizeCount, colorCount };
  }, [variations]);

  const handleOpenAddModal = () => {
    setEditingVariation(null);
    setFormGroup(activeTab === 'Renk' ? 'Renk' : 'Beden');
    setFormValue('');
    setFormColorHex('#ff6000');
    setFormSortOrder((variations.length + 1).toString());
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VariationEntity) => {
    setEditingVariation(v);
    setFormGroup((v.group_name as 'Beden' | 'Renk') || 'Beden');
    setFormValue(v.value);
    setFormColorHex(v.color_hex || '#ff6000');
    setFormSortOrder(v.sort_order.toString());
    setFormIsActive(v.is_active !== 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValue.trim()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingVariation) {
        // Update
        const res = await fetch('/api/admin/variations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingVariation.id,
            group_name: formGroup,
            value: formValue.trim(),
            color_hex: formGroup === 'Renk' ? formColorHex : null,
            sort_order: Number(formSortOrder) || 1,
            is_active: formIsActive ? 1 : 0,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Güncellenemedi.');

        setVariations((prev) =>
          prev.map((item) => (item.id === editingVariation.id ? data.data : item))
        );
        setMessage({ text: 'Varyasyon başarıyla güncellendi.', type: 'success' });
      } else {
        // Create
        const res = await fetch('/api/admin/variations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group_name: formGroup,
            value: formValue.trim(),
            color_hex: formGroup === 'Renk' ? formColorHex : null,
            sort_order: Number(formSortOrder) || 1,
            is_active: formIsActive ? 1 : 0,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Eklenemedi.');

        setVariations((prev) => [...prev, data.data]);
        setMessage({ text: 'Yeni varyasyon başarıyla eklendi.', type: 'success' });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setMessage({ text: err.message || 'İşlem başarısız.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, value: string) => {
    if (!confirm(`"${value}" varyasyonunu silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/variations?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Silinemedi.');

      setVariations((prev) => prev.filter((v) => v.id !== id));
      setMessage({ text: `"${value}" varyasyonu silindi.`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Silme işlemi başarısız.', type: 'error' });
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="shopier-view-header flex-between" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="view-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Varyasyon ve Seçenek Yönetimi
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Ürünlerde kullanılan beden ölçüleri, renk kodları ve filtreleme matrisleri.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ff6000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(255, 96, 0, 0.25)',
          }}
        >
          <Plus size={16} />
          <span>Yeni Varyasyon Ekle</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{stats.total}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Toplam Seçenek</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{stats.sizeCount}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Beden Çeşitleri (XS-XXL)</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Palette size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{stats.colorCount}</div>
            <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Renk Paleti Çeşitleri</div>
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: 600,
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{message.type === 'success' ? '✓' : '✕'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            Tümü ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Beden')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'Beden' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'Beden' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            Beden Seçenekleri ({stats.sizeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Renk')}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'Renk' ? '#10b981' : '#f1f5f9',
              color: activeTab === 'Renk' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            Renk Seçenekleri ({stats.colorCount})
          </button>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Varyasyon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px 0 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>#ID</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Grup</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Değer</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Renk Önizleme</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Sıralama</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>Durum</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredVariations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  Kriterlere uygun varyasyon bulunamadı.
                </td>
              </tr>
            ) : (
              filteredVariations.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}>
                    #{v.id}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: v.group_name === 'Renk' ? '#ecfdf5' : '#eff6ff',
                        color: v.group_name === 'Renk' ? '#10b981' : '#2563eb',
                      }}
                    >
                      {v.group_name}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '14px' }}>{v.value}</strong>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {v.color_hex ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: v.color_hex,
                            border: '1px solid #cbd5e1',
                            display: 'inline-block',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                        />
                        <code style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {v.color_hex}
                        </code>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 700, color: '#475569', fontSize: '13px' }}>#{v.sort_order}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: v.is_active !== 0 ? '#16a34a' : '#94a3b8',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {v.is_active !== 0 ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {v.is_active !== 0 ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(v)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: 'none',
                          color: '#334155',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Düzenle"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id, v.value)}
                        style={{
                          backgroundColor: '#fef2f2',
                          border: 'none',
                          color: '#dc2626',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingVariation ? 'Varyasyonu Düzenle' : 'Yeni Varyasyon Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Varyasyon Grubu
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${formGroup === 'Beden' ? '#2563eb' : '#cbd5e1'}`,
                      backgroundColor: formGroup === 'Beden' ? '#eff6ff' : '#ffffff',
                      color: formGroup === 'Beden' ? '#2563eb' : '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="group_name"
                      value="Beden"
                      checked={formGroup === 'Beden'}
                      onChange={() => setFormGroup('Beden')}
                      style={{ display: 'none' }}
                    />
                    <span>Beden</span>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${formGroup === 'Renk' ? '#10b981' : '#cbd5e1'}`,
                      backgroundColor: formGroup === 'Renk' ? '#ecfdf5' : '#ffffff',
                      color: formGroup === 'Renk' ? '#10b981' : '#475569',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="group_name"
                      value="Renk"
                      checked={formGroup === 'Renk'}
                      onChange={() => setFormGroup('Renk')}
                      style={{ display: 'none' }}
                    />
                    <span>Renk</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Varyasyon Değeri
                </label>
                <input
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={formGroup === 'Beden' ? 'Örn: S, M, L veya 38, 40' : 'Örn: Petrol Yeşili, Bordo'}
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {formGroup === 'Renk' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Renk Önizlemesi &amp; Hex Kodu
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      style={{
                        width: '44px',
                        height: '42px',
                        padding: 0,
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      type="text"
                      value={formColorHex}
                      onChange={(e) => setFormColorHex(e.target.value)}
                      placeholder="#ff6000"
                      style={{
                        flex: 1,
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Görüntülenme Sırası
                </label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(e.target.value)}
                  min="1"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="formActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#ff6000', cursor: 'pointer' }}
                />
                <label htmlFor="formActive" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Bu varyasyon filtrelerde ve ürünlerde aktif olsun
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? 'Kaydediliyor...' : editingVariation ? 'Değişiklikleri Kaydet' : 'Varyasyonu Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

