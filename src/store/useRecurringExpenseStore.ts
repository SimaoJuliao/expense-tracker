import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RecurringExpense, NewRecurringExpense } from '../types';

interface RecurringExpenseState {
  recurring: RecurringExpense[];
  loading: boolean;
  error: string | null;
  fetchRecurring: () => Promise<void>;
  addRecurring: (data: NewRecurringExpense) => Promise<void>;
  updateRecurring: (id: string, data: Partial<NewRecurringExpense>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  toggleActive: (id: string, active: boolean) => Promise<void>;
  clearError: () => void;
}

export const useRecurringExpenseStore = create<RecurringExpenseState>()((set, get) => ({
  recurring: [],
  loading: false,
  error: null,

  fetchRecurring: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*, category:categories(*)')
      .order('day_of_month', { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ recurring: data ?? [], loading: false });
  },

  addRecurring: async (data) => {
    set({ loading: true, error: null });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      set({ error: 'Not authenticated', loading: false });
      return;
    }
    const { error } = await supabase
      .from('recurring_expenses')
      .insert({ ...data, user_id: userData.user.id });
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchRecurring();
  },

  updateRecurring: async (id, data) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from('recurring_expenses')
      .update(data)
      .eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    await get().fetchRecurring();
  },

  deleteRecurring: async (id) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);
    if (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
    set((state) => ({
      recurring: state.recurring.filter((r) => r.id !== id),
      loading: false,
    }));
  },

  toggleActive: async (id, active) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .update({ active })
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      recurring: state.recurring.map((r) => (r.id === id ? { ...r, active } : r)),
    }));
  },

  clearError: () => set({ error: null }),
}));
