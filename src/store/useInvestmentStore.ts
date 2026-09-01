import { create } from 'zustand';
import * as investmentService from '../services/investmentService';
import { useAuthStore } from './useAuthStore';
import type {
  InvestmentPlatform, NewInvestmentPlatform,
  InvestmentFlow, NewInvestmentFlow,
  InvestmentSnapshot, NewInvestmentSnapshot,
} from '../types';

const seedingPromises = new Map<string, Promise<void>>();
let isFetching = false;

const DEFAULT_PLATFORMS: NewInvestmentPlatform[] = [
  { name: 'XTB',        icon: null, color: '#ef4444' },
  { name: 'Trading212', icon: null, color: '#3b82f6' },
  { name: 'Binance',    icon: null, color: '#f59e0b' },
];

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);

interface InvestmentState {
  platforms: InvestmentPlatform[];
  flows: InvestmentFlow[];
  snapshots: InvestmentSnapshot[];
  loading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  seedDefaultPlatforms: () => Promise<void>;

  addPlatform: (platform: NewInvestmentPlatform) => Promise<void>;
  updatePlatform: (id: string, updates: Partial<NewInvestmentPlatform>) => Promise<void>;
  deletePlatform: (id: string) => Promise<void>;

  addFlow: (flow: NewInvestmentFlow) => Promise<void>;
  updateFlow: (id: string, updates: Partial<NewInvestmentFlow>) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;

  addSnapshot: (snapshot: NewInvestmentSnapshot) => Promise<void>;
  updateSnapshot: (id: string, updates: Partial<NewInvestmentSnapshot>) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;

  clearError: () => void;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  platforms: [],
  flows: [],
  snapshots: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    // Wait for any in-progress seed so we never read (and cache) an empty table.
    const uid = useAuthStore.getState().user?.id;
    if (uid && seedingPromises.has(uid)) await seedingPromises.get(uid);
    if (isFetching) return;
    isFetching = true;
    if (get().platforms.length === 0) set({ loading: true, error: null });
    try {
      const [platforms, flows, snapshots] = await Promise.all([
        investmentService.fetchPlatforms(),
        investmentService.fetchFlows(),
        investmentService.fetchSnapshots(),
      ]);
      set({ platforms, flows, snapshots, loading: false });
    } catch (err) {
      console.error('fetchAll investments error:', err);
      set({ error: (err as { message: string }).message, loading: false });
    } finally {
      isFetching = false;
    }
  },

  seedDefaultPlatforms: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    const userId = user.id;

    if (!seedingPromises.has(userId)) {
      seedingPromises.set(userId,
        investmentService.hasAnyPlatform().then((hasAny) => {
          if (hasAny) return;
          const rows = DEFAULT_PLATFORMS.map((p) => ({ ...p, user_id: userId }));
          return investmentService.seedPlatforms(rows);
        }).catch((err) => {
          console.error('seedDefaultPlatforms error:', err);
          seedingPromises.delete(userId);
        })
      );
    }
    await seedingPromises.get(userId);
    await get().fetchAll();
  },

  addPlatform: async (platform) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    const data = await investmentService.insertPlatform({ ...platform, user_id: user.id });
    set((s) => ({ platforms: [...s.platforms, data] }));
  },

  updatePlatform: async (id, updates) => {
    await investmentService.updatePlatform(id, updates);
    set((s) => ({ platforms: s.platforms.map((p) => (p.id === id ? { ...p, ...updates } : p)) }));
  },

  deletePlatform: async (id) => {
    await investmentService.deletePlatform(id);
    set((s) => ({
      platforms: s.platforms.filter((p) => p.id !== id),
      flows: s.flows.filter((f) => f.platform_id !== id),
      snapshots: s.snapshots.filter((sn) => sn.platform_id !== id),
    }));
  },

  addFlow: async (flow) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    const data = await investmentService.insertFlow({ ...flow, user_id: user.id });
    set((s) => ({ flows: [data, ...s.flows].sort(byDateDesc) }));
  },

  updateFlow: async (id, updates) => {
    const data = await investmentService.updateFlow(id, updates);
    set((s) => ({ flows: s.flows.map((f) => (f.id === id ? data : f)).sort(byDateDesc) }));
  },

  deleteFlow: async (id) => {
    await investmentService.deleteFlow(id);
    set((s) => ({ flows: s.flows.filter((f) => f.id !== id) }));
  },

  addSnapshot: async (snapshot) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    const data = await investmentService.insertSnapshot({ ...snapshot, user_id: user.id });
    set((s) => ({ snapshots: [data, ...s.snapshots].sort(byDateDesc) }));
  },

  updateSnapshot: async (id, updates) => {
    const data = await investmentService.updateSnapshot(id, updates);
    set((s) => ({ snapshots: s.snapshots.map((sn) => (sn.id === id ? data : sn)).sort(byDateDesc) }));
  },

  deleteSnapshot: async (id) => {
    await investmentService.deleteSnapshot(id);
    set((s) => ({ snapshots: s.snapshots.filter((sn) => sn.id !== id) }));
  },

  clearError: () => set({ error: null }),
}));
