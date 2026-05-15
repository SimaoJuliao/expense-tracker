import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import * as authService from '../services/authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true });
    const session = await authService.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    authService.onAuthStateChange((newSession) => {
      set({ session: newSession, user: newSession?.user ?? null });
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authService.signIn(email, password);
      set({ loading: false });
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await authService.signUp(email, password);
      if (session) {
        set({ session, user: session.user, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    await authService.signOut();
    set({ user: null, session: null, loading: false });
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await authService.resetPassword(email, `${window.location.origin}/login`);
      set({ loading: false });
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
