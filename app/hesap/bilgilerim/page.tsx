'use client';

import React, { useState, useEffect } from 'react';
import { AccountLayout } from '@/src/views-components/account/AccountLayout';
import { useAuth } from '@/src/core/auth/auth-store';
import { User, Mail, Phone, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function AccountProfileInfoPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Telefon Numarası Formatlama: 5XX XXX XX XX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('90')) raw = raw.slice(2);
    if (raw.startsWith('0')) raw = raw.slice(1);
    raw = raw.slice(0, 10);

    let formatted = '';
    if (raw.length > 0) {
      formatted += raw.substring(0, 3);
      if (raw.length > 3) {
        formatted += ' ' + raw.substring(3, 6);
      }
      if (raw.length > 6) {
        formatted += ' ' + raw.substring(6, 8);
      }
      if (raw.length > 8) {
        formatted += ' ' + raw.substring(8, 10);
      }
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Lütfen ad ve soyadınızı eksiksiz giriniz.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMsg('Lütfen geçerli bir 10 haneli cep telefonu numarası giriniz (5XX XXX XX XX).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone: `0${cleanDigits.slice(-10)}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Bilgiler güncellenemedi.');
      }

      setSuccessMsg('Üyelik bilgileriniz başarıyla güncellendi.');
      if (refreshUser) refreshUser();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AccountLayout
      title="Üyelik Bilgilerim"
      subtitle="Kişisel iletişim bilgilerinizi güncel tutarak sipariş teslimat süreçlerini kolaylaştırın."
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
          {/* Ad Soyad */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <User size={16} style={{ color: '#ff6000' }} />
              <span>Ad ve Soyad *</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* E-posta Adresi (Salt Okunur) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} style={{ color: '#ff6000' }} />
                <span>E-posta Adresi</span>
              </div>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={13} /> Doğrulanmış Hesap
              </span>
            </label>
            <input
              type="email"
              disabled
              value={email}
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'not-allowed',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Güvenlik sebebiyle e-posta adresi müşteri hizmetleri onayıyla değiştirilebilir.
            </span>
          </div>

          {/* Telefon Numarası */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              <Phone size={16} style={{ color: '#ff6000' }} />
              <span>Cep Telefonu Numarası *</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                style={{
                  height: '46px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  border: '1.5px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#334155',
                  flexShrink: 0,
                }}
              >
                <span>🇹🇷</span>
                <span>+90</span>
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="5XX XXX XX XX"
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              />
            </div>
            <span style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
              Siparişinizin kargo teslimat SMS bildirimleri bu numaraya iletilir.
            </span>
          </div>

          {/* Üyelik Bilgi Kutusu */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <Calendar size={20} style={{ color: '#64748b', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Üyelik Durumu: <strong style={{ color: '#0f172a' }}>Aktif Standart Üye</strong>
              </div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                Kişisel verileriniz 6698 sayılı KVKK kapsamında güvenle korunmaktadır.
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
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
                backgroundColor: '#ff6000',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 96, 0, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e65600')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6000')}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}
