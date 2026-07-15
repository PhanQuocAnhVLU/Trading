import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../shared/lib/firebase';
import { useAuthStore } from './store/authStore';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1-.2.2-.4.4-.6.6z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.6 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.6C41.8 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export default function GoogleSignInButton({ onSuccess }) {
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const outcome = await loginWithGoogle(result.user);
      if (!outcome.ok) {
        setError(outcome.error);
        return;
      }
      onSuccess?.();
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 bg-white text-[#1F1F1F] text-sm font-semibold py-2.5 rounded-md border border-border hover:bg-white/90 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black/60 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Đăng nhập bằng Google
      </button>
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </div>
  );
}
