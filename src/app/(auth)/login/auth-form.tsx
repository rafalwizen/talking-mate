'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.push('/practice');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-lg border border-secondary-dark bg-secondary px-4 py-3 text-sm outline-none focus:border-primary"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className="rounded-lg border border-secondary-dark bg-secondary px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>
      <button
        type="button"
        onClick={() => { setIsLogin(!isLogin); setError(null); }}
        className="text-sm text-muted hover:text-foreground"
      >
        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </form>
  );
}
