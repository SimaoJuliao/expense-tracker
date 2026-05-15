import { create } from 'zustand';
import * as groupService from '../services/groupService';
import { useAuthStore } from './useAuthStore';
import type { GroupMember, CategorySplit } from '../types';

interface GroupState {
  accountType: 'personal' | 'group' | null;
  members: GroupMember[];
  splits: CategorySplit[];
  loading: boolean;
  loadedUserId: string | null;
  fetchGroupData: () => Promise<void>;
  setupGroupAccount: (memberNames: string[]) => Promise<void>;
  saveSplits: (rows: { category_id: string; member_id: string; percentage: number }[]) => Promise<void>;
  reset: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  accountType: null,
  members: [],
  splits: [],
  loading: false,
  loadedUserId: null,

  fetchGroupData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    if (get().loadedUserId === user.id) return;

    set({ loading: true });
    try {
      const { accountType, members, splits } = await groupService.fetchGroupData(user.id);
      set({ accountType, members, splits, loading: false, loadedUserId: user.id });
    } catch {
      set({ loading: false });
    }
  },

  setupGroupAccount: async (memberNames) => {
    set({ loading: true });
    const user = useAuthStore.getState().user;
    if (!user) { set({ loading: false }); throw new Error('Not authenticated'); }

    try {
      const members = await groupService.setupGroupAccount(user.id, memberNames);
      set({ accountType: 'group', members, loading: false, loadedUserId: user.id });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  saveSplits: async (rows) => {
    set({ loading: true });
    const user = useAuthStore.getState().user;
    if (!user) { set({ loading: false }); return; }

    try {
      const upsertRows = rows.map((r) => ({ ...r, user_id: user.id }));
      const splits = await groupService.upsertCategorySplits(upsertRows);
      set({ splits, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  reset: () => set({ accountType: null, members: [], splits: [], loading: false, loadedUserId: null }),
}));
