'use client';

import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('litmus_token', token);
      localStorage.setItem('litmus_user', JSON.stringify(user));
    }
    set({ accessToken: token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('litmus_token');
      localStorage.removeItem('litmus_user');
    }
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('litmus_token');
      const userStr = localStorage.getItem('litmus_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ accessToken: token, user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('litmus_token');
          localStorage.removeItem('litmus_user');
        }
      }
    }
  },
}));
