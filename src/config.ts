export const APP_NAME = 'BattleMarmot';

// Публичные ключи Supabase (anon key предназначен для браузера; доступ к данным ограничен правилами RLS в базе).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://txnluafybvoujbkwntri.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_bps7AjaYuYANj3tRxO_XBw_kwt5c3NX';
