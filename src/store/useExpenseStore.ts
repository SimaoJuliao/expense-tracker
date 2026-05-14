import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import type { Expense, ExpenseFilters, NewExpense } from '../types';
import { getCurrentMonthYear, getDaysInMonth } from '../utils';

interface ExpenseState {
  expenses: Expense[];
  filters: ExpenseFilters;
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: NewExpense) => Promise<void>;
  bulkAddExpenses: (expenses: (NewExpense & { user_id: string })[]) => Promise<void>;
  updateExpense: (id: string, updates: Partial<NewExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
}

const { month, year } = getCurrentMonthYear();

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      filters: {
        month,
        year,
        categoryId: null,
        search: '',
      },
      loading: false,
      error: null,

      fetchExpenses: async () => {
        set({ loading: true, error: null });
        const { filters } = get();
        const startDate = filters.month === 0
          ? `${filters.year}-01-01`
          : `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
        const endDate = filters.month === 0
          ? `${filters.year}-12-31`
          : `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(getDaysInMonth(filters.year, filters.month)).padStart(2, '0')}`;

        let query = supabase
          .from('expenses')
          .select('*, category:categories(*)')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (filters.categoryId) {
          query = query.eq('category_id', filters.categoryId);
        }

        const { data, error } = await query;
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }
        set({ expenses: data ?? [], loading: false });
      },

      addExpense: async (expense) => {
        set({ loading: true, error: null });
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ error: 'Not authenticated', loading: false });
          return;
        }
        const { data, error } = await supabase
          .from('expenses')
          .insert({ ...expense, user_id: user.id })
          .select('*, category:categories(*)')
          .single();
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({
          expenses: [data as Expense, ...state.expenses]
            .sort((a, b) => b.date.localeCompare(a.date)),
          filters: { ...state.filters, categoryId: null, search: '' },
          loading: false,
        }));
      },

      bulkAddExpenses: async (expenses) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from('expenses')
          .insert(expenses)
          .select('*, category:categories(*)');
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({
          expenses: [...state.expenses, ...(data as Expense[])]
            .sort((a, b) => b.date.localeCompare(a.date)),
          loading: false,
        }));
      },

      updateExpense: async (id, updates) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase
          .from('expenses')
          .update(updates)
          .eq('id', id)
          .select('*, category:categories(*)')
          .single();
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({
          expenses: state.expenses
            .map((e) => e.id === id ? data as Expense : e)
            .sort((a, b) => b.date.localeCompare(a.date)),
          filters: { ...state.filters, categoryId: null, search: '' },
          loading: false,
        }));
      },

      deleteExpense: async (id) => {
        set({ loading: true, error: null });
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
          loading: false,
        }));
      },

      setFilters: (newFilters) => {
        set((state) => ({ filters: { ...state.filters, ...newFilters } }));
      },

      resetFilters: () => {
        const { month: m, year: y } = getCurrentMonthYear();
        set({ filters: { month: m, year: y, categoryId: null, search: '' } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'expense-filters',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
