'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const VoiceConversation = dynamic(
  () => import('@/components/conversation/VoiceConversation'),
  { ssr: false },
);

function SessionContent() {
  const searchParams = useSearchParams();
  const language = searchParams.get('lang') ?? 'en';
  const mode = searchParams.get('mode') ?? 'free_talk';
  const scenarioId = searchParams.get('scenario') ?? undefined;

  return (
    <VoiceConversation language={language} mode={mode} scenarioId={scenarioId} />
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <p className="text-muted">Loading session...</p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
