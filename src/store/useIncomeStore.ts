import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Income, IncomeFilters, NewIncome } from '../types';
import { getCurrentMonthYear, getDaysInMonth } from '../utils';

interface IncomeState {
  incomes: Income[];
  filters: IncomeFilters;
  loading: boolean;
  error: string | null;
  fetchIncomes: () => Promise<void>;
  addIncome: (income: NewIncome) => Promise<void>;
  updateIncome: (id: string, updates: Partial<NewIncome>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  setFilters: (filters: Partial<IncomeFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
}

const { month, year } = getCurrentMonthYear();

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set, get) => ({
      incomes: [],
      filters: {
        month,
        year,
        categoryId: null,
        search: '',
      },
      loading: false,
      error: null,

      fetchIncomes: async () => {
        set({ loading: true, error: null });
        const { filters } = get();
        const startDate = filters.month === 0
          ? `${filters.year}-01-01`
          : `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
        const endDate = filters.month === 0
          ? `${filters.year}-12-31`
          : `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(getDaysInMonth(filters.year, filters.month)).padStart(2, '0')}`;

        let query = supabase
          .from('incomes')
          .select('*, income_category:income_categories(*)')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (filters.categoryId) {
          query = query.eq('income_category_id', filters.categoryId);
        }

        const { data, error } = await query;
        if (error) {
          set({ error: error.message, loading: false });
          return;
        }
        set({ incomes: data ?? [], loading: false });
      },

      addIncome: async (income) => {
        set({ loading: true, error: null });
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          set({ error: 'Not authenticated', loading: false });
          return;
        }
        const { error } = await supabase
          .from('incomes')
          .insert({ ...income, user_id: userData.user.id });
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({ filters: { ...state.filters, categoryId: null, search: '' } }));
        await get().fetchIncomes();
      },

      updateIncome: async (id, updates) => {
        set({ loading: true, error: null });
        const { error } = await supabase.from('incomes').update(updates).eq('id', id);
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({ filters: { ...state.filters, categoryId: null, search: '' } }));
        await get().fetchIncomes();
      },

      deleteIncome: async (id) => {
        set({ loading: true, error: null });
        const { error } = await supabase.from('incomes').delete().eq('id', id);
        if (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
        set((state) => ({
          incomes: state.incomes.filter((e) => e.id !== id),
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
      name: 'income-filters',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
