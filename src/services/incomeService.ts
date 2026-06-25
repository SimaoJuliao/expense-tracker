import { supabase } from '../lib/supabase';
import { getDaysInMonth } from '../utils';
import type { Income, NewIncome, IncomeFilters } from '../types';

export async function fetchIncomes(filters: IncomeFilters): Promise<Income[]> {
  const startDate = filters.month === 0
    ? `${filters.year}-01-01`
    : `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
  const endDate = filters.month === 0
    ? `${filters.year}-12-31`
    : `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(getDaysInMonth(filters.year, filters.month)).padStart(2, '0')}`;

  const query = supabase
    .from('incomes')
    .select('*, income_category:income_categories(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  // Category exclusion is applied client-side (see IncomePage), so the query
  // always returns the full month/year range.
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Income[];
}

export async function insertIncome(income: NewIncome & { user_id: string }): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .insert(income)
    .select('*, income_category:income_categories(*)')
    .single();
  if (error) throw error;
  return data as Income;
}

export async function bulkInsertIncomes(rows: (NewIncome & { user_id: string })[]): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .insert(rows)
    .select('*, income_category:income_categories(*)');
  if (error) throw error;
  return (data ?? []) as Income[];
}

export async function updateIncome(id: string, updates: Partial<NewIncome>): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .update(updates)
    .eq('id', id)
    .select('*, income_category:income_categories(*)')
    .single();
  if (error) throw error;
  return data as Income;
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchIncomeTotalForRange(startDate: string, endDate: string): Promise<number> {
  const { data, error } = await supabase
    .from('incomes')
    .select('amount')
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
}

export async function countIncomesForCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from('incomes')
    .select('id', { count: 'exact', head: true })
    .eq('income_category_id', categoryId);
  if (error) throw error;
  return count ?? 0;
}
