'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/Button';

const VoiceConversation = dynamic(
  () => import('@/components/conversation/VoiceConversation'),
  { ssr: false },
);

function SessionContent() {
  const searchParams = useSearchParams();
  const language = searchParams.get('lang') ?? 'en';
  const mode = searchParams.get('mode') ?? 'free_talk';
  const scenarioId = searchParams.get('scenario') ?? undefined;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, mode, scenarioId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create conversation');
      }
      const { conversation } = await res.json();
      setConversationId(conversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Button onClick={handleStart}>Retry</Button>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-medium">Ready to practice?</p>
        <Button size="lg" onClick={handleStart} disabled={loading}>
          {loading ? 'Preparing...' : 'Start Session'}
        </Button>
      </div>
    );
  }

  return (
    <VoiceConversation
      language={language}
      mode={mode}
      scenarioId={scenarioId}
      conversationId={conversationId}
    />
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
