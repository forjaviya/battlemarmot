import { useState } from 'react';
import { signIn, signUp } from '../lib/auth';
import { useI18n } from '../i18n';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const A = t.auth;
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
        <h2>{mode === 'in' ? A.login : A.signup}</h2>
        <p className="hint">{A.hint}</p>
        {mode === 'up' && (
          <label>{A.nickname}<input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} placeholder={A.nickPh} /></label>
        )}
        <label>{A.email}<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>{A.password}<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="err">{A.errors[error] ?? error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? '…' : mode === 'in' ? A.submitIn : A.submitUp}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError(null); }}>
          {mode === 'in' ? A.toUp : A.toIn}
        </button>
        <button type="button" className="btn ghost small" onClick={onClose}>{A.close}</button>
      </form>
    </div>
  );
}
