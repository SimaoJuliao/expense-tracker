import { create } from 'zustand';
import * as recurringExpenseService from '../services/recurringExpenseService';
import { useAuthStore } from './useAuthStore';
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

export const useRecurringExpenseStore = create<RecurringExpenseState>()((set) => ({
  recurring: [],
  loading: false,
  error: null,

  fetchRecurring: async () => {
    set({ loading: true, error: null });
    try {
      const data = await recurringExpenseService.fetchRecurringExpenses();
      set({ recurring: data, loading: false });
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
    }
  },

  addRecurring: async (data) => {
    set({ loading: true, error: null });
    const user = useAuthStore.getState().user;
    if (!user) { set({ error: 'Not authenticated', loading: false }); return; }
    try {
      const row = await recurringExpenseService.insertRecurringExpense({ ...data, user_id: user.id });
      set((state) => ({
        recurring: [...state.recurring, row].sort((a, b) => a.day_of_month - b.day_of_month),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  updateRecurring: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const row = await recurringExpenseService.updateRecurringExpense(id, data);
      set((state) => ({
        recurring: state.recurring
          .map((r) => r.id === id ? row : r)
          .sort((a, b) => a.day_of_month - b.day_of_month),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  deleteRecurring: async (id) => {
    set({ loading: true, error: null });
    try {
      await recurringExpenseService.deleteRecurringExpense(id);
      set((state) => ({ recurring: state.recurring.filter((r) => r.id !== id), loading: false }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  toggleActive: async (id, active) => {
    try {
      await recurringExpenseService.toggleRecurringExpense(id, active);
      set((state) => ({
        recurring: state.recurring.map((r) => r.id === id ? { ...r, active } : r),
      }));
    } catch (err) {
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
