'use client';

import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  interimTranscript?: string;
}

export default function ChatHistory({ messages, interimTranscript }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role as 'user' | 'assistant'}>
          {msg.content}
        </ChatBubble>
      ))}
      {interimTranscript && (
        <ChatBubble role="user">
          <span className="opacity-60">{interimTranscript}</span>
        </ChatBubble>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
