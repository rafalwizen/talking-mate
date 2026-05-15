import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  children: React.ReactNode;
}

export default memo(function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-primary text-white'
            : 'rounded-bl-md bg-secondary text-foreground',
        )}
      >
        {children}
      </div>
    </div>
  );
});
