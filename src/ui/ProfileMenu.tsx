import { useEffect, useRef, useState } from 'react';
import { HEAD, PixelSprite, SPEAKER, SPEAKER_OFF } from './sprites';

/**
 * Кнопка профиля в шапке. Нажатие открывает меню:
 * имя и почта, статистика, звук, вход/выход.
 */
export function ProfileMenu({
  nickname, email, muted, onToggleSound, onStats, onLogin, onLogout, authEnabled,
}: {
  nickname: string | null;
  email?: string | null;
  muted: boolean;
  onToggleSound: () => void;
  onStats: () => void;
  onLogin: () => void;
  onLogout: () => void;
  authEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const act = (fn: () => void) => () => { setOpen(false); fn(); };
  const loggedIn = !!nickname;

  return (
    <div className="profile" ref={ref}>
      <button className="profile-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <PixelSprite rows={HEAD} className="profile-ava" />
        <span className="profile-name">{loggedIn ? nickname : 'Гость'}</span>
        <span className={`profile-caret ${open ? 'up' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="profile-menu panel" role="menu">
          <div className="pm-head">
            <b>{loggedIn ? nickname : 'Гость'}</b>
            <span>{loggedIn ? email : 'Войди, чтобы прогресс сохранялся на любом устройстве'}</span>
          </div>
          <button role="menuitem" className="pm-item" onClick={act(onStats)}>Моя статистика</button>
          <button role="menuitem" className="pm-item" onClick={onToggleSound}>
            <PixelSprite rows={muted ? SPEAKER_OFF : SPEAKER} size={20} />
            Звук: {muted ? 'выключен' : 'включён'}
          </button>
          {authEnabled && (loggedIn ? (
            <button role="menuitem" className="pm-item pm-out" onClick={act(onLogout)}>Выйти из аккаунта</button>
          ) : (
            <button role="menuitem" className="btn primary small pm-login" onClick={act(onLogin)}>Войти</button>
          ))}
        </div>
      )}
    </div>
  );
}
