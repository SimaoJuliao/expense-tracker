import { supabase } from '../lib/supabase';

export async function fetchAnalysisData(
  startDate: string,
  endDate: string
): Promise<{
  expenses: { date: string; amount: number }[];
  incomes: { date: string; amount: number }[];
}> {
  const [expResult, incResult] = await Promise.all([
    supabase.from('expenses').select('date, amount').gte('date', startDate).lte('date', endDate),
    supabase.from('incomes').select('date, amount').gte('date', startDate).lte('date', endDate),
  ]);

  if (expResult.error) throw expResult.error;
  if (incResult.error) throw incResult.error;

  return {
    expenses: (expResult.data ?? []).map((r) => ({ date: r.date as string, amount: Number(r.amount) })),
    incomes:  (incResult.data ?? []).map((r) => ({ date: r.date as string, amount: Number(r.amount) })),
  };
}
