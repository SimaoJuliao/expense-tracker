import { create } from 'zustand';
import * as incomeCategoryService from '../services/incomeCategoryService';
import * as incomeService from '../services/incomeService';
import { useAuthStore } from './useAuthStore';
import type { IncomeCategory, NewIncomeCategory } from '../types';

const seedingPromises = new Map<string, Promise<void>>();
let isFetchingIncomeCategories = false;

const DEFAULT_INCOME_CATEGORIES: NewIncomeCategory[] = [
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
    // If a seed is in progress for this user, wait for it so we never read (and
    // cache) the pre-seed empty table.
    const uid = useAuthStore.getState().user?.id;
    if (uid && seedingPromises.has(uid)) await seedingPromises.get(uid);
    if (isFetchingIncomeCategories) return;
    isFetchingIncomeCategories = true;
    if (get().incomeCategories.length === 0) set({ loading: true, error: null });
    try {
      const data = await incomeCategoryService.fetchIncomeCategories();
      set({ incomeCategories: data, loading: false });
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
    } finally {
      isFetchingIncomeCategories = false;
    }
  },

  seedDefaultIncomeCategories: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const userId = user.id;

    if (!seedingPromises.has(userId)) {
      seedingPromises.set(userId,
        incomeCategoryService.hasAnyIncomeCategory().then((hasAny) => {
          if (hasAny) return;
          const rows = DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
          return incomeCategoryService.seedIncomeCategories(rows);
        }).catch((err) => {
          console.error('seedDefaultIncomeCategories error:', err);
          seedingPromises.delete(userId);
        })
      );
    }
    await seedingPromises.get(userId);
    await get().fetchIncomeCategories();
  },

  addIncomeCategory: async (cat) => {
    set({ loading: true, error: null });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated', loading: false });
      throw new Error('Not authenticated');
    }
    try {
      const data = await incomeCategoryService.insertIncomeCategory({ ...cat, user_id: user.id });
      set((state) => ({ incomeCategories: [...state.incomeCategories, data], loading: false }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  updateIncomeCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await incomeCategoryService.updateIncomeCategory(id, updates);
      set((state) => ({
        incomeCategories: state.incomeCategories.map((c) => c.id === id ? { ...c, ...updates } : c),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  deleteIncomeCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await incomeCategoryService.deleteIncomeCategory(id);
      set((state) => ({
        incomeCategories: state.incomeCategories.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  getIncomeCountForCategory: (id) => incomeService.countIncomesForCategory(id),

  clearError: () => set({ error: null }),
}));
