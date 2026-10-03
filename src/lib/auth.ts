import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { syncLocal } from './history';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void syncLocal(session.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const nickname: string | null = user ? (user.user_metadata?.nickname as string) || user.email?.split('@')[0] || '' : null;
  return { user, nickname, ready, enabled: !!supabase };
}

/** Ошибки возвращаются кодом (ключом словаря), перевод делает интерфейс. */
const errorKey = (m: string) => {
  if (/Invalid login/i.test(m)) return 'invalid';
  if (/already registered/i.test(m)) return 'exists';
  if (/Password should be/i.test(m)) return 'short';
  if (/valid email|invalid format/i.test(m)) return 'email';
  if (/rate limit/i.test(m)) return 'rate';
  return m;
};

export async function signIn(email: string, password: string) {
  if (!supabase) return 'unavailable';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? errorKey(error.message) : null;
}

export async function signUp(email: string, password: string, nickname: string) {
  if (!supabase) return 'unavailable';
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } });
  if (error) return errorKey(error.message);
  if (!data.session) return 'confirm';
  return null;
}

export async function signOut() {
  await supabase?.auth.signOut();
}
