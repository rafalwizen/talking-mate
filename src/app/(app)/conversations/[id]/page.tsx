'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatBubble from '@/components/ui/ChatBubble';
import Button from '@/components/ui/Button';
import type { Conversation, Message } from '@/types';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/conversations/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages ?? []);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col max-w-lg mx-auto">
      <div className="flex items-center gap-3 border-b border-secondary-dark px-4 py-3">
        <button onClick={() => router.back()} className="text-sm text-muted hover:text-foreground">
          Back
        </button>
        <h1 className="text-sm font-medium">
          {conversation?.title ?? 'Conversation'}
        </h1>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages
          .filter((m) => m.role !== 'system')
          .map((msg) => (
            <ChatBubble key={msg.id} role={msg.role as 'user' | 'assistant'}>
              {msg.content}
            </ChatBubble>
          ))}
      </div>
      <div className="border-t border-secondary-dark px-4 py-3">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() =>
            router.push(
              `/practice/session?lang=${conversation?.language}&mode=${conversation?.mode}${conversation?.scenario_id ? `&scenario=${conversation.scenario_id}` : ''}`,
            )
          }
        >
          Resume conversation
        </Button>
      </div>
    </div>
  );
}
