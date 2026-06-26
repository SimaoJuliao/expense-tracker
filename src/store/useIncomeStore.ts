import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as incomeService from '../services/incomeService';
import { useAuthStore } from './useAuthStore';
import type { Income, IncomeFilters, NewIncome } from '../types';
import { getCurrentMonthYear } from '../utils';

interface IncomeState {
  incomes: Income[];
  filters: IncomeFilters;
  loading: boolean;
  error: string | null;
  fetchIncomes: () => Promise<void>;
  addIncome: (income: NewIncome) => Promise<void>;
  bulkAddIncomes: (incomes: (NewIncome & { user_id: string })[]) => Promise<void>;
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
      filters: { month, year, excludedCategoryIds: [], search: '' },
      loading: false,
      error: null,

      fetchIncomes: async () => {
        set({ loading: true, error: null });
        try {
          const data = await incomeService.fetchIncomes(get().filters);
          set({ incomes: data, loading: false });
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
        }
      },

      addIncome: async (income) => {
        set({ loading: true, error: null });
        const user = useAuthStore.getState().user;
        if (!user) { set({ error: 'Not authenticated', loading: false }); return; }
        try {
          const data = await incomeService.insertIncome({ ...income, user_id: user.id });
          set((state) => ({
            incomes: [data, ...state.incomes].sort((a, b) => b.date.localeCompare(a.date)),
            filters: {
              ...state.filters,
              search: '',
              excludedCategoryIds: state.filters.excludedCategoryIds.filter((id) => id !== data.income_category_id),
            },
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      bulkAddIncomes: async (incomes) => {
        set({ loading: true, error: null });
        try {
          const data = await incomeService.bulkInsertIncomes(incomes);
          set((state) => ({
            incomes: [...state.incomes, ...data].sort((a, b) => b.date.localeCompare(a.date)),
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      updateIncome: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const data = await incomeService.updateIncome(id, updates);
          set((state) => ({
            incomes: state.incomes
              .map((i) => i.id === id ? data : i)
              .sort((a, b) => b.date.localeCompare(a.date)),
            filters: {
              ...state.filters,
              search: '',
              excludedCategoryIds: state.filters.excludedCategoryIds.filter((id) => id !== data.income_category_id),
            },
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      deleteIncome: async (id) => {
        set({ loading: true, error: null });
        try {
          await incomeService.deleteIncome(id);
          set((state) => ({ incomes: state.incomes.filter((i) => i.id !== id), loading: false }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

      resetFilters: () => {
        const { month: m, year: y } = getCurrentMonthYear();
        set({ filters: { month: m, year: y, excludedCategoryIds: [], search: '' } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'income-filters',
      version: 1,
      partialize: (state) => ({ filters: state.filters }),
      // v0 stored a single `categoryId`; drop it and start with no exclusions.
      migrate: (persisted) => {
        const old = (persisted as { filters?: Record<string, unknown> } | undefined)?.filters ?? {};
        return {
          filters: {
            month: typeof old.month === 'number' ? old.month : month,
            year: typeof old.year === 'number' ? old.year : year,
            search: typeof old.search === 'string' ? old.search : '',
            excludedCategoryIds: Array.isArray(old.excludedCategoryIds)
              ? (old.excludedCategoryIds as string[])
              : [],
          },
        };
      },
    }
  )
);
