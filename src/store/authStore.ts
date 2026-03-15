import { create } from 'zustand';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const stored = localStorage.getItem('auth');

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,

  login: (user) => {
    localStorage.setItem('auth', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('auth');
    set({ user: null });
  },
}));
