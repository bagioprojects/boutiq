/**
 * Gerçek Çerez Yönetimi ve İzin Altyapısı (KVKK & GDPR Uyumlu)
 * Cookie Consent Service - FK Butik
 */

export interface CookieConsent {
  necessary: boolean;      // Zorunlu (Sepet, Oturum, Güvenlik) - Her zaman true
  functional: boolean;     // İşlevsel (Tercihler, Arayüz Ayarları)
  analytics: boolean;      // Analitik & Performans (Site trafiği, ısı haritası)
  marketing: boolean;      // Pazarlama & Reklam (Yeniden hedefleme, reklamlar)
  timestamp: string;       // İzin verilme zamanı ISO
  version: string;         // Politika versiyonu
  status: 'accepted' | 'rejected' | 'custom';
}

const COOKIE_NAME = 'fk_cookie_consent';
const COOKIE_VERSION = '1.0';
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60; // 1 yıl (31536000 sn)

export class CookieConsentService {
  /**
   * Tarayıcı çerezinden veya LocalStorage'dan mevcut izin durumunu okur.
   */
  public static getConsent(): CookieConsent | null {
    if (typeof window === 'undefined') return null;

    try {
      // 1. Öncelik: Gerçek document.cookie kontrolü
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded) as CookieConsent;
        if (parsed && typeof parsed.necessary === 'boolean') {
          return parsed;
        }
      }

      // 2. Yedek: LocalStorage kontrolü
      const local = localStorage.getItem(COOKIE_NAME);
      if (local) {
        const parsed = JSON.parse(local) as CookieConsent;
        if (parsed && typeof parsed.necessary === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // JSON ayrıştırma hatası durumunda null döner
    }

    return null;
  }

  /**
   * Kullanıcının daha önce çerez tercihi yapıp yapmadığını döndürür.
   */
  public static hasAnswered(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Kullanıcının çerez tercihlerini gerçek tarayıcı çerezi (document.cookie) ve LocalStorage'a kaydeder.
   */
  public static saveConsent(
    preferences: {
      functional: boolean;
      analytics: boolean;
      marketing: boolean;
      status: 'accepted' | 'rejected' | 'custom';
    }
  ): CookieConsent {
    const payload: CookieConsent = {
      necessary: true, // Zorunlu çerezler her zaman aktiftir
      functional: preferences.functional,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      timestamp: new Date().toISOString(),
      version: COOKIE_VERSION,
      status: preferences.status,
    };

    if (typeof window !== 'undefined') {
      try {
        const jsonStr = JSON.stringify(payload);
        const encoded = encodeURIComponent(jsonStr);

        // Gerçek çerez kaydı (1 yıl süreli, Path=/ Lax)
        document.cookie = `${COOKIE_NAME}=${encoded}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;

        // LocalStorage senkronizasyonu
        localStorage.setItem(COOKIE_NAME, jsonStr);

        // Sistem genelinde dinleyenler için özel etkinlik yayını
        window.dispatchEvent(
          new CustomEvent('fk_cookie_consent_changed', { detail: payload })
        );
      } catch (err) {
        console.error('Çerez tercihi kaydedilirken hata oluştu:', err);
      }
    }

    return payload;
  }

  /**
   * Tüm çerezlere izin ver (Tümünü Kabul Et)
   */
  public static acceptAll(): CookieConsent {
    return this.saveConsent({
      functional: true,
      analytics: true,
      marketing: true,
      status: 'accepted',
    });
  }

  /**
   * Yalnızca zorunlu çerezleri kabul et, diğerlerini reddet (Tümünü Reddet)
   */
  public static rejectNonEssential(): CookieConsent {
    return this.saveConsent({
      functional: false,
      analytics: false,
      marketing: false,
      status: 'rejected',
    });
  }

  /**
   * Çerez Tercihleri Modalını açma tetikleyicisi (Footer'dan veya sayfa içinden)
   */
  public static openSettings(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fk_open_cookie_settings'));
    }
  }
}

