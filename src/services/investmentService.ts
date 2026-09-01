import { supabase } from '../lib/supabase';
import type {
  InvestmentPlatform, NewInvestmentPlatform,
  InvestmentFlow, NewInvestmentFlow,
  InvestmentSnapshot, NewInvestmentSnapshot,
} from '../types';

// ---- Platforms ----

export async function fetchPlatforms(): Promise<InvestmentPlatform[]> {
  const { data, error } = await supabase
    .from('investment_platforms')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as InvestmentPlatform[];
}

export async function hasAnyPlatform(): Promise<boolean> {
  const { data, error } = await supabase.from('investment_platforms').select('id').limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function seedPlatforms(rows: (NewInvestmentPlatform & { user_id: string })[]): Promise<void> {
  const { error } = await supabase.from('investment_platforms').insert(rows);
  if (error && error.code !== '23505') throw error;
}

export async function insertPlatform(
  platform: NewInvestmentPlatform & { user_id: string }
): Promise<InvestmentPlatform> {
  const { data, error } = await supabase.from('investment_platforms').insert(platform).select().single();
  if (error) throw error;
  return data as InvestmentPlatform;
}

export async function updatePlatform(id: string, updates: Partial<NewInvestmentPlatform>): Promise<void> {
  const { error } = await supabase.from('investment_platforms').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deletePlatform(id: string): Promise<void> {
  const { error } = await supabase.from('investment_platforms').delete().eq('id', id);
  if (error) throw error;
}

// ---- Flows (deposits / withdrawals) ----

export async function fetchFlows(): Promise<InvestmentFlow[]> {
  const { data, error } = await supabase
    .from('investment_flows')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvestmentFlow[];
}

export async function insertFlow(flow: NewInvestmentFlow & { user_id: string }): Promise<InvestmentFlow> {
  const { data, error } = await supabase.from('investment_flows').insert(flow).select().single();
  if (error) throw error;
  return data as InvestmentFlow;
}

export async function updateFlow(id: string, updates: Partial<NewInvestmentFlow>): Promise<InvestmentFlow> {
  const { data, error } = await supabase.from('investment_flows').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as InvestmentFlow;
}

export async function deleteFlow(id: string): Promise<void> {
  const { error } = await supabase.from('investment_flows').delete().eq('id', id);
  if (error) throw error;
}

// ---- Snapshots (manual current value) ----

export async function fetchSnapshots(): Promise<InvestmentSnapshot[]> {
  const { data, error } = await supabase
    .from('investment_snapshots')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as InvestmentSnapshot[];
}

export async function insertSnapshot(
  snapshot: NewInvestmentSnapshot & { user_id: string }
): Promise<InvestmentSnapshot> {
  const { data, error } = await supabase.from('investment_snapshots').insert(snapshot).select().single();
  if (error) throw error;
  return data as InvestmentSnapshot;
}

export async function updateSnapshot(
  id: string,
  updates: Partial<NewInvestmentSnapshot>
): Promise<InvestmentSnapshot> {
  const { data, error } = await supabase.from('investment_snapshots').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as InvestmentSnapshot;
}

export async function deleteSnapshot(id: string): Promise<void> {
  const { error } = await supabase.from('investment_snapshots').delete().eq('id', id);
  if (error) throw error;
}
