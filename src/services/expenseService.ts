import { supabase } from '../lib/supabase';
import { getDaysInMonth } from '../utils';
import type { Expense, NewExpense, ExpenseFilters } from '../types';

export async function fetchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  const startDate = filters.month === 0
    ? `${filters.year}-01-01`
    : `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
  const endDate = filters.month === 0
    ? `${filters.year}-12-31`
    : `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(getDaysInMonth(filters.year, filters.month)).padStart(2, '0')}`;

  const query = supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  // Category exclusion is applied client-side (see ExpensesPage), so the query
  // always returns the full month/year range.
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function insertExpense(expense: NewExpense & { user_id: string }): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function bulkInsertExpenses(rows: (NewExpense & { user_id: string })[]): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(rows)
    .select('*, category:categories(*)');
  if (error) throw error;
  return (data ?? []) as Expense[];
}

export async function updateExpense(id: string, updates: Partial<NewExpense>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();
  if (error) throw error;
  return data as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function countExpensesForCategory(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  if (error) throw error;
  return count ?? 0;
}
