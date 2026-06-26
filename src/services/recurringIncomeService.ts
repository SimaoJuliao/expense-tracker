import { supabase } from '../lib/supabase';
import type { RecurringIncome, NewRecurringIncome } from '../types';

export async function fetchRecurringIncomes(): Promise<RecurringIncome[]> {
  const { data, error } = await supabase
    .from('recurring_incomes')
    .select('*, income_category:income_categories(*)')
    .order('day_of_month', { ascending: true });
  if (error) throw error;
  return (data ?? []) as RecurringIncome[];
}

export async function insertRecurringIncome(
  data: NewRecurringIncome & { user_id: string }
): Promise<RecurringIncome> {
  const { data: row, error } = await supabase
    .from('recurring_incomes')
    .insert(data)
    .select('*, income_category:income_categories(*)')
    .single();
  if (error) throw error;
  return row as RecurringIncome;
}

export async function updateRecurringIncome(
  id: string,
  updates: Partial<NewRecurringIncome>
): Promise<RecurringIncome> {
  const { data, error } = await supabase
    .from('recurring_incomes')
    .update(updates)
    .eq('id', id)
    .select('*, income_category:income_categories(*)')
    .single();
  if (error) throw error;
  return data as RecurringIncome;
}

export async function deleteRecurringIncome(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_incomes').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleRecurringIncome(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('recurring_incomes').update({ active }).eq('id', id);
  if (error) throw error;
}
