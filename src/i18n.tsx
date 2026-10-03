// Тексты интерфейса на двух языках. Язык выбирается в меню профиля или внизу страницы,
// по умолчанию - по языку браузера; выбор сохраняется в LocalStorage.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Difficulty, ShotResult } from './game/types';

export type Lang = 'ru' | 'en';

const ruPlural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

const RU = {
  htmlLang: 'ru',
  dateLocale: 'ru-RU',
  tagline: 'Прятки сурков в степи',
  titleHome: 'прятки сурков',
  titleBattle: 'партия',
  cols: ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'],
  marmots: { 1: 'Сурчонок', 2: 'Сурок', 3: 'Большой сурок', 4: 'Длинносурок' } as Record<number, string>,
  longDock: ['Длинно-', 'сурок'],
  opp: {
    easy: { name: 'Жаворонок', level: 'Лёгкий', about: 'Ищет в основном наугад и часто забывает, где уже нашёл сурка.', fem: false },
    normal: { name: 'Лиса', level: 'Средний', about: 'Хитрая: проверяет норки через одну и, найдя сурка, ищет рядом, пока не найдёт целиком.', fem: true },
    hard: { name: 'Беркут', level: 'Сложный', about: 'Видит степь сверху: считает вероятность для каждой клетки по всем уже известным норкам.', fem: false },
  } as Record<Difficulty, { name: string; level: string; about: string; fem: boolean }>,
  menu: 'Меню',
  back: 'Назад',
  home: {
    lead: 'Спрячь своих сурков в норках и найди всех сурков соперника первым.',
    resume: 'Продолжить',
    newGame: 'Новая игра',
    stats: 'Статистика',
    rules: 'Как играть',
    features: [['10 сурков', 'спрятать и найти'], ['3 соперника', 'разной хитрости'], ['1 аккаунт', 'прогресс на любом устройстве']],
    pick: 'С кем играем?',
    burrow: 'Сурок в норке',
  },
  setup: {
    title: 'Спрячь своих сурков',
    vs: 'против:',
    hint: 'Выбери сурка и нажми на клетку. Сурки не могут стоять вплотную друг к другу, даже углами. Нажми на уже поставленного, чтобы поднять его.',
    hintDesk: 'Правый клик или клавиша R - повернуть.',
    placing: 'Ставим:',
    ready: 'Готово!',
    rotate: 'Повернуть',
    lying: '(лёжа)',
    standing: '(столбиком)',
    random: 'Случайно',
    last: 'Как в прошлый раз',
    clear: 'Очистить',
    yourField: 'Твоё поле',
    left: (n: number) => `Осталось спрятать: ${n}`,
    allHidden: 'Все сурки спрятаны!',
    start: 'Начать',
  },
  battle: {
    phrases: {
      miss: ['Пусто!', 'Только ветер…', 'Тут никого', 'Мимо норки'],
      hit: ['Попался!', 'Ой, чей-то хвостик!', 'Кто-то тут есть!'],
      sunk: ['Сурок найден!', 'Вот он, пушистый!', 'Попался целиком!'],
    } as Record<ShotResult, string[]>,
    yourTurn: 'Твой ход - загляни в норку соперника',
    searching: (name: string) => `${name} ищет…`,
    aiMiss: (where: string) => `${where} - пусто. Твой ход!`,
    aiHit: (where: string, fem: boolean) => `${fem ? 'Нашла' : 'Нашёл'} хвостик на ${where}!`,
    aiSunk: (where: string, fem: boolean) => `${fem ? 'Нашла' : 'Нашёл'} твоего сурка на ${where}!`,
    playerMiss: (where: string, p: string) => `${where}: ${p}`,
    playerHit: (where: string, p: string) => `${where}: ${p} Ищи рядом - ходи ещё.`,
    playerSunk: (p: string) => `${p} Ходи ещё.`,
    tabEnemy: 'Поле соперника',
    tabOwn: 'Мои сурки',
    enemyTitle: 'Норки соперника',
    ownTitle: 'Мои сурки',
    stillHiding: 'Ещё прячутся:',
    notFound: 'Не найдены:',
    enemyField: 'Поле соперника',
  },
  result: {
    won: 'Все сурки найдены!',
    lost: (name: string, fem: boolean) => `${name} ${fem ? 'оказалась' : 'оказался'} быстрее`,
    subWon: (name: string) => `Ты перехитрил(а) соперника «${name}»`,
    subLost: 'Сурки соперника ещё прячутся, но реванш всегда возможен',
    checked: 'норок проверено',
    accuracy: 'точность',
    time: 'время',
    again: 'Давай ещё одну!',
    toMenu: 'В меню',
    saveA: 'Результат сохранён на этом устройстве. ',
    saveLink: 'Войди',
    saveB: ', чтобы видеть статистику с телефона и компьютера.',
    reveal: 'Где прятались сурки соперника',
    revealLabel: 'Поле соперника (открыто)',
  },
  stats: {
    title: 'Статистика',
    cloud: 'Данные аккаунта - видны на любом устройстве.',
    local: 'Данные этого устройства.',
    loginLink: 'Войди',
    loginTail: ', чтобы сохранять в облако.',
    cloudError: (e: string) => ` (облако недоступно: ${e})`,
    loading: 'Загружаем…',
    empty: 'Пока ни одной партии. Самое время сыграть первую!',
    games: 'партий',
    wins: 'побед',
    winRate: 'побед',
    accuracy: 'точность',
    record: 'рекорд (норок за победу)',
    streak: (best: number) => `серия побед (лучшая ${best})`,
    byOpp: 'По соперникам',
    score: (w: number) => ruPlural(w, 'победа', 'победы', 'побед'),
    of: 'из',
    notPlayed: 'ещё не играли',
    history: 'История партий',
    win: 'Победа',
    loss: 'Поражение',
    burrows: (n: number) => `${n} ${ruPlural(n, 'норка', 'норки', 'норок')}`,
  },
  rules: {
    title: 'Как играть',
    intro: 'Это классический «Морской бой», только вместо кораблей сурки, а вместо моря казахская степь. Никто не воюет: мы играем в прятки.',
    h1: '1. Спрячь сурков',
    fleet: 'У каждого игрока поле 10×10 и 10 сурков:',
    fleetItem: (name: string, len: number, count: number) => `${name} (длина ${len}) × ${count}`,
    straight: 'Сурки стоят прямо, лёжа или столбиком, и не касаются друг друга даже углами.',
    h2: '2. Ищи сурков соперника',
    miss: ['Пусто', ': ход переходит сопернику.'],
    hit: ['Попался!', ' Нашёл часть сурка: ходи ещё раз и ищи рядом.'],
    sunk: ['Сурок найден', ' целиком. Клетки вокруг него автоматически отмечаются как пустые.'],
    win: 'В одну клетку дважды заглянуть нельзя. Побеждает тот, кто первым найдёт всех 10 сурков соперника.',
    h3: '3. Соперники',
    opps: { easy: 'ищет почти наугад.', normal: 'проверяет норки через одну и прочёсывает всё вокруг найденного хвостика.', hard: 'считает вероятность для каждой клетки. Попробуй обыграть!' } as Record<Difficulty, string>,
    fair: 'Компьютер не подглядывает: он знает только то, что видно и тебе, то есть где уже искали и что нашли.',
    h4: 'Сохранение',
    save: 'Партия сохраняется автоматически: можно закрыть вкладку и продолжить позже. Войди в аккаунт, чтобы история и статистика были доступны на любом устройстве.',
    keys: 'Клавиатура: стрелки для перемещения по полю, Enter чтобы выбрать клетку, R чтобы повернуть сурка.',
  },
  auth: {
    login: 'Вход',
    signup: 'Регистрация',
    hint: 'Аккаунт хранит историю партий и статистику: открой игру на телефоне или ноутбуке, и прогресс будет с тобой.',
    nickname: 'Никнейм',
    nickPh: 'Например, СуркоЛов',
    email: 'Почта',
    password: 'Пароль',
    submitIn: 'Войти',
    submitUp: 'Создать аккаунт',
    toUp: 'Нет аккаунта? Зарегистрироваться',
    toIn: 'Уже есть аккаунт? Войти',
    close: 'Закрыть',
    errors: {
      invalid: 'Неверная почта или пароль',
      exists: 'Такая почта уже зарегистрирована, попробуй войти',
      short: 'Пароль должен быть не короче 6 символов',
      email: 'Проверь адрес почты',
      rate: 'Слишком много попыток, подожди минутку',
      unavailable: 'Вход временно недоступен',
      confirm: 'Проверь почту и подтверди регистрацию',
    } as Record<string, string>,
  },
  profile: {
    guest: 'Гость',
    player: 'Игрок',
    guestHint: 'Войди, чтобы прогресс сохранялся на любом устройстве',
    myStats: 'Моя статистика',
    soundOn: 'Звук: включён',
    soundOff: 'Звук: выключен',
    logout: 'Выйти из аккаунта',
    login: 'Войти',
    language: 'Язык',
  },
  cell: { miss: 'пусто', hit: 'найдена часть сурка', sunk: 'сурок найден', blocked: 'точно пусто', unknown: 'не проверено' },
};

export type Dict = typeof RU;

const EN: Dict = {
  htmlLang: 'en',
  dateLocale: 'en-GB',
  tagline: 'Steppe hide-and-seek',
  titleHome: 'marmot hide-and-seek',
  titleBattle: 'game',
  cols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  marmots: { 1: 'Pup', 2: 'Marmot', 3: 'Big marmot', 4: 'Long marmot' },
  longDock: ['Long', 'marmot'],
  opp: {
    easy: { name: 'Lark', level: 'Easy', about: 'Searches mostly at random and often forgets where it has already found a marmot.', fem: false },
    normal: { name: 'Fox', level: 'Medium', about: 'Sly: checks every other burrow and, once it finds a marmot, keeps digging nearby until it uncovers the whole thing.', fem: false },
    hard: { name: 'Eagle', level: 'Hard', about: 'Sees the steppe from above: calculates the odds for every cell using everything it already knows.', fem: false },
  },
  menu: 'Menu',
  back: 'Back',
  home: {
    lead: 'Hide your marmots in their burrows and be the first to find all of your opponent’s.',
    resume: 'Continue',
    newGame: 'New game',
    stats: 'Stats',
    rules: 'How to play',
    features: [['10 marmots', 'to hide and to find'], ['3 opponents', 'each with its own tricks'], ['1 account', 'your progress on any device']],
    pick: 'Choose your opponent',
    burrow: 'Marmot in a burrow',
  },
  setup: {
    title: 'Hide your marmots',
    vs: 'vs:',
    hint: 'Pick a marmot and tap a cell. Marmots can’t touch each other, not even at the corners. Tap a placed marmot to pick it up again.',
    hintDesk: 'Right-click or press R to rotate.',
    placing: 'Placing:',
    ready: 'Ready!',
    rotate: 'Rotate',
    lying: '(lying)',
    standing: '(standing)',
    random: 'Random',
    last: 'Same as last time',
    clear: 'Clear',
    yourField: 'Your field',
    left: (n: number) => `Left to hide: ${n}`,
    allHidden: 'All marmots are hidden!',
    start: 'Start',
  },
  battle: {
    phrases: {
      miss: ['Empty!', 'Just the wind…', 'Nobody home', 'Wrong burrow'],
      hit: ['Gotcha!', 'Oh, a little tail!', 'Someone’s in here!'],
      sunk: ['Marmot found!', 'There it is, all fluffy!', 'Caught the whole thing!'],
    },
    yourTurn: 'Your turn - peek into an opponent’s burrow',
    searching: (name: string) => `${name} is searching…`,
    aiMiss: (where: string) => `${where} - empty. Your turn!`,
    aiHit: (where: string) => `Found a tail at ${where}!`,
    aiSunk: (where: string) => `Found your marmot at ${where}!`,
    playerMiss: (where: string, p: string) => `${where}: ${p}`,
    playerHit: (where: string, p: string) => `${where}: ${p} Search nearby - go again.`,
    playerSunk: (p: string) => `${p} Go again.`,
    tabEnemy: 'Opponent’s field',
    tabOwn: 'My marmots',
    enemyTitle: 'Opponent’s burrows',
    ownTitle: 'My marmots',
    stillHiding: 'Still hiding:',
    notFound: 'Not found yet:',
    enemyField: 'Opponent’s field',
  },
  result: {
    won: 'All marmots found!',
    lost: (name: string) => `${name} was faster`,
    subWon: (name: string) => `You outsmarted ${name}`,
    subLost: 'The opponent’s marmots are still hiding, but a rematch is always possible',
    checked: 'burrows checked',
    accuracy: 'accuracy',
    time: 'time',
    again: 'One more round!',
    toMenu: 'Menu',
    saveA: 'Result saved on this device. ',
    saveLink: 'Log in',
    saveB: ' to see your stats on your phone and computer.',
    reveal: 'Where the opponent’s marmots were hiding',
    revealLabel: 'Opponent’s field (revealed)',
  },
  stats: {
    title: 'Stats',
    cloud: 'Account data - available on any device.',
    local: 'Data from this device.',
    loginLink: 'Log in',
    loginTail: ' to save it to the cloud.',
    cloudError: (e: string) => ` (cloud unavailable: ${e})`,
    loading: 'Loading…',
    empty: 'No games yet. Time to play your first one!',
    games: 'games',
    wins: 'wins',
    winRate: 'win rate',
    accuracy: 'accuracy',
    record: 'record (burrows per win)',
    streak: (best: number) => `win streak (best ${best})`,
    byOpp: 'By opponent',
    score: (w: number) => (w === 1 ? 'win' : 'wins'),
    of: 'of',
    notPlayed: 'not played yet',
    history: 'Game history',
    win: 'Win',
    loss: 'Loss',
    burrows: (n: number) => `${n} ${n === 1 ? 'burrow' : 'burrows'}`,
  },
  rules: {
    title: 'How to play',
    intro: 'It’s classic Battleship, but with marmots instead of ships and the Kazakh steppe instead of the sea. Nobody fights here: we play hide-and-seek.',
    h1: '1. Hide your marmots',
    fleet: 'Each player has a 10×10 field and 10 marmots:',
    fleetItem: (name: string, len: number, count: number) => `${name} (length ${len}) × ${count}`,
    straight: 'Marmots lie down or stand up straight, and never touch each other, not even at the corners.',
    h2: '2. Find your opponent’s marmots',
    miss: ['Empty', ': the turn passes to your opponent.'],
    hit: ['Gotcha!', ' You found part of a marmot: go again and search nearby.'],
    sunk: ['Marmot found', ' in full. The cells around it are marked as empty automatically.'],
    win: 'You can’t peek into the same cell twice. The first to find all 10 of the opponent’s marmots wins.',
    h3: '3. Opponents',
    opps: { easy: 'searches almost at random.', normal: 'checks every other burrow and combs the area around every tail it finds.', hard: 'calculates the odds for every cell. Try to beat it!' },
    fair: 'The computer doesn’t peek: it only knows what you can see too, meaning where someone already searched and what was found.',
    h4: 'Saving',
    save: 'Your game is saved automatically, so you can close the tab and continue later. Log in to keep your history and stats on any device.',
    keys: 'Keyboard: arrows to move around the field, Enter to pick a cell, R to rotate a marmot.',
  },
  auth: {
    login: 'Log in',
    signup: 'Sign up',
    hint: 'Your account keeps your game history and stats: open the game on your phone or laptop and your progress comes with you.',
    nickname: 'Nickname',
    nickPh: 'e.g. MarmotHunter',
    email: 'Email',
    password: 'Password',
    submitIn: 'Log in',
    submitUp: 'Create account',
    toUp: 'No account? Sign up',
    toIn: 'Already have an account? Log in',
    close: 'Close',
    errors: {
      invalid: 'Wrong email or password',
      exists: 'This email is already registered, try logging in',
      short: 'Password must be at least 6 characters',
      email: 'Please check the email address',
      rate: 'Too many attempts, please wait a minute',
      unavailable: 'Login is temporarily unavailable',
      confirm: 'Check your email to confirm sign-up',
    },
  },
  profile: {
    guest: 'Guest',
    player: 'Player',
    guestHint: 'Log in to keep your progress on any device',
    myStats: 'My stats',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
    logout: 'Log out',
    login: 'Log in',
    language: 'Language',
  },
  cell: { miss: 'empty', hit: 'part of a marmot found', sunk: 'marmot found', blocked: 'definitely empty', unknown: 'not checked' },
};

export const DICTS: Record<Lang, Dict> = { ru: RU, en: EN };

const K_LANG = 'battlemarmot.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(K_LANG);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'ru';
  return /^(ru|kk|uk|be)/.test(nav) ? 'ru' : 'en';
}

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: 'ru', t: RU, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(K_LANG, l); } catch { /* ignore */ }
  };
  useEffect(() => { document.documentElement.lang = DICTS[lang].htmlLang; }, [lang]);
  return <Ctx.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

/** Переключатель RU / EN. */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <span className={`lang-switch ${className ?? ''}`} role="group" aria-label="Language">
      {(['ru', 'en'] as Lang[]).map((l) => (
        <button key={l} type="button" className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </span>
  );
}
