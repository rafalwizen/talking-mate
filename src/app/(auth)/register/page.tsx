import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RegisterForm from './register-form';

export default async function RegisterPage() {
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
          <p className="mt-2 text-muted">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
