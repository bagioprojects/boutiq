'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/src/views-components/organisms/Header';
import { Footer } from '@/src/views-components/organisms/Footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Lütfen kayıtlı e-posta adresinizi veya telefon numaranızı giriniz.');
      return;
    }

    setIsLoading(true);
    // Simulate instant secure SMS / Email code dispatch
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setVerificationCode('123456');
    }, 600);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('Şifreler birbiriyle eşleşmiyor. Lütfen kontrol ediniz.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), newPassword: newPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Şifre güncellenemedi.');
      }

      setSuccess('Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/hesap/giris');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            padding: '36px 32px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                backgroundColor: 'rgba(255, 96, 0, 0.1)',
                color: '#ff6000',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
              Şifremi Unuttum
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              {step === 1
                ? 'Hesabınıza kayıtlı e-posta adresinizi veya telefon numaranızı girerek şifrenizi kolayca yenileyebilirsiniz.'
                : 'Lütfen yeni şifrenizi belirleyiniz.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label
                  htmlFor="identifier"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                >
                  E-Posta veya Telefon Numarası
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ornek@fkbutik.com veya 5XX XXX XX XX"
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {isLoading ? 'Kontrol Ediliyor...' : 'Devam Et →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label
                  htmlFor="verificationCode"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                >
                  Doğrulama Kodu (SMS / E-posta)
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '15px',
                    letterSpacing: '2px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                >
                  Yeni Şifre (En az 6 karakter)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 44px 0 14px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
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
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? 'Gizle' : 'Göster'}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPasswordConfirm"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}
                >
                  Yeni Şifre Tekrar
                </label>
                <input
                  id="newPasswordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#ff6000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {isLoading ? 'Kaydediliyor...' : 'Şifremi Sıfırla ve Kaydet'}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href="/hesap/giris"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#ff6000',
                textDecoration: 'none',
              }}
            >
              ← Giriş Yap Ekranına Dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

