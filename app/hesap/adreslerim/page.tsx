'use client';

import React, { useEffect, useState } from 'react';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Home, Briefcase, AlertCircle, X } from 'lucide-react';

interface Address {
  id: number;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district?: string;
  full_address: string;
  zip_code?: string;
  is_default: number;
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('Ev');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('İstanbul');
  const [formDistrict, setFormDistrict] = useState('');
  const [formFullAddress, setFormFullAddress] = useState('');
  const [formZipCode, setFormZipCode] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch {
      setErrorMsg('Adresler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormTitle('Ev');
    setFormFullName('');
    setFormPhone('');
    setFormCity('İstanbul');
    setFormDistrict('');
    setFormFullAddress('');
    setFormZipCode('');
    setFormIsDefault(addresses.length === 0);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFormTitle(addr.title || 'Ev');
    setFormFullName(addr.full_name || '');
    setFormPhone(addr.phone || '');
    setFormCity(addr.city || 'İstanbul');
    setFormDistrict(addr.district || '');
    setFormFullAddress(addr.full_address || '');
    setFormZipCode(addr.zip_code || '');
    setFormIsDefault(addr.is_default === 1);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formPhone.trim() || !formCity.trim() || !formFullAddress.trim()) {
      setErrorMsg('Lütfen ad soyad, telefon, il ve açık adres alanlarını eksiksiz doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (editingAddress) {
        // Güncelle (PUT)
        const res = await fetch('/api/user/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAddress.id,
            title: formTitle,
            full_name: formFullName,
            phone: formPhone,
            city: formCity,
            district: formDistrict,
            full_address: formFullAddress,
            zip_code: formZipCode,
            is_default: formIsDefault,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Adres güncellenemedi.');
        setSuccessMsg('Adresiniz başarıyla güncellendi.');
      } else {
        // Yeni Ekle (POST)
        const res = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            full_name: formFullName,
            phone: formPhone,
            city: formCity,
            district: formDistrict,
            full_address: formFullAddress,
            zip_code: formZipCode,
            is_default: formIsDefault,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Adres eklenemedi.');
        setSuccessMsg('Yeni adresiniz başarıyla kaydedildi.');
      }

      setIsModalOpen(false);
      await fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Adres silinemedi.');
      setSuccessMsg('Adres silindi.');
      await fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Adres silinirken hata oluştu.');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Varsayılan yapılamadı.');
      setSuccessMsg('Varsayılan teslimat adresi güncellendi.');
      await fetchAddresses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hata oluştu.');
    }
  };

  return (
    <AccountLayout
      title="Kayıtlı Adreslerim"
      subtitle="Siparişlerinizde hızlıca kullanmak için teslimat ve fatura adreslerinizi buradan yönetin."
    >
      <div>
        {/* Bildirim Mesajları */}
        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              color: '#16a34a',
              fontSize: '13.5px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '13.5px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Üst Bar: Yeni Adres Butonu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#ff6000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 96, 0, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
          >
            <Plus size={18} />
            <span>Yeni Adres Ekle</span>
          </button>
        </div>

        {/* Adres Listesi Grid */}
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Kayıtlı adresleriniz getiriliyor...
          </div>
        ) : addresses.length === 0 ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '50px 24px',
              textAlign: 'center',
            }}
          >
            <MapPin size={42} style={{ color: '#94a3b8', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Henüz Kayıtlı Bir Adresiniz Yok
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', maxWidth: '420px', marginInline: 'auto' }}>
              Alışverişlerinizde sepetinizi saniyeler içinde tamamlamak için teslimat adresinizi hemen ekleyin.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                backgroundColor: '#ff6000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              <span>İlk Adresini Ekle</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {addresses.map((addr) => {
              const isDefault = addr.is_default === 1;
              const isWork = addr.title?.toLowerCase().includes('iş') || addr.title?.toLowerCase().includes('ofis');

              return (
                <div
                  key={addr.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: `2px solid ${isDefault ? '#ff6000' : '#e2e8f0'}`,
                    padding: '22px',
                    boxShadow: isDefault ? '0 4px 14px rgba(255, 96, 0, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Kart Başlık & Rozetler */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isDefault ? '#fff7ed' : '#f1f5f9',
                            color: isDefault ? '#ff6000' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isWork ? <Briefcase size={16} /> : <Home size={16} />}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          {addr.title}
                        </span>
                      </div>

                      {isDefault && (
                        <span
                          style={{
                            backgroundColor: '#fff7ed',
                            color: '#ea580c',
                            border: '1px solid #fed7aa',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Varsayılan</span>
                        </span>
                      )}
                    </div>

                    {/* Alıcı & Telefon */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {addr.full_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        {addr.phone}
                      </div>
                    </div>

                    {/* Açık Adres & İlçe / İl */}
                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                      {addr.full_address}
                    </p>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                      {addr.district ? `${addr.district} / ` : ''}{addr.city} {addr.zip_code ? `(${addr.zip_code})` : ''}
                    </div>
                  </div>

                  {/* Alt Butonlar */}
                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '14px',
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6000',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Varsayılan Yap
                      </button>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginLeft: isDefault ? 'auto' : '0' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(addr)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Yeni / Düzenle Adres Formu */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '540px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {errorMsg && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Adres Başlığı */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Adres Başlığı (Örn: Ev, İş, Yazlık) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Evim"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Ad Soyad & Telefon */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      placeholder="Fatma Akgün"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Cep Telefonu *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* İl & İlçe */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      İl *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="İstanbul"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      İlçe *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      placeholder="Kadıköy"
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Açık Adres */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Açık Adres (Cadde, Mahalle, Sokak, No, Daire) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formFullAddress}
                    onChange={(e) => setFormFullAddress(e.target.value)}
                    placeholder="Örn: Caferağa Mah. Moda Cad. No: 15 Daire: 4"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Posta Kodu */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Posta Kodu (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={formZipCode}
                    onChange={(e) => setFormZipCode(e.target.value)}
                    placeholder="34710"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Varsayılan Yap Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0 10px' }}>
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#ff6000' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    Bu adresi varsayılan teslimat adresi olarak ayarla
                  </span>
                </label>

                {/* Butonlar */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#ff6000',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 96, 0, 0.25)',
                    }}
                  >
                    {isSubmitting ? 'Kaydediliyor...' : editingAddress ? 'Değişiklikleri Kaydet' : 'Adresi Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

