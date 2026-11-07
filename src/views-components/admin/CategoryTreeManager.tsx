'use client';

import React, { useState, useEffect } from 'react';
import { CategoryItem } from '@/src/models/repositories/category.repository';

interface Props {
  initialTree: CategoryItem[];
  allCategories: CategoryItem[];
}

export const CategoryTreeManager: React.FC<Props> = ({ initialTree, allCategories }) => {
  const [tree, setTree] = useState<CategoryItem[]>(initialTree);
  const [allList, setAllList] = useState<CategoryItem[]>(allCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sürükle - Bırak (Drag & Drop) Durumları
  const [draggedRootIdx, setDraggedRootIdx] = useState<number | null>(null);
  const [dragOverRootIdx, setDragOverRootIdx] = useState<number | null>(null);
  const [draggedSub, setDraggedSub] = useState<{ parentId: number; subIdx: number } | null>(null);
  const [dragOverSub, setDragOverSub] = useState<{ parentId: number; subIdx: number } | null>(null);

  // Modal durumları
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);

  // Form durumları
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState(true);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const reloadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setTree(json.data.tree);
        setAllList(json.data.all);
      }
    } catch {
      showNotification('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. Dinamik Sıra Değiştirme (Tekil Yukarı / Aşağı Butonları)
  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, direction }),
      });
      const data = await res.json();
      if (data.success) {
        await reloadData();
        showNotification('Sıralama başarıyla güncellendi.');
      } else {
        showNotification(data.message || 'Sıra değiştirilemedi.', 'error');
      }
    } catch {
      showNotification('İşlem sırasında bağlantı hatası oluştu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Sürükle - Bırak (Drag & Drop) Ana Kategoriler
  const handleRootDragStart = (e: React.DragEvent, index: number) => {
    setDraggedRootIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleRootDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverRootIdx !== index) {
      setDragOverRootIdx(index);
    }
  };

  const handleRootDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedRootIdx === null || draggedRootIdx === targetIndex) {
      setDraggedRootIdx(null);
      setDragOverRootIdx(null);
      return;
    }

    const newTree = [...tree];
    const [movedRoot] = newTree.splice(draggedRootIdx, 1);
    newTree.splice(targetIndex, 0, movedRoot);

    // Sıraları güncelle
    const batchItems = newTree.map((item, idx) => ({
      id: item.id,
      sort_order: idx + 1,
    }));

    // İyimser UI güncellemesi
    setTree(newTree.map((item, idx) => ({ ...item, sort_order: idx + 1 })));
    setDraggedRootIdx(null);
    setDragOverRootIdx(null);

    // Sunucuya kaydet
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batchItems }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Ana kategoriler sürükle-bırak ile başarıyla sıralandı.');
        await reloadData();
      } else {
        showNotification(json.message || 'Sıralama kaydedilemedi.', 'error');
        await reloadData();
      }
    } catch {
      showNotification('Bağlantı hatası.', 'error');
      await reloadData();
    }
  };

  // 3. Sürükle - Bırak (Drag & Drop) Alt Kategoriler
  const handleSubDragStart = (e: React.DragEvent, parentId: number, subIdx: number) => {
    e.stopPropagation();
    setDraggedSub({ parentId, subIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubDragOver = (e: React.DragEvent, parentId: number, subIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSub || dragOverSub.parentId !== parentId || dragOverSub.subIdx !== subIdx) {
      setDragOverSub({ parentId, subIdx });
    }
  };

  const handleSubDrop = async (e: React.DragEvent, parentId: number, targetSubIdx: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedSub || draggedSub.parentId !== parentId || draggedSub.subIdx === targetSubIdx) {
      setDraggedSub(null);
      setDragOverSub(null);
      return;
    }

    const parentNode = tree.find((r) => r.id === parentId);
    if (!parentNode || !parentNode.children) {
      setDraggedSub(null);
      setDragOverSub(null);
      return;
    }

    const newChildren = [...parentNode.children];
    const [movedSub] = newChildren.splice(draggedSub.subIdx, 1);
    newChildren.splice(targetSubIdx, 0, movedSub);

    const batchItems = newChildren.map((sub, idx) => ({
      id: sub.id,
      sort_order: idx + 1,
    }));

    // İyimser UI güncellemesi
    setTree((prevTree) =>
      prevTree.map((root) => {
        if (root.id === parentId) {
          return {
            ...root,
            children: newChildren.map((s, idx) => ({ ...s, sort_order: idx + 1 })),
          };
        }
        return root;
      })
    );

    setDraggedSub(null);
    setDragOverSub(null);

    // Sunucuya kaydet
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batchItems }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Alt kategoriler sürükle-bırak ile başarıyla sıralandı.');
        await reloadData();
      } else {
        showNotification(json.message || 'Sıralama kaydedilemedi.', 'error');
        await reloadData();
      }
    } catch {
      showNotification('Bağlantı hatası.', 'error');
      await reloadData();
    }
  };

  // Kategori Ekleme
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('Kategori adı boş bırakılamaz.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || undefined,
          parent_id: formParentId ? Number(formParentId) : null,
          is_active: formIsActive ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setFormName('');
        setFormSlug('');
        setFormParentId('');
        await reloadData();
        showNotification(`'${formName}' kategorisi başarıyla eklendi.`);
      } else {
        showNotification(data.error || 'Eklenirken hata oluştu.', 'error');
      }
    } catch {
      showNotification('Sunucu hatası oluştu.', 'error');
    }
  };

  // Kategori Düzenleme Modalı Aç
  const openEditModal = (item: CategoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormSlug(item.slug);
    setFormParentId(item.parent_id ? String(item.parent_id) : '');
    setFormIsActive(Boolean(item.is_active));
    setIsEditModalOpen(true);
  };

  // Kategori Güncelleme
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          name: formName.trim(),
          slug: formSlug.trim(),
          parent_id: formParentId ? Number(formParentId) : null,
          is_active: formIsActive ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingItem(null);
        await reloadData();
        showNotification(`'${formName}' kategorisi başarıyla güncellendi.`);
      } else {
        showNotification(data.error || 'Güncellenirken hata oluştu.', 'error');
      }
    } catch {
      showNotification('Sunucu hatası oluştu.', 'error');
    }
  };

  // Kategori Silme
  const handleDelete = async (item: CategoryItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const confirmText = hasChildren
      ? `'${item.name}' kategorisini ve altındaki ${item.children?.length} alt kategoriyi silmek veya ayırmak istediğinize emin misiniz?`
      : `'${item.name}' kategorisini silmek istediğinize emin misiniz?`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await reloadData();
        showNotification('Kategori başarıyla silindi.');
      } else {
        showNotification(data.error || 'Silinirken hata oluştu.', 'error');
      }
    } catch {
      showNotification('Sunucu hatası oluştu.', 'error');
    }
  };

  // Slug otomatik türetme
  const handleNameChange = (val: string) => {
    setFormName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setFormSlug(generatedSlug);
  };

  // Filtrelenmiş Ağaç
  const filteredTree = tree.filter((root) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    if (root.name.toLowerCase().includes(term) || root.slug.toLowerCase().includes(term)) return true;
    return root.children?.some((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Bildirimi */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            backgroundColor: feedback.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Üst Başlık ve Kontrol Çubuğu */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            KATEGORİ AĞACI VE SIRALAMA YÖNETİMİ
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Kategorileri tutup sürükleyerek (Drag &amp; Drop) veya ▲/▼ butonlarıyla anlık sıralayın.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Kategori veya slug ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '9px 14px 9px 34px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                width: '220px',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8', fontSize: '14px' }}>
              🔍
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormName('');
              setFormSlug('');
              setFormParentId('');
              setFormIsActive(true);
              setIsAddModalOpen(true);
            }}
            style={{
              backgroundColor: '#ff6000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(255, 96, 0, 0.25)',
              transition: 'background 0.2s',
            }}
          >
            <span>+</span>
            <span>Yeni Kategori Ekle</span>
          </button>
        </div>
      </div>

      {/* İpucu Çubuğu: Sürükle Bırak Bilgilendirmesi */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#1e40af',
        }}
      >
        <span style={{ fontSize: '16px' }}>💡</span>
        <span>
          <strong>Sürükle &amp; Bırak Aktif:</strong> Satırların solundaki <strong>⠿ Tutma İkonuna</strong> basılı tutarak kategorileri yukarı veya aşağı sürükleyip istediğiniz sıraya bırakabilirsiniz. Sıralama anında veritabanına kaydedilir.
        </span>
      </div>

      {/* Kategori Hiyerarşi Ağacı */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Hiyerarşik Kategori Sıralaması
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {isLoading ? 'Kaydediliyor...' : `${filteredTree.length} Ana Kategori`}
          </span>
        </div>

        {filteredTree.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            Aranan kritere uygun kategori bulunamadı.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTree.map((root, rootIdx) => {
              const isCollapsed = Boolean(collapsedMap[root.id]);
              const children = root.children || [];
              const isDraggingThis = draggedRootIdx === rootIdx;
              const isDragOverThis = dragOverRootIdx === rootIdx;

              return (
                <div
                  key={root.id}
                  draggable
                  onDragStart={(e) => handleRootDragStart(e, rootIdx)}
                  onDragOver={(e) => handleRootDragOver(e, rootIdx)}
                  onDrop={(e) => handleRootDrop(e, rootIdx)}
                  onDragEnd={() => {
                    setDraggedRootIdx(null);
                    setDragOverRootIdx(null);
                  }}
                  style={{
                    borderBottom: '1px solid #edf2f7',
                    borderTop: isDragOverThis ? '3px solid #ff6000' : 'none',
                    backgroundColor: isDraggingThis ? '#f1f5f9' : rootIdx % 2 === 0 ? '#ffffff' : '#fafafa',
                    opacity: isDraggingThis ? 0.45 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Ana Kategori Satırı */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* SÜRÜKLE TUTMA İKONU (GRAB HANDLE) */}
                      <span
                        style={{
                          cursor: 'grab',
                          color: '#94a3b8',
                          fontSize: '18px',
                          userSelect: 'none',
                          padding: '2px 4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="Sürükleyip Sırasını Değiştir"
                      >
                        ⠿
                      </span>

                      {/* Genişlet / Daralt Butonu */}
                      <button
                        type="button"
                        onClick={() => toggleCollapse(root.id)}
                        style={{
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: '#475569',
                        }}
                        title={isCollapsed ? 'Genişlet' : 'Daralt'}
                      >
                        {isCollapsed ? '▶' : '▼'}
                      </button>

                      {/* Sıra Numarası Rozeti */}
                      <span
                        style={{
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          minWidth: '28px',
                          textAlign: 'center',
                        }}
                      >
                        #{root.sort_order}
                      </span>

                      {/* Kategori Adı ve Bilgisi */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                            {root.name}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            ÜST KATEGORİ
                          </span>
                          {children.length > 0 && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a',
                                padding: '2px 8px',
                                borderRadius: '12px',
                              }}
                            >
                              {children.length} Alt Kategori
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          URL: <code style={{ color: '#ff6000' }}>/koleksiyon/{root.slug}</code>
                        </div>
                      </div>
                    </div>

                    {/* Sağ Taraf: Sıralama Butonları & Eylemler */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Tekil Yukarı / Aşağı Sıralama Butonları */}
                      <div style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleReorder(root.id, 'up')}
                          disabled={rootIdx === 0}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: rootIdx === 0 ? 'transparent' : '#ffffff',
                            color: rootIdx === 0 ? '#cbd5e1' : '#0f172a',
                            cursor: rootIdx === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 900,
                            boxShadow: rootIdx === 0 ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                          }}
                          title="Yukarı Taşı"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(root.id, 'down')}
                          disabled={rootIdx === tree.length - 1}
                          style={{
                            width: '28px',
                            height: '28px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: rootIdx === tree.length - 1 ? 'transparent' : '#ffffff',
                            color: rootIdx === tree.length - 1 ? '#cbd5e1' : '#0f172a',
                            cursor: rootIdx === tree.length - 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 900,
                            boxShadow: rootIdx === tree.length - 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                          }}
                          title="Aşağı Taşı"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Düzenle Butonu */}
                      <button
                        type="button"
                        onClick={() => openEditModal(root)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Düzenle
                      </button>

                      {/* Sil Butonu */}
                      <button
                        type="button"
                        onClick={() => handleDelete(root)}
                        style={{
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>

                  {/* Alt Kategoriler (Ağaç İçeriği) */}
                  {!isCollapsed && children.length > 0 && (
                    <div style={{ paddingLeft: '52px', paddingRight: '20px', paddingBottom: '12px' }}>
                      <div style={{ borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '16px' }}>
                        {children.map((sub, subIdx) => {
                          const isSubDragging = draggedSub?.parentId === root.id && draggedSub?.subIdx === subIdx;
                          const isSubOver = dragOverSub?.parentId === root.id && dragOverSub?.subIdx === subIdx;

                          return (
                            <div
                              key={sub.id}
                              draggable
                              onDragStart={(e) => handleSubDragStart(e, root.id, subIdx)}
                              onDragOver={(e) => handleSubDragOver(e, root.id, subIdx)}
                              onDrop={(e) => handleSubDrop(e, root.id, subIdx)}
                              onDragEnd={() => {
                                setDraggedSub(null);
                                setDragOverSub(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: isSubDragging ? '#f1f5f9' : '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderTop: isSubOver ? '3px solid #ff6000' : '1px solid #e2e8f0',
                                opacity: isSubDragging ? 0.45 : 1,
                                borderRadius: '8px',
                                padding: '10px 14px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Alt Kategori Tutma İkonu */}
                                <span
                                  style={{
                                    cursor: 'grab',
                                    color: '#94a3b8',
                                    fontSize: '16px',
                                    userSelect: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Alt Kategoriyi Sürükleyip Sırala"
                                >
                                  ⠿
                                </span>

                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>↳</span>
                                <span
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  #{sub.sort_order}
                                </span>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                    {sub.name}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
                                    /koleksiyon/{sub.slug}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {/* Alt Kategori Yukarı/Aşağı Butonları */}
                                <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f8fafc', padding: '2px', borderRadius: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleReorder(sub.id, 'up')}
                                    disabled={subIdx === 0}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      border: 'none',
                                      borderRadius: '3px',
                                      backgroundColor: subIdx === 0 ? 'transparent' : '#ffffff',
                                      color: subIdx === 0 ? '#cbd5e1' : '#0f172a',
                                      cursor: subIdx === 0 ? 'not-allowed' : 'pointer',
                                      fontWeight: 800,
                                      fontSize: '10px',
                                    }}
                                    title="Yukarı Taşı"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReorder(sub.id, 'down')}
                                    disabled={subIdx === children.length - 1}
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      border: 'none',
                                      borderRadius: '3px',
                                      backgroundColor: subIdx === children.length - 1 ? 'transparent' : '#ffffff',
                                      color: subIdx === children.length - 1 ? '#cbd5e1' : '#0f172a',
                                      cursor: subIdx === children.length - 1 ? 'not-allowed' : 'pointer',
                                      fontWeight: 800,
                                      fontSize: '10px',
                                    }}
                                    title="Aşağı Taşı"
                                  >
                                    ▼
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(sub)}
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    color: '#334155',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✏️ Düzenle
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(sub)}
                                  style={{
                                    backgroundColor: '#fff1f2',
                                    border: '1px solid #fecdd3',
                                    color: '#e11d48',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  🗑️ Sil
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* YENİ KATEGORİ EKLE MODALI */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Yeni Kategori Ekle
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Trençkot & Yağmurluk"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Slug / URL
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="trenckot-yagmurluk"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Üst Kategori Seçimi
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Ana Kategori Olarak Ekle (Üst Kategori Yok) --</option>
                  {tree.map((root) => (
                    <option key={root.id} value={root.id}>
                      {root.name} (Altına Ekle)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="chk-active-add"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <label htmlFor="chk-active-add" style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Aktif (Vitrin ve filtrelerde görünsün)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Kaydet &amp; Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KATEGORİ DÜZENLEME MODALI */}
      {isEditModalOpen && editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Kategori Düzenle: {editingItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Slug / URL
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Üst Kategori
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Ana Kategori Olarak Ayarla (Üst Kategori Yok) --</option>
                  {tree
                    .filter((r) => r.id !== editingItem.id)
                    .map((root) => (
                      <option key={root.id} value={root.id}>
                        {root.name} (Alt Kategorisi Yap)
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="chk-active-edit"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                <label htmlFor="chk-active-edit" style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
                  Aktif (Vitrin ve filtrelerde görünsün)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
