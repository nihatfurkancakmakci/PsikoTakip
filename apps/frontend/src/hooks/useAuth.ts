'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { User, AuthTokens } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthTokens>('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.clear();
    setUser(null);
  }, []);

  const register = useCallback(async (payload: {
    email: string; password: string; firstName: string; lastName: string; role?: string;
  }) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }, []);

  return { user, loading, login, logout, register, isAuthenticated: !!user };
}
