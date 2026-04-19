import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Category, NewCategory } from '../types';

let seedingPromise: Promise<void> | null = null;

const DEFAULT_CATEGORIES: Omit<NewCategory, never>[] = [
  { name: 'Food & Drinks', icon: '🍔', color: '#f97316' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Housing', icon: '🏠', color: '#8b5cf6' },
  { name: 'Health', icon: '💊', color: '#10b981' },
  { name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Utilities', icon: '⚡', color: '#6366f1' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
];

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
  addCategory: (cat: NewCategory) => Promise<void>;
  updateCategory: (id: string, updates: Partial<NewCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getExpenseCountForCategory: (id: string) => Promise<number>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ categories: data ?? [], loading: false });
  },

  seedDefaultCategories: async () => {
    if (seedingPromise) return seedingPromise;
    seedingPromise = (async () => {
      const { data: existing } = await supabase.from('categories').select('id').limit(1);
      if (existing && existing.length > 0) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userData.user!.id }));
      await supabase.from('categories').insert(rows);
      await get().fetchCategories();
    })();
    return seedingPromise;
  },

  addCategory: async (cat) => {
    set({ loading: true, error: null });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ error: 'Not authenticated', loading: false });
      return;
    }
    const { error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: userData.user.id });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchCategories();
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchCategories();
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id), loading: false }));
  },

  getExpenseCountForCategory: async (id) => {
    const { count } = await supabase
      .from('expenses')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);
    return count ?? 0;
  },

  clearError: () => set({ error: null }),
}));
