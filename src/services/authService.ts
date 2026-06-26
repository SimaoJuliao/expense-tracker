import { supabase } from '../lib/supabase';
import type { Session, Subscription } from '@supabase/supabase-js';

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
): Subscription {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
}

export async function signIn(email: string, password: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signUp(email: string, password: string): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // With email confirmation enabled, Supabase does NOT return an error for an
  // address that already exists (to prevent email enumeration). Instead it
  // returns a user whose `identities` array is empty. Surface that as an error
  // so the UI can tell the user the email is taken instead of pretending success.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    throw new Error('user_already_registered');
  }
  return data.session;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}
