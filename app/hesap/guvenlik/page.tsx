'use client';

import React, { useState } from 'react';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrorMsg('Lütfen mevcut şifrenizi giriniz.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Yeni şifre ve şifre tekrarı birbiriyle eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Şifre değiştirilemedi.');
      }

      setSuccessMsg('Şifreniz başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AccountLayout
      title="Güvenlik & Şifre Değiştirme"
      subtitle="Hesap güvenliğinizi korumak için güçlü bir şifre belirleyin ve düzenli olarak güncelleyin."
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {successMsg && (
          <div
            style={{
              padding: '14px 16px',
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
              padding: '14px 16px',
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mevcut Şifre */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <Lock size={16} style={{ color: '#ff6000' }} />
              <span>Mevcut Şifreniz *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 42px 0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Yeni Şifre */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <KeyRound size={16} style={{ color: '#ff6000' }} />
              <span>Yeni Şifreniz *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 42px 0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '4px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: newPassword.length < 6 ? '33%' : newPassword.length < 10 ? '66%' : '100%',
                      backgroundColor: newPassword.length < 6 ? '#ef4444' : newPassword.length < 10 ? '#f59e0b' : '#10b981',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                  Şifre Gücü: {newPassword.length < 6 ? 'Zayıf (En az 6 karakter)' : newPassword.length < 10 ? 'Orta Düzey' : 'Güçlü'}
                </div>
              </div>
            )}
          </div>

          {/* Yeni Şifre Tekrarı */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <Lock size={16} style={{ color: '#ff6000' }} />
              <span>Yeni Şifre (Tekrar) *</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar giriniz"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 42px 0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Güvenlik Bilgilendirme Kartı */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Shield size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Hesap Güvenliği Tavsiyesi
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.5 }}>
                Şifrenizi kimseyle paylaşmayınız. FK Butik çalışanları sizden asla şifrenizi talep etmez. Oturumunuz 256-Bit SSL şifreleme ile güvendedir.
              </div>
            </div>
          </div>

          {/* Güncelle Butonu */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
            >
              <KeyRound size={16} />
              <span>{isSubmitting ? 'Güncelleniyor...' : 'Şifremi Güncelle'}</span>
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}

