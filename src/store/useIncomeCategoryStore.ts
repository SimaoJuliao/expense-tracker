import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { IncomeCategory, NewIncomeCategory } from '../types';

let seedingPromise: Promise<void> | null = null;

const DEFAULT_INCOME_CATEGORIES: Omit<NewIncomeCategory, never>[] = [
  { name: 'Salary',      icon: '💼', color: '#10b981' },
  { name: 'Freelance',   icon: '💻', color: '#3b82f6' },
  { name: 'Investments', icon: '📈', color: '#f59e0b' },
  { name: 'Rental',      icon: '🏠', color: '#8b5cf6' },
  { name: 'Gifts',       icon: '🎁', color: '#ec4899' },
  { name: 'Other',       icon: '📦', color: '#6b7280' },
];

interface IncomeCategoryState {
  incomeCategories: IncomeCategory[];
  loading: boolean;
  error: string | null;
  fetchIncomeCategories: () => Promise<void>;
  seedDefaultIncomeCategories: () => Promise<void>;
  addIncomeCategory: (cat: NewIncomeCategory) => Promise<void>;
  updateIncomeCategory: (id: string, updates: Partial<NewIncomeCategory>) => Promise<void>;
  deleteIncomeCategory: (id: string) => Promise<void>;
  getIncomeCountForCategory: (id: string) => Promise<number>;
  clearError: () => void;
}

export const useIncomeCategoryStore = create<IncomeCategoryState>((set, get) => ({
  incomeCategories: [],
  loading: false,
  error: null,

  fetchIncomeCategories: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('income_categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ incomeCategories: data ?? [], loading: false });
  },

  seedDefaultIncomeCategories: async () => {
    if (seedingPromise) return seedingPromise;
    seedingPromise = (async () => {
      const { data: existing } = await supabase.from('income_categories').select('id').limit(1);
      if (existing && existing.length > 0) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const rows = DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, user_id: userData.user!.id }));
      await supabase.from('income_categories').insert(rows);
      await get().fetchIncomeCategories();
    })();
    return seedingPromise;
  },

  addIncomeCategory: async (cat) => {
    set({ loading: true, error: null });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ error: 'Not authenticated', loading: false });
      return;
    }
    const { error } = await supabase
      .from('income_categories')
      .insert({ ...cat, user_id: userData.user.id });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchIncomeCategories();
  },

  updateIncomeCategory: async (id, updates) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('income_categories').update(updates).eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchIncomeCategories();
  },

  deleteIncomeCategory: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase.from('income_categories').delete().eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set((state) => ({
      incomeCategories: state.incomeCategories.filter((c) => c.id !== id),
      loading: false,
    }));
  },

  getIncomeCountForCategory: async (id) => {
    const { count } = await supabase
      .from('incomes')
      .select('id', { count: 'exact', head: true })
      .eq('income_category_id', id);
    return count ?? 0;
  },

  clearError: () => set({ error: null }),
}));
