'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeUser } from '@/src/models/entities/user.entity';

const AUTH_STORAGE_KEY = 'fk_auth_user';

export function getStoredUser(): SafeUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check localStorage first
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // 2. Fallback to cookie 'fk_user'
    const cookieMatch = document.cookie.match(/(?:^|;\s*)fk_user=([^;]*)/);
    if (cookieMatch && cookieMatch[1]) {
      const decoded = decodeURIComponent(cookieMatch[1]);
      const user = JSON.parse(decoded);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.error('Failed to parse stored user:', err);
  }

  return null;
}

export function saveStoredUser(user: SafeUser | null) {
  if (typeof window === 'undefined') return;

  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.dispatchEvent(new Event('fk_auth_changed'));
}

export function useAuth() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // Initial sync from local storage / cookie
    const local = getStoredUser();
    if (local) {
      setUser(local);
    }

    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          saveStoredUser(data.user);
        } else {
          setUser(null);
          saveStoredUser(null);
        }
      }
    } catch (err) {
      // offline or network issue, maintain local state if any
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('fk_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('fk_auth_changed', handleAuthChange);
    };
  }, [refreshUser]);

  const parseJsonResponse = async (res: Response, fallbackError: string) => {
    const rawText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      if (res.status >= 500) {
        throw new Error('Sunucu şu anda meşgul veya geçici bir kesinti yaşanıyor. Lütfen az sonra tekrar deneyiniz.');
      }
      throw new Error(rawText && rawText.length < 120 ? rawText : fallbackError);
    }
    return data;
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await parseJsonResponse(res, 'Giriş yapılamadı.');
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Giriş yapılamadı.');
      }
      setUser(data.user);
      saveStoredUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await parseJsonResponse(res, 'Kayıt oluşturulamadı.');
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Kayıt oluşturulamadı.');
      }
      setUser(data.user);
      saveStoredUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async (email?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await parseJsonResponse(res, 'Google ile giriş yapılamadı.');
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google ile giriş yapılamadı.');
      }
      setUser(data.user);
      saveStoredUser(data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      saveStoredUser(null);
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    googleAuth,
    logout,
    refreshUser,
  };
}

