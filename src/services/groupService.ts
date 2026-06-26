import { supabase } from '../lib/supabase';
import type { AccountSettings, GroupMember, CategorySplit, Expense, Income } from '../types';

export async function fetchGroupData(userId: string): Promise<{
  accountType: 'personal' | 'group';
  members: GroupMember[];
  splits: CategorySplit[];
}> {
  const [settingsRes, membersRes, splitsRes] = await Promise.all([
    supabase.from('account_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('group_members').select('*').eq('user_id', userId).order('position'),
    supabase.from('category_splits').select('*').eq('user_id', userId),
  ]);

  if (settingsRes.error) throw settingsRes.error;
  if (membersRes.error) throw membersRes.error;
  if (splitsRes.error) throw splitsRes.error;

  return {
    accountType: (settingsRes.data as AccountSettings | null)?.account_type ?? 'personal',
    members: (membersRes.data as GroupMember[]) ?? [],
    splits: (splitsRes.data as CategorySplit[]) ?? [],
  };
}

export async function setupGroupAccount(userId: string, memberNames: string[]): Promise<GroupMember[]> {
  const { error: settingsError } = await supabase
    .from('account_settings')
    .upsert({ user_id: userId, account_type: 'group' });
  if (settingsError) throw settingsError;

  // Only insert members if none exist yet, so a retry (or a second browser
  // context completing a pending setup) doesn't duplicate the member rows.
  const { data: existing, error: existingError } = await supabase
    .from('group_members')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  if (existingError) throw existingError;

  if (!existing || existing.length === 0) {
    const memberRows = memberNames.map((name, i) => ({ user_id: userId, name, position: i }));
    const { error: membersError } = await supabase.from('group_members').insert(memberRows);
    // 23505 = unique_violation: a concurrent context (e.g. the email-confirmation
    // tab + the login tab) already created the members. The UNIQUE(user_id,
    // position) index turns that into an ignorable conflict; without the index
    // the plain insert just succeeds. Either way, don't fail the setup.
    if (membersError && membersError.code !== '23505') throw membersError;
  }

  const { data, error: fetchError } = await supabase
    .from('group_members')
    .select('*')
    .eq('user_id', userId)
    .order('position');
  if (fetchError) throw fetchError;

  return (data as GroupMember[]) ?? [];
}

export async function upsertCategorySplits(
  rows: { user_id: string; category_id: string; member_id: string; percentage: number }[]
): Promise<CategorySplit[]> {
  const { data, error } = await supabase
    .from('category_splits')
    .upsert(rows, { onConflict: 'category_id,member_id' })
    .select();
  if (error) throw error;
  return (data as CategorySplit[]) ?? [];
}

export async function fetchGroupSummaryData(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ expenses: Expense[]; incomes: Income[] }> {
  const [expensesRes, incomesRes] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
    supabase.from('incomes').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
  ]);

  if (expensesRes.error) throw expensesRes.error;
  if (incomesRes.error) throw incomesRes.error;

  return {
    expenses: (expensesRes.data as Expense[]) ?? [],
    incomes: (incomesRes.data as Income[]) ?? [],
  };
}
