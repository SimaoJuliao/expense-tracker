import { supabase } from '../lib/supabase';
import type { IncomeCategory, NewIncomeCategory } from '../types';

export async function fetchIncomeCategories(): Promise<IncomeCategory[]> {
  const { data, error } = await supabase
    .from('income_categories')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as IncomeCategory[];
}

export async function insertIncomeCategory(cat: NewIncomeCategory & { user_id: string }): Promise<IncomeCategory> {
  const { data, error } = await supabase.from('income_categories').insert(cat).select().single();
  if (error) throw error;
  return data as IncomeCategory;
}

export async function updateIncomeCategory(id: string, updates: Partial<NewIncomeCategory>): Promise<void> {
  const { error } = await supabase.from('income_categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteIncomeCategory(id: string): Promise<void> {
  const { error } = await supabase.from('income_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function hasAnyIncomeCategory(): Promise<boolean> {
  const { data, error } = await supabase.from('income_categories').select('id').limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function seedIncomeCategories(rows: (NewIncomeCategory & { user_id: string })[]): Promise<void> {
  // Plain insert (guarded by hasAnyIncomeCategory) + ignore 23505 unique_violation,
  // so a concurrent seed is deduped by the UNIQUE(user_id, name) index when
  // present, and the call still works without it.
  const { error } = await supabase.from('income_categories').insert(rows);
  if (error && error.code !== '23505') throw error;
}
