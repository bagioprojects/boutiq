'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CookieConsentService, CookieConsent } from '@/src/core/cookies/cookie-consent.service';

export const CookieConsentBanner: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Kategori İzin Durumları
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Kullanıcı daha önce seçim yapmış mı kontrol et
    const existingConsent = CookieConsentService.getConsent();
    if (!existingConsent) {
      // Daha önce cevap verilmemişse banner'ı göster
      setIsVisible(true);
    } else {
      // Daha önce yapılmış tercihi state'e yükle
      setFunctional(existingConsent.functional);
      setAnalytics(existingConsent.analytics);
      setMarketing(existingConsent.marketing);
    }

    // 2. Footer veya başka yerden "Çerez Tercihleri" tetiklendiğinde modalı aç
    const handleOpenSettings = () => {
      const current = CookieConsentService.getConsent();
      if (current) {
        setFunctional(current.functional);
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setShowSettingsModal(true);
    };

    window.addEventListener('fk_open_cookie_settings', handleOpenSettings);
    return () => {
      window.removeEventListener('fk_open_cookie_settings', handleOpenSettings);
    };
  }, []);

  if (!mounted) {
    return null; // SSR hydration mismatch önlemi
  }

  // Tümünü Kabul Et
  const handleAcceptAll = () => {
    CookieConsentService.acceptAll();
    setIsVisible(false);
    setShowSettingsModal(false);
  };

  // Tümünü Reddet (Yalnızca Zorunlu Çerezler)
  const handleRejectAll = () => {
    CookieConsentService.rejectNonEssential();
    setIsVisible(false);
    setShowSettingsModal(false);
  };

  // Tercihleri Özelleştirip Kaydet
  const handleSavePreferences = () => {
    CookieConsentService.saveConsent({
      functional,
      analytics,
      marketing,
      status: 'custom',
    });
    setIsVisible(false);
    setShowSettingsModal(false);
  };

  return (
    <>
      {/* ========================================================
         1. ALT ÇEREZ BİLGİLENDİRME BARI (BANNER)
         ======================================================== */}
      {isVisible && !showSettingsModal && (
        <aside
          role="dialog"
          aria-label="Çerez İzin Paneli"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999999,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
            padding: '16px 20px',
            animation: 'fkSlideUp 0.3s ease-out',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Üst Bilgi Satırı */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  color: '#ff6000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                🍪
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  Çerez Politikası ve Gizlilik Tercihleriniz
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                  FK Butik olarak sizlere en iyi ve güvenli alışveriş deneyimini sunabilmek, site trafiğini analiz etmek ve ilgilendiğiniz moda ürünlerine uygun kişiselleştirilmiş içerikler sunabilmek amacıyla yasalara uygun çerezler (cookies) kullanıyoruz. Zorunlu çerezler sistemin güvenliği ve sepet işlemleri için her zaman aktiftir. Detaylı bilgi için{' '}
                  <Link
                    href="/sayfa/gizlilik-politikasi"
                    style={{ color: '#ff6000', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Gizlilik & Çerez Politikamızı
                  </Link>{' '}
                  inceleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* Alt Butonlar Satırı */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              {/* Tercihleri Özelleştir */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Tercihleri Özelleştir</span>
              </button>

              {/* Tümünü Reddet */}
              <button
                type="button"
                onClick={handleRejectAll}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                Tümünü Reddet
              </button>

              {/* Tümünü Kabul Et */}
              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 96, 0, 0.35)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ========================================================
         2. DETAYLI ÇEREZ AYARLARI MODALI (TERCİHLERİ YÖNET)
         ======================================================== */}
      {showSettingsModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000000,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fkFadeIn 0.2s ease-out',
          }}
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'fkScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                color: '#64748b',
                cursor: 'pointer',
              }}
              aria-label="Kapat"
            >
              ✕
            </button>

            {/* Modal Başlığı */}
            <div style={{ marginBottom: '18px', paddingRight: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Çerez Tercihlerini Yönet
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Web sitemizde kullanılan çerez kategorilerini aşağıdan inceleyebilir ve tercihlerinizi kişiselleştirebilirsiniz.
              </p>
            </div>

            {/* Çerez Kategorileri Listesi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {/* 1. Zorunlu Çerezler */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                      Zorunlu Çerezler
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      Her Zaman Aktif
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>Gerekli</div>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Alışveriş sepeti, kullanıcı oturumu ve sistem güvenliği gibi temel web sitesi fonksiyonlarının çalışması için zorunludur. Bu çerezler kapatılamaz.
                </p>
              </div>

              {/* 2. İşlevsel Çerezler */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    İşlevsel Çerezler
                  </span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: functional ? '#ff6000' : '#cbd5e1',
                        borderRadius: '24px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: functional ? '20px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Dil, beden seçimleri, filtre tercihleri ve arayüz özelleştirmelerinizi hatırlayarak her ziyaretinizde daha hızlı alışveriş yapmanızı sağlar.
                </p>
              </div>

              {/* 3. Analitik & Performans Çerezleri */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    Analitik ve Performans Çerezleri
                  </span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: analytics ? '#ff6000' : '#cbd5e1',
                        borderRadius: '24px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: analytics ? '20px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Sitemizin ziyaret trafiğini, en çok görüntülenen koleksiyonları ve sayfa hızlarını anonim olarak ölçümleyerek web sitemizi geliştirmemizi sağlar.
                </p>
              </div>

              {/* 4. Pazarlama & Kişiselleştirme Çerezleri */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                    Pazarlama ve Hedefleme Çerezleri
                  </span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: marketing ? '#ff6000' : '#cbd5e1',
                        borderRadius: '24px',
                        transition: '0.2s',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px',
                          width: '18px',
                          left: marketing ? '20px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          transition: '0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  İlginizi çekebilecek giyim ürünleri, indirim kuponları ve özel moda kampanyalarını size özel olarak sunmak amacıyla iş ortaklarımızla birlikte kullanılır.
                </p>
              </div>
            </div>

            {/* Modal Butonları */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRejectAll}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Tümünü Reddet
              </button>

              <button
                type="button"
                onClick={handleSavePreferences}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #0f172a',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Seçimleri Kaydet
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 96, 0, 0.35)',
                }}
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

