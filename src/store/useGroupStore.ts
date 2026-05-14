import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import type { AccountSettings, GroupMember, CategorySplit } from '../types';

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
    const [settingsRes, membersRes, splitsRes] = await Promise.all([
      supabase.from('account_settings').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('group_members').select('*').eq('user_id', user.id).order('position'),
      supabase.from('category_splits').select('*').eq('user_id', user.id),
    ]);

    set({
      accountType: (settingsRes.data as AccountSettings | null)?.account_type ?? 'personal',
      members: (membersRes.data as GroupMember[]) ?? [],
      splits: (splitsRes.data as CategorySplit[]) ?? [],
      loading: false,
      loadedUserId: user.id,
    });
  },

  setupGroupAccount: async (memberNames) => {
    set({ loading: true });
    const user = useAuthStore.getState().user;
    if (!user) { set({ loading: false }); throw new Error('Not authenticated'); }

    const userId = user.id;

    const { error: settingsError } = await supabase
      .from('account_settings')
      .upsert({ user_id: userId, account_type: 'group' });
    if (settingsError) { set({ loading: false }); throw settingsError; }

    const memberRows = memberNames.map((name, i) => ({ user_id: userId, name, position: i }));
    const { error: membersError } = await supabase.from('group_members').insert(memberRows);
    if (membersError) { set({ loading: false }); throw membersError; }

    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('user_id', userId)
      .order('position');

    set({
      accountType: 'group',
      members: (members as GroupMember[]) ?? [],
      loading: false,
      loadedUserId: userId,
    });
  },

  saveSplits: async (rows) => {
    set({ loading: true });
    const user = useAuthStore.getState().user;
    if (!user) { set({ loading: false }); return; }

    const upsertRows = rows.map((r) => ({ ...r, user_id: user.id }));

    const { data, error } = await supabase
      .from('category_splits')
      .upsert(upsertRows, { onConflict: 'category_id,member_id' })
      .select();

    if (error) { set({ loading: false }); throw error; }
    set({ splits: (data as CategorySplit[]) ?? [], loading: false });
  },

  reset: () => set({ accountType: null, members: [], splits: [], loading: false, loadedUserId: null }),
}));
