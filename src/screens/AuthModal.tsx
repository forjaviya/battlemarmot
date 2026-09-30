import { useState } from 'react';
import { signIn, signUp } from '../lib/auth';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = mode === 'in' ? await signIn(email.trim(), password) : await signUp(email.trim(), password, nickname.trim() || email.split('@')[0]);
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="panel modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{mode === 'in' ? 'Вход' : 'Регистрация'}</h2>
        <p className="hint">Аккаунт хранит историю партий и статистику - открой игру на телефоне или ноутбуке, и прогресс будет с тобой.</p>
        {mode === 'up' && (
          <label>Никнейм<input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} placeholder="Например, СуркоЛов" /></label>
        )}
        <label>Почта<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Пароль<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="err">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? '…' : mode === 'in' ? 'Войти' : 'Создать аккаунт'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(null); }}>
          {mode === 'in' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
        <button type="button" className="btn ghost small" onClick={onClose}>Закрыть</button>
      </form>
    </div>
  );
}
