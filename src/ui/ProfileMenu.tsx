import { useEffect, useRef, useState } from 'react';
import { HEAD, PixelSprite, SPEAKER, SPEAKER_OFF } from './sprites';
import { LangSwitch, useI18n } from '../i18n';

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
  const { t } = useI18n();
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
        <span className="profile-name">{loggedIn ? nickname : t.profile.guest}</span>
        <span className={`profile-caret ${open ? 'up' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="profile-menu panel" role="menu">
          <div className="pm-head">
            <b>{loggedIn ? nickname : t.profile.guest}</b>
            <span>{loggedIn ? email : t.profile.guestHint}</span>
          </div>
          <button role="menuitem" className="pm-item" onClick={act(onStats)}>{t.profile.myStats}</button>
          <button role="menuitem" className="pm-item" onClick={onToggleSound}>
            <PixelSprite rows={muted ? SPEAKER_OFF : SPEAKER} size={20} />
            {muted ? t.profile.soundOff : t.profile.soundOn}
          </button>
          <div className="pm-item pm-lang">{t.profile.language}<LangSwitch /></div>
          {authEnabled && (loggedIn ? (
            <button role="menuitem" className="pm-item pm-out" onClick={act(onLogout)}>{t.profile.logout}</button>
          ) : (
            <button role="menuitem" className="btn primary small pm-login" onClick={act(onLogin)}>{t.profile.login}</button>
          ))}
        </div>
      )}
    </div>
  );
}
