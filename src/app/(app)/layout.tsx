import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-secondary-dark px-4 py-3">
        <a href="/practice" className="text-lg font-bold text-primary">TalkingMate</a>
        <div className="flex items-center gap-3">
          <a href="/conversations" className="text-sm text-muted hover:text-foreground">History</a>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
