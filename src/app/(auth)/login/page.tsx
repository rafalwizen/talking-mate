import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthForm from './auth-form';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/practice');
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">TalkingMate</h1>
          <p className="mt-2 text-muted">Sign in to practice languages</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
