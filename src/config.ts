export const APP_NAME = 'Суыр';
export const APP_TAGLINE = 'Прятки сурков в степи';

// Публичные ключи Supabase (anon key предназначен для браузера; доступ к данным ограничен правилами RLS в базе).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const OPPONENTS = {
  easy: { name: 'Жаворонок', level: 'Лёгкий', about: 'Ищет в основном наугад и часто забывает, где уже нашёл сурка.' },
  normal: { name: 'Лиса', level: 'Средний', about: 'Хитрая: проверяет норки через одну и, найдя сурка, ищет рядом, пока не найдёт целиком.' },
  hard: { name: 'Беркут', level: 'Сложный', about: 'Видит степь сверху: считает вероятность для каждой клетки по всем уже известным норкам.' },
} as const;
