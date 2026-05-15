'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <p className="text-sm text-success">Check your email to confirm your account.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Go to sign in
        </button>
      </div>
    );
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
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
      <button
        type="button"
        onClick={() => router.push('/login')}
        className="text-sm text-muted hover:text-foreground"
      >
        Already have an account? Sign in
      </button>
    </form>
  );
}
