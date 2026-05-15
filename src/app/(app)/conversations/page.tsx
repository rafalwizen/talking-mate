'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { LANGUAGES } from '@/lib/constants';
import type { Conversation } from '@/types';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-muted">No conversations yet</p>
        <a
          href="/practice"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Start practicing
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Conversation History</h1>
      <div className="flex flex-col gap-2">
        {conversations.map((conv) => {
          const lang = LANGUAGES[conv.language as keyof typeof LANGUAGES];
          return (
            <div
              key={conv.id}
              className="flex items-center justify-between rounded-xl border border-secondary-dark bg-secondary p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang?.flag}</span>
                  <span className="text-sm font-medium">
                    {conv.title ?? `${lang?.name ?? conv.language} — ${conv.mode}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(conv.updated_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(conv.id)}
                className="text-xs text-muted hover:text-danger"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
