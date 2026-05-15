import { supabase } from '../lib/supabase';
import type { Category, NewCategory } from '../types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function insertCategory(cat: NewCategory & { user_id: string }): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(cat).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<NewCategory>): Promise<void> {
  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function hasAnyCategory(): Promise<boolean> {
  const { data, error } = await supabase.from('categories').select('id').limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function seedCategories(rows: (NewCategory & { user_id: string })[]): Promise<void> {
  const { error } = await supabase.from('categories').insert(rows);
  if (error) throw error;
}
