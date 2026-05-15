import { supabase } from '../lib/supabase';
import type { RecurringExpense, NewRecurringExpense } from '../types';

export async function fetchRecurringExpenses(): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, category:categories(*)')
    .order('day_of_month', { ascending: true });
  if (error) throw error;
  return (data ?? []) as RecurringExpense[];
}

export async function insertRecurringExpense(
  data: NewRecurringExpense & { user_id: string }
): Promise<RecurringExpense> {
  const { data: row, error } = await supabase
    .from('recurring_expenses')
    .insert(data)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return row as RecurringExpense;
}

export async function updateRecurringExpense(
  id: string,
  updates: Partial<NewRecurringExpense>
): Promise<RecurringExpense> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .update(updates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return data as RecurringExpense;
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleRecurringExpense(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('recurring_expenses').update({ active }).eq('id', id);
  if (error) throw error;
}
