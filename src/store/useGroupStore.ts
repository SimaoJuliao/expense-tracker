import { create } from 'zustand';
import * as groupService from '../services/groupService';
import { useAuthStore } from './useAuthStore';
import type { GroupMember, CategorySplit } from '../types';

let isFetchingGroupData = false;
let isSettingUpGroup = false;
let setupInFlight: Promise<void> | null = null;

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
    // A group setup is mid-flight (e.g. completing a pending registration);
    // don't read and overwrite the soon-to-be 'group' state with a stale 'personal'.
    if (isSettingUpGroup) return;
    if (get().loadedUserId === user.id) return;
    if (isFetchingGroupData) return;

    isFetchingGroupData = true;
    set({ loading: true });
    try {
      const { accountType, members, splits } = await groupService.fetchGroupData(user.id);
      set({ accountType, members, splits, loading: false, loadedUserId: user.id });
    } catch (err) {
      console.error('fetchGroupData error:', err);
      set({ loading: false });
    } finally {
      isFetchingGroupData = false;
    }
  },

  setupGroupAccount: async (memberNames) => {
    // Dedupe concurrent calls (StrictMode double-effect, or the AppLayout effect
    // running twice) onto a single in-flight setup so callers awaiting it resolve
    // only when the group is actually written.
    if (setupInFlight) return setupInFlight;
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    isSettingUpGroup = true;
    set({ loading: true });
    setupInFlight = (async () => {
      try {
        const members = await groupService.setupGroupAccount(user.id, memberNames);
        set({ accountType: 'group', members, loading: false, loadedUserId: user.id });
      } catch (err) {
        set({ loading: false });
        throw err;
      } finally {
        isSettingUpGroup = false;
        setupInFlight = null;
      }
    })();
    return setupInFlight;
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
