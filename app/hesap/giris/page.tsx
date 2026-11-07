'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/src/views-components/organisms/Header';
import { Footer } from '@/src/views-components/organisms/Footer';
import { useAuth } from '@/src/core/auth/auth-store';

interface TrendyolAuthPageProps {
  initialTab?: 'login' | 'register';
}

const COUNTRY_CODES = [
  { code: '+90', flag: '🇹🇷', name: 'Türkiye', placeholder: '5__ ___ __ __' },
  { code: '+49', flag: '🇩🇪', name: 'Almanya', placeholder: '1__ ___ ____' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaycan', placeholder: '5_ ___ __ __' },
  { code: '+44', flag: '🇬🇧', name: 'İngiltere', placeholder: '7___ ______' },
  { code: '+31', flag: '🇳🇱', name: 'Hollanda', placeholder: '6_ ___ ____' },
  { code: '+33', flag: '🇫🇷', name: 'Fransa', placeholder: '6__ ___ ___' },
  { code: '+1', flag: '🇺🇸', name: 'ABD / Kanada', placeholder: '___ ___ ____' },
];

function formatPhoneInput(val: string, countryCode: string = '+90'): string {
  let digits = val.replace(/\D/g, '');

  if (countryCode === '+90') {
    // 0 ile başlarsa sil (örn. 0532 -> 532)
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    // 90 ile başlarsa sil (örn. yapıştırılan +90532 -> 532)
    if (digits.startsWith('90') && digits.length > 10) {
      digits = digits.substring(2);
    }
    digits = digits.slice(0, 10);

    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
  }

  digits = digits.slice(0, 12);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

function TrendyolAuthContent({ initialTab = 'login' }: TrendyolAuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const redirectParam = searchParams.get('redirect') || '/hesap';

  const { user, isAuthenticated, login, register, googleAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    tabParam === 'register' || initialTab === 'register' ? 'register' : 'login'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);
  const [gender, setGender] = useState<'kadin' | 'erkek' | ''>('kadin');
  const [consentAydinlatma, setConsentAydinlatma] = useState(true);
  const [consentPazarlama, setConsentPazarlama] = useState(true);

  const [authSuccess, setAuthSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPhoneQuickModal, setShowPhoneQuickModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (tabParam === 'register') {
      setActiveTab('register');
    } else if (tabParam === 'login') {
      setActiveTab('login');
    }
  }, [tabParam]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthSuccess('');

    if (!identifier.trim()) {
      setErrorMessage('Lütfen e-posta adresinizi veya telefonunuzu giriniz.');
      return;
    }
    if (!password) {
      setErrorMessage('Lütfen şifrenizi giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      setAuthSuccess(`Giriş başarılı! Hoş geldiniz, ${res.user?.full_name || identifier}.`);
      setTimeout(() => {
        router.push(redirectParam);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthSuccess('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Lütfen ad ve soyadınızı giriniz.');
      return;
    }
    if (!identifier.trim() || !identifier.includes('@')) {
      setErrorMessage('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    // Telefon Numarası Doğrulama (Zorunlu ve formatlı)
    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!cleanPhoneDigits) {
      setErrorMessage('Lütfen cep telefonu numaranızı giriniz.');
      return;
    }
    if (selectedCountry.code === '+90') {
      if (cleanPhoneDigits.length !== 10 || !cleanPhoneDigits.startsWith('5')) {
        setErrorMessage('Lütfen 5 ile başlayan 10 haneli geçerli bir cep telefonu numarası giriniz (5XX XXX XX XX).');
        return;
      }
    } else if (cleanPhoneDigits.length < 8) {
      setErrorMessage('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (!consentAydinlatma) {
      setErrorMessage('Devam etmek için Aydınlatma Metni ve sözleşmeyi kabul etmelisiniz.');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.code}${cleanPhoneDigits}`;

    setIsSubmitting(true);
    try {
      const res = await register({
        full_name: fullName.trim(),
        email: identifier.trim(),
        password,
        phone: fullPhoneNumber,
      });
      setAuthSuccess(`Tebrikler ${res.user?.full_name || fullName}! Üyeliğiniz oluşturuldu.`);
      setTimeout(() => {
        router.push(redirectParam);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Üyelik oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phoneNumber.trim()) {
      setErrorMessage('Lütfen telefon numaranızı giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = phoneNumber.trim();
      const mockEmail = `user_${cleanPhone.replace(/[^0-9]/g, '')}@fkbutik.local`;
      const res = await googleAuth(mockEmail, `Müşteri (${cleanPhone})`);
      setShowPhoneQuickModal(false);
      setAuthSuccess(`Telefonla giriş doğrulandı! Hoş geldiniz.`);
      setTimeout(() => {
        router.push(redirectParam);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Hızlı giriş gerçekleştirilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async (action: 'login' | 'register') => {
    setErrorMessage('');
    setAuthSuccess('');
    setIsSubmitting(true);
    try {
      const res = await googleAuth();
      setAuthSuccess(
        action === 'login'
          ? `Google hesabınızla güvenle giriş yapıldı. Hoş geldiniz, ${res.user?.full_name}!`
          : `Google hesabınızla üyeliğiniz oluşturuldu ve giriş yapıldı!`
      );
      setTimeout(() => {
        router.push(redirectParam);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google oturumu açılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 16px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
          {/* TAB BAŞLIKLARI (Giriş yap | Ücretsiz Üye ol) */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e6e6e6',
              marginBottom: '24px',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
                setAuthSuccess('');
              }}
              style={{
                flex: 1,
                padding: '14px 0',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: activeTab === 'login' ? 700 : 500,
                color: activeTab === 'login' ? '#ff6000' : '#4b5563',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                transition: 'color 0.2s ease',
              }}
            >
              Giriş yap
              {activeTab === 'login' && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: '#ff6000',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
                setAuthSuccess('');
              }}
              style={{
                flex: 1,
                padding: '14px 0',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                fontWeight: activeTab === 'register' ? 700 : 500,
                color: activeTab === 'register' ? '#ff6000' : '#4b5563',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                transition: 'color 0.2s ease',
              }}
            >
              Ücretsiz Üye ol
              {activeTab === 'register' && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '2.5px',
                    backgroundColor: '#ff6000',
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              )}
            </button>
          </div>

          {/* HATA BİLDİRİMİ */}
          {errorMessage && (
            <div
              style={{
                padding: '14px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13.5px',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                lineHeight: 1.4,
              }}
            >
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', padding: '0 0 0 8px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* BAŞARILI BİLDİRİMİ */}
          {authSuccess ? (
            <div
              style={{
                padding: '24px 20px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
                {authSuccess}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
                Oturumunuz başarıyla açıldı. Yönlendiriliyorsunuz...
              </p>
              <Link
                href="/hesap"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Hesabıma Git
              </Link>
            </div>
          ) : activeTab === 'login' ? (
            /* ========================================================
               1. GİRİŞ YAP FORMU
               ======================================================== */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <input
                  type="text"
                  required
                  placeholder="E-posta veya telefon (5xxxxxxxxx)"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#ff6000';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
              </div>

              {/* Şifre Alanı + Göz İkonu */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0 44px 0 16px',
                    fontSize: '14px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#ff6000';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Şifremi Unuttum & Telefonla Giriş */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-2px' }}>
                <Link
                  href="/hesap/sifremi-unuttum"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ff6000',
                    textDecoration: 'none',
                  }}
                >
                  Şifremi unuttum
                </Link>

                <button
                  type="button"
                  onClick={() => setShowPhoneQuickModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Telefonla Giriş
                </button>
              </div>

              {/* Turuncu Giriş Yap Butonu */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: isSubmitting ? '#fb923c' : '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 2px 8px rgba(255, 96, 0, 0.28)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş yap'}
              </button>

              {/* Google ile Giriş Yap Butonu */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('login')}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google ile Giriş Yap</span>
              </button>

              <p
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  lineHeight: 1.5,
                  textAlign: 'center',
                  margin: '12px 0 0 0',
                }}
              >
                Kişisel verileriniz, Aydınlatma Metni kapsamında işlenmektedir. &quot;Giriş yap&quot; butonuna basarak Üyelik Sözleşmesi&apos;ni kabul etmiş sayılırsınız.
              </p>
            </form>
          ) : (
            /* ========================================================
               2. ÜCRETSİZ ÜYE OL FORMU
               ======================================================== */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="E-posta Adresi"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0 16px',
                    fontSize: '14px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Harika Telefon Numarası Alanı (+90 Bayrak Prefix + 5XX XXX XX XX Maskesi) */}
              <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '48px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: isPhoneFocused ? '1.5px solid #ff6000' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isPhoneFocused ? '0 0 0 2px rgba(255, 96, 0, 0.15)' : 'none',
                  }}
                >
                  {/* Sol Prefix Butonu: Türkiye Bayrağı 🇹🇷 +90 */}
                  <button
                    type="button"
                    onClick={() => setShowCountryMenu(!showCountryMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      height: '100%',
                      padding: '0 12px',
                      border: 'none',
                      borderRight: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      cursor: 'pointer',
                      borderRadius: '5px 0 0 5px',
                      flexShrink: 0,
                      outline: 'none',
                    }}
                    title="Ülke Kodu Seç"
                  >
                    <span style={{ fontSize: '18px', lineHeight: 1 }}>{selectedCountry.flag}</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1f2937' }}>
                      {selectedCountry.code}
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: showCountryMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Numara Yazma Textboxı: 5__ ___ __ __ formatında */}
                  <input
                    type="tel"
                    required
                    placeholder={selectedCountry.placeholder}
                    value={phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value, selectedCountry.code);
                      setPhone(formatted);
                    }}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    style={{
                      flex: 1,
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'transparent',
                      padding: '0 14px',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: '#0f172a',
                      letterSpacing: selectedCountry.code === '+90' ? '0.04em' : 'normal',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Açılır Ülke Kodu Menüsü */}
                {showCountryMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '52px',
                      left: 0,
                      width: '260px',
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e2e8f0',
                      zIndex: 50,
                      maxHeight: '240px',
                      overflowY: 'auto',
                      padding: '6px 0',
                    }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryMenu(false);
                          setPhone('');
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          border: 'none',
                          backgroundColor: selectedCountry.code === c.code ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseOver={(e) => {
                          if (selectedCountry.code !== c.code) e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseOut={(e) => {
                          if (selectedCountry.code !== c.code) e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{c.flag}</span>
                          <span style={{ color: '#1f2937', fontWeight: 600 }}>{c.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#ff6000', fontSize: '12.5px' }}>
                          {c.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Şifre (En az 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0 44px 0 16px',
                    fontSize: '14px',
                    color: '#1f2937',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Cinsiyet Seçimi */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setGender('kadin')}
                  style={{
                    flex: 1,
                    height: '42px',
                    border: gender === 'kadin' ? '1.5px solid #ff6000' : '1px solid #d1d5db',
                    backgroundColor: gender === 'kadin' ? '#fff7ed' : '#ffffff',
                    color: gender === 'kadin' ? '#ff6000' : '#4b5563',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Kadın
                </button>
                <button
                  type="button"
                  onClick={() => setGender('erkek')}
                  style={{
                    flex: 1,
                    height: '42px',
                    border: gender === 'erkek' ? '1.5px solid #ff6000' : '1px solid #d1d5db',
                    backgroundColor: gender === 'erkek' ? '#fff7ed' : '#ffffff',
                    color: gender === 'erkek' ? '#ff6000' : '#4b5563',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Erkek
                </button>
              </div>

              {/* Onay Kutuları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#4b5563', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentAydinlatma}
                    onChange={(e) => setConsentAydinlatma(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#ff6000' }}
                  />
                  <span>
                    Aydınlatma Metni&apos;ni okudum, kişisel verilerimin işlenmesini kabul ediyorum.
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11.5px', color: '#4b5563', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentPazarlama}
                    onChange={(e) => setConsentPazarlama(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#ff6000' }}
                  />
                  <span>
                    Özel indirim ve yeni sezon koleksiyonlarından haberdar olmak istiyorum.
                  </span>
                </label>
              </div>

              {/* Turuncu Üye Ol Butonu */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: isSubmitting ? '#fb923c' : '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 2px 8px rgba(255, 96, 0, 0.28)',
                }}
              >
                {isSubmitting ? 'Hesap Oluşturuluyor...' : 'Ücretsiz Üye ol'}
              </button>

              {/* Google ile Kayıt Ol Butonu */}
              <button
                type="button"
                onClick={() => handleGoogleAuth('register')}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '46px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google ile Kayıt Ol</span>
              </button>
            </form>
          )}
        </div>
      </main>

      {/* TELEFONLA HIZLI GİRİŞ MODALI */}
      {showPhoneQuickModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowPhoneQuickModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Telefonla Hızlı Giriş
              </h3>
              <button
                type="button"
                onClick={() => setShowPhoneQuickModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Telefon numaranıza SMS onay kodu gönderilerek hesabınıza anında giriş sağlanır.
            </p>
            <form onSubmit={handlePhoneQuickSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '46px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 10px', backgroundColor: '#e5e7eb', height: '100%', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                  <span>🇹🇷</span>
                  <span>+90</span>
                </div>
                <input
                  type="tel"
                  required
                  placeholder="5__ ___ __ __"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(formatPhoneInput(e.target.value, '+90'))}
                  style={{
                    flex: 1,
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0 12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  height: '46px',
                  backgroundColor: isSubmitting ? '#fb923c' : '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '6px',
                }}
              >
                {isSubmitting ? 'Giriş Yapılıyor...' : 'SMS İle Hızlı Giriş'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function TrendyolAuthPage(props: TrendyolAuthPageProps) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#64748b', fontSize: '15px' }}>Yükleniyor...</div>
        </div>
        <Footer />
      </div>
    }>
      <TrendyolAuthContent {...props} />
    </Suspense>
  );
}
