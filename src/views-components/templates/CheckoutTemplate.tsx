'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../organisms/Header';
import { Footer } from '../organisms/Footer';
import { useCart } from '@/src/core/cart/use-cart';
import { useAuth } from '@/src/core/auth/auth-store';

interface Address {
  id?: number;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  full_address: string;
  is_default?: number;
}

export const CheckoutTemplate: React.FC = () => {
  const router = useRouter();
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Adres Durumu
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Form Verileri
  const [addressTitle, setAddressTitle] = useState('Ev');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('İstanbul');
  const [district, setDistrict] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  // Kargo & Ödeme Durumu
  const [shippingMethod, setShippingMethod] = useState('yurtici');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'eft'>('card');

  // Kart Bilgileri
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [contractAccepted, setContractAccepted] = useState(true);

  // İşlem Durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Kullanıcı adreslerini yükle
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/addresses')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.is_default) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id || 'new');
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch(() => setShowNewAddressForm(true));
    } else {
      setShowNewAddressForm(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.full_name || '');
      if (!phone) setPhone(user.phone || '');
    }
  }, [user]);

  // Sepet boşsa sepete yönlendir
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => {
        router.push('/sepet');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [items.length, router]);

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Sepetinizde ürün bulunmuyor.');
      return;
    }

    let finalName = fullName;
    let finalPhone = phone;
    let finalCity = city;
    let finalDistrict = district;
    let finalFullAddress = fullAddress;

    if (selectedAddressId !== 'new') {
      const selected = savedAddresses.find((a) => a.id === selectedAddressId);
      if (selected) {
        finalName = selected.full_name;
        finalPhone = selected.phone;
        finalCity = selected.city;
        finalDistrict = selected.district;
        finalFullAddress = selected.full_address;
      }
    } else {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Lütfen ad ve soyadınızı giriniz.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setErrorMessage('Lütfen 10 haneli geçerli bir telefon numarası giriniz.');
        return;
      }
      if (!city.trim()) {
        setErrorMessage('Lütfen teslimat ilini seçiniz.');
        return;
      }
      if (!fullAddress.trim() || fullAddress.trim().length < 8) {
        setErrorMessage('Lütfen detaylı teslimat adresinizi giriniz.');
        return;
      }

      // Yeni adresi kullanıcı girişliyse kaydet
      if (isAuthenticated) {
        fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: addressTitle,
            full_name: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            district: district.trim(),
            full_address: fullAddress.trim(),
            is_default: savedAddresses.length === 0 ? 1 : 0,
          }),
        }).catch(() => {});
      }
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        setErrorMessage('Lütfen 16 haneli geçerli bir kredi kartı numarası giriniz.');
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMessage('Lütfen kart üzerindeki ad soyadı giriniz.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Lütfen son kullanma tarihini giriniz (AA/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Lütfen kartın arka yüzündeki 3 haneli CVV kodunu giriniz.');
        return;
      }
    }

    if (!contractAccepted) {
      setErrorMessage('Siparişi tamamlamak için Ön Bilgilendirme ve Mesafeli Satış Sözleşmesi koşullarını onaylamalısınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: finalName.trim(),
          customer_phone: finalPhone.trim(),
          customer_city: `${finalCity}${finalDistrict ? ` / ${finalDistrict}` : ''} - ${finalFullAddress}`,
          payment_method:
            paymentMethod === 'card'
              ? 'Kredi Kartı (3D Secure)'
              : paymentMethod === 'cod'
              ? 'Kapıda Ödeme'
              : 'Havale / EFT',
          cargo_company: shippingMethod === 'yurtici' ? 'Yurtiçi Kargo' : 'MNG Kargo',
          total_amount: total,
          items: items.map((i) => ({
            product_id: i.productId,
            product_name: i.name,
            sku: i.slug,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color || '',
            image_url: i.imageUrl || '',
          })),
        }),
      });

      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error('Siparişiniz işlenirken bir sorun oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.');
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Siparişiniz işlenirken bir sorun oluştu.');
      }

      const orderNumber = data.order_number || 'FK-' + Date.now().toString().slice(-6);
      clearCart();

      // Sipariş başarılı sayfasına git
      const cargoName = shippingMethod === 'yurtici' ? 'Yurtiçi Kargo' : 'MNG Kargo';
      router.push(`/siparis/basarili?orderNumber=${encodeURIComponent(orderNumber)}&total=${encodeURIComponent(total.toString())}&cargo=${encodeURIComponent(cargoName)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sipariş oluşturulamadı. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <main style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px', textAlign: 'center', flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Sepetiniz Boş</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Sepet sayfasına yönlendiriliyorsunuz...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      <main style={{ maxWidth: '1240px', margin: '24px auto 80px', padding: '0 16px', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        {/* Adım Göstergesi (Breadcrumb Nav) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
          <Link href="/sepet" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
            Sepetim
          </Link>
          <span>&gt;</span>
          <span style={{ color: '#ff6000', fontWeight: 800 }}>Siparişi Tamamla & Ödeme</span>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCompleteOrder}>
          <div className="fk-cart-layout">
            {/* SOL KOLON: ADRES & KARGO & ÖDEME FORM ALANI */}
            <div className="fk-cart-items-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. ADIM: TESLİMAT VE ADRES SEÇİMİ */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#ff6000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
                      1
                    </div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Teslimat ve İletişim Bilgileri
                    </h2>
                  </div>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId('new');
                        setShowNewAddressForm(true);
                      }}
                      style={{ background: 'none', border: 'none', color: '#ff6000', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Yeni Adres Ekle
                    </button>
                  )}
                </div>

                {/* Kayıtlı Adresler Listesi */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id!)}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #ff6000' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{addr.title}</strong>
                            {isSelected && <span style={{ color: '#ff6000', fontSize: '14px', fontWeight: 900 }}>✓</span>}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{addr.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{addr.phone}</div>
                          <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px', lineHeight: 1.3 }}>
                            {addr.district} / {addr.city}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Yeni Adres Formu */}
                {(savedAddresses.length === 0 || showNewAddressForm) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {savedAddresses.length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Kayıtlı Adreslerime Dön
                        </button>
                      </div>
                    )}

                    <div className="fk-checkout-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Adınız Soyadınız"
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Telefon Numarası *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05XX XXX XX XX"
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div className="fk-checkout-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          İl *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="İstanbul, Ankara..."
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          İlçe
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Kadıköy, Çankaya..."
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Adres Başlığı
                        </label>
                        <input
                          type="text"
                          value={addressTitle}
                          onChange={(e) => setAddressTitle(e.target.value)}
                          placeholder="Ev, İşyeri..."
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Açık Teslimat Adresi *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="Mahalle, cadde, sokak, bina ve daire numarası..."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ADIM: KARGO SEÇENEĞİ */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#ff6000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
                      2
                    </div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Kargo Firması
                    </h2>
                  </div>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '3px 10px', borderRadius: '12px' }}>
                    ✓ 500 TL Üzeri Ücretsiz Kargo
                  </span>
                </div>

                {/* KARGO FİRMALARI SEÇENEKLERİ (DESKTOP & MOBİL AYRI UYUMLU GÖRÜNÜM) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* 1. YURTİÇİ KARGO */}
                  <div
                    className={`fk-cargo-card ${shippingMethod === 'yurtici' ? 'selected' : ''}`}
                    onClick={() => setShippingMethod('yurtici')}
                  >
                    {/* MASAÜSTÜ (WEB) GÖRÜNÜMÜ */}
                    <div className="fk-cargo-desktop-view">
                      <div className="fk-cargo-desktop-left">
                        <div className={`fk-cargo-radio ${shippingMethod === 'yurtici' ? 'active' : ''}`} />
                        <div className="fk-cargo-logo-box">
                          <img src="/images/yurtici_kargo.svg" alt="Yurtiçi Kargo" />
                        </div>
                        <div className="fk-cargo-info">
                          <div className="fk-cargo-title-row">
                            <strong className="fk-cargo-name">Yurtiçi Kargo</strong>
                            <span className="fk-cargo-badge badge-green">Hızlı Teslimat</span>
                          </div>
                          <span className="fk-cargo-desc">
                            Saat 16:00'ya kadar verilen siparişlerde aynı gün kargoda (1-2 İş Günü)
                          </span>
                        </div>
                      </div>
                      <div className="fk-cargo-price">
                        {shipping === 0 ? (
                          <span className="fk-free-shipping">ÜCRETSİZ</span>
                        ) : (
                          `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                        )}
                      </div>
                    </div>

                    {/* MOBİL GÖRÜNÜM (RESPONSIVE AYRI GÖRÜNÜM) */}
                    <div className="fk-cargo-mobile-view">
                      <div className="fk-cargo-mobile-top">
                        <div className="fk-cargo-mobile-left">
                          <div className={`fk-cargo-radio ${shippingMethod === 'yurtici' ? 'active' : ''}`} />
                          <div className="fk-cargo-logo-box-mobile">
                            <img src="/images/yurtici_kargo.svg" alt="Yurtiçi Kargo" />
                          </div>
                        </div>
                        <div className="fk-cargo-mobile-price">
                          {shipping === 0 ? (
                            <span className="fk-free-shipping">ÜCRETSİZ</span>
                          ) : (
                            `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                          )}
                        </div>
                      </div>
                      <div className="fk-cargo-mobile-body">
                        <div className="fk-cargo-mobile-header-row">
                          <strong className="fk-cargo-mobile-name">Yurtiçi Kargo</strong>
                          <span className="fk-cargo-badge badge-green">Hızlı Teslimat</span>
                        </div>
                        <span className="fk-cargo-mobile-desc">
                          Saat 16:00'ya kadar verilen siparişlerde aynı gün kargoda (1-2 İş Günü)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. MNG KARGO */}
                  <div
                    className={`fk-cargo-card ${shippingMethod === 'mng' ? 'selected' : ''}`}
                    onClick={() => setShippingMethod('mng')}
                  >
                    {/* MASAÜSTÜ (WEB) GÖRÜNÜMÜ */}
                    <div className="fk-cargo-desktop-view">
                      <div className="fk-cargo-desktop-left">
                        <div className={`fk-cargo-radio ${shippingMethod === 'mng' ? 'active' : ''}`} />
                        <div className="fk-cargo-logo-box">
                          <img src="/images/mng_kargo.svg" alt="MNG Kargo" />
                        </div>
                        <div className="fk-cargo-info">
                          <div className="fk-cargo-title-row">
                            <strong className="fk-cargo-name">MNG Kargo</strong>
                            <span className="fk-cargo-badge badge-blue">Ekspres Teslimat</span>
                          </div>
                          <span className="fk-cargo-desc">
                            Türkiye geneli güvenli ve hızlı teslimat ağı (1-2 İş Günü)
                          </span>
                        </div>
                      </div>
                      <div className="fk-cargo-price">
                        {shipping === 0 ? (
                          <span className="fk-free-shipping">ÜCRETSİZ</span>
                        ) : (
                          `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                        )}
                      </div>
                    </div>

                    {/* MOBİL GÖRÜNÜM (RESPONSIVE AYRI GÖRÜNÜM) */}
                    <div className="fk-cargo-mobile-view">
                      <div className="fk-cargo-mobile-top">
                        <div className="fk-cargo-mobile-left">
                          <div className={`fk-cargo-radio ${shippingMethod === 'mng' ? 'active' : ''}`} />
                          <div className="fk-cargo-logo-box-mobile">
                            <img src="/images/mng_kargo.svg" alt="MNG Kargo" />
                          </div>
                        </div>
                        <div className="fk-cargo-mobile-price">
                          {shipping === 0 ? (
                            <span className="fk-free-shipping">ÜCRETSİZ</span>
                          ) : (
                            `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                          )}
                        </div>
                      </div>
                      <div className="fk-cargo-mobile-body">
                        <div className="fk-cargo-mobile-header-row">
                          <strong className="fk-cargo-mobile-name">MNG Kargo</strong>
                          <span className="fk-cargo-badge badge-blue">Ekspres Teslimat</span>
                        </div>
                        <span className="fk-cargo-mobile-desc">
                          Türkiye geneli güvenli ve hızlı teslimat ağı (1-2 İş Günü)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ADIM: ÖDEME YÖNTEMİ */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#ff6000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px' }}>
                    3
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Ödeme Yöntemi
                  </h2>
                </div>

                {/* Ödeme Türü Butonları */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === 'card' ? '2px solid #ff6000' : '1px solid #cbd5e1',
                      backgroundColor: paymentMethod === 'card' ? '#fff7ed' : '#ffffff',
                      color: paymentMethod === 'card' ? '#ff6000' : '#334155',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>💳</span>
                    <span>Kredi / Banka Kartı</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === 'cod' ? '2px solid #ff6000' : '1px solid #cbd5e1',
                      backgroundColor: paymentMethod === 'cod' ? '#fff7ed' : '#ffffff',
                      color: paymentMethod === 'cod' ? '#ff6000' : '#334155',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>📦</span>
                    <span>Kapıda Ödeme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('eft')}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === 'eft' ? '2px solid #ff6000' : '1px solid #cbd5e1',
                      backgroundColor: paymentMethod === 'eft' ? '#fff7ed' : '#ffffff',
                      color: paymentMethod === 'eft' ? '#ff6000' : '#334155',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>🏛️</span>
                    <span>Havale / EFT</span>
                  </button>
                </div>

                {/* Kart Bilgileri Formu */}
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Kart Numarası
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="•••• •••• •••• ••••"
                        style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="AD SOYAD"
                        style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Son Kullanma Tarihi
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="AA/YY"
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Güvenlik Kodu (CVV)
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>3D Secure ile 256-Bit Şifrelenmiş Güvenli Ödeme</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>
                    <strong>Kapıda Ödeme Kolaylığı:</strong> Siparişiniz kapınıza geldiğinde nakit veya kredi kartı ile güvenle ödeme yapabilirsiniz.
                  </div>
                )}

                {paymentMethod === 'eft' && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    <strong>Banka Hesap Bilgilerimiz:</strong>
                    <div style={{ marginTop: '6px' }}><strong>Banka:</strong> QNB Finansbank</div>
                    <div><strong>IBAN:</strong> TR12 0011 1000 0000 0123 4567 89</div>
                    <div><strong>Alıcı:</strong> FK Butik Tekstil Ltd. Şti.</div>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>Açıklama alanına sipariş numaranızı yazınız.</div>
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ KOLON: SİPARİŞ ÖZETİ VE ONAY KARTI */}
            <div className="fk-cart-summary-col">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  position: 'sticky',
                  top: '90px',
                }}
              >
                <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Sipariş Edilen Ürünler ({items.length})
                </h3>

                {/* Ürünler Mini Liste */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                      <img src={it.imageUrl || '/images/default.jpg'} alt={it.name} style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.name}</div>
                        <div style={{ color: '#64748b' }}>{it.quantity} adet • Beden: {it.size}</div>
                      </div>
                      <strong style={{ color: '#0f172a' }}>{(it.price * it.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', padding: '14px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Ara Toplam</span>
                    <strong style={{ color: '#0f172a' }}>{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Kargo</span>
                    <strong style={{ color: shipping === 0 ? '#16a34a' : '#0f172a' }}>
                      {shipping === 0 ? 'ÜCRETSİZ' : `${shipping.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 20px 0' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Toplam Tutar</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#ff6000' }}>
                    {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>

                {/* Sözleşme Onayı */}
                <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '11.5px', color: '#64748b', cursor: 'pointer', marginBottom: '16px', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={contractAccepted}
                    onChange={(e) => setContractAccepted(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <strong style={{ color: '#0f172a' }}>Ön Bilgilendirme Koşulları</strong>'nı ve <strong style={{ color: '#0f172a' }}>Mesafeli Satış Sözleşmesi</strong>'ni okudum, onaylıyorum.
                  </span>
                </label>

                {/* Siparişi Tamamla Butonu */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '52px',
                    backgroundColor: '#ff6000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: '0 6px 20px rgba(255, 96, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isSubmitting ? 'Siparişiniz Alınıyor...' : 'Siparişi Tamamla'}</span>
                  {!isSubmitting && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

