import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as expenseService from '../services/expenseService';
import { useAuthStore } from './useAuthStore';
import type { Expense, ExpenseFilters, NewExpense } from '../types';
import { getCurrentMonthYear } from '../utils';

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
      filters: { month, year, excludedCategoryIds: [], search: '' },
      loading: false,
      error: null,

      fetchExpenses: async () => {
        set({ loading: true, error: null });
        try {
          const data = await expenseService.fetchExpenses(get().filters);
          set({ expenses: data, loading: false });
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
        }
      },

      addExpense: async (expense) => {
        set({ loading: true, error: null });
        const user = useAuthStore.getState().user;
        if (!user) { set({ error: 'Not authenticated', loading: false }); return; }
        try {
          const data = await expenseService.insertExpense({ ...expense, user_id: user.id });
          set((state) => ({
            expenses: [data, ...state.expenses].sort((a, b) => b.date.localeCompare(a.date)),
            filters: { ...state.filters, search: '' },
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      bulkAddExpenses: async (expenses) => {
        set({ loading: true, error: null });
        try {
          const data = await expenseService.bulkInsertExpenses(expenses);
          set((state) => ({
            expenses: [...state.expenses, ...data].sort((a, b) => b.date.localeCompare(a.date)),
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      updateExpense: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const data = await expenseService.updateExpense(id, updates);
          set((state) => ({
            expenses: state.expenses
              .map((e) => e.id === id ? data : e)
              .sort((a, b) => b.date.localeCompare(a.date)),
            filters: { ...state.filters, search: '' },
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as { message: string }).message, loading: false });
          throw err;
        }
      },

      deleteExpense: async (id) => {
        set({ loading: true, error: null });
        try {
          await expenseService.deleteExpense(id);
          set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id), loading: false }));
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
      name: 'expense-filters',
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
