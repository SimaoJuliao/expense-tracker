import { create } from 'zustand';
import * as categoryService from '../services/categoryService';
import * as expenseService from '../services/expenseService';
import { useAuthStore } from './useAuthStore';
import type { Category, NewCategory } from '../types';

const seededUsers = new Set<string>();

const DEFAULT_CATEGORIES: NewCategory[] = [
  { name: 'Food & Drinks', icon: '🍔', color: '#f97316' },
  { name: 'Transport',     icon: '🚗', color: '#3b82f6' },
  { name: 'Housing',       icon: '🏠', color: '#8b5cf6' },
  { name: 'Health',        icon: '💊', color: '#10b981' },
  { name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { name: 'Shopping',      icon: '🛍️', color: '#ec4899' },
  { name: 'Utilities',     icon: '⚡', color: '#6366f1' },
  { name: 'Other',         icon: '📦', color: '#6b7280' },
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
    try {
      const data = await categoryService.fetchCategories();
      set({ categories: data, loading: false });
    } catch (err) {
      console.error('fetchCategories error:', err);
      set({ error: (err as { message: string }).message, loading: false });
    }
  },

  seedDefaultCategories: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const userId = user.id;

    if (seededUsers.has(userId)) return;
    seededUsers.add(userId);

    try {
      const hasAny = await categoryService.hasAnyCategory();
      if (hasAny) return;
      const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
      await categoryService.seedCategories(rows);
      await get().fetchCategories();
    } catch (err) {
      console.error('seedDefaultCategories error:', err);
      seededUsers.delete(userId);
    }
  },

  addCategory: async (cat) => {
    set({ loading: true, error: null });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ error: 'Not authenticated', loading: false });
      throw new Error('Not authenticated');
    }
    try {
      const data = await categoryService.insertCategory({ ...cat, user_id: user.id });
      set((state) => ({ categories: [...state.categories, data], loading: false }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await categoryService.updateCategory(id, updates);
      set((state) => ({
        categories: state.categories.map((c) => c.id === id ? { ...c, ...updates } : c),
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await categoryService.deleteCategory(id);
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id), loading: false }));
    } catch (err) {
      set({ error: (err as { message: string }).message, loading: false });
      throw err;
    }
  },

  getExpenseCountForCategory: (id) => expenseService.countExpensesForCategory(id),

  clearError: () => set({ error: null }),
}));
