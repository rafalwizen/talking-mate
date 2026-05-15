import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Talking<span className="text-primary">Mate</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Learn languages through natural voice conversations with AI.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-3xl">
          <span>🇬🇧</span>
          <span>🇩🇪</span>
          <span>🇪🇸</span>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl">🎤</div>
            <p className="mt-1 text-xs text-muted">Speak naturally</p>
          </div>
          <div>
            <div className="text-2xl">🤖</div>
            <p className="mt-1 text-xs text-muted">AI responds</p>
          </div>
          <div>
            <div className="text-2xl">🔊</div>
            <p className="mt-1 text-xs text-muted">Hear & learn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
