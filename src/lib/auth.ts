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

  const nickname: string | null = user ? (user.user_metadata?.nickname as string) || user.email?.split('@')[0] || 'Игрок' : null;
  return { user, nickname, ready, enabled: !!supabase };
}

const ruError = (m: string) => {
  if (/Invalid login/i.test(m)) return 'Неверная почта или пароль';
  if (/already registered/i.test(m)) return 'Такая почта уже зарегистрирована — попробуй войти';
  if (/Password should be/i.test(m)) return 'Пароль должен быть не короче 6 символов';
  if (/valid email|invalid format/i.test(m)) return 'Проверь адрес почты';
  if (/rate limit/i.test(m)) return 'Слишком много попыток, подожди минутку';
  return m;
};

export async function signIn(email: string, password: string) {
  if (!supabase) return 'Вход временно недоступен';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? ruError(error.message) : null;
}

export async function signUp(email: string, password: string, nickname: string) {
  if (!supabase) return 'Регистрация временно недоступна';
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } });
  if (error) return ruError(error.message);
  if (!data.session) return 'Проверь почту и подтверди регистрацию';
  return null;
}

export async function signOut() {
  await supabase?.auth.signOut();
}
