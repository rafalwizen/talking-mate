'use client';

import { cn } from '@/lib/utils';
import type { ConversationState } from '@/lib/constants';

interface MicButtonProps {
  state: ConversationState;
  onStart: () => void;
  onStop: () => void;
}

export default function MicButton({ state, onStart, onStop }: MicButtonProps) {
  const isActive = state === 'LISTENING' || state === 'PROCESSING' || state === 'SPEAKING';

  return (
    <div className="relative flex items-center justify-center">
      {state === 'LISTENING' && (
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-red-400/20" />
      )}
      <button
        onClick={isActive ? onStop : onStart}
        className={cn(
          'relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl transition-all',
          state === 'IDLE' && 'bg-primary text-white hover:bg-primary-dark',
          state === 'LISTENING' && 'bg-red-500 text-white scale-110',
          state === 'PROCESSING' && 'bg-amber-500 text-white animate-pulse',
          state === 'SPEAKING' && 'bg-blue-500 text-white',
        )}
        aria-label={isActive ? 'Stop' : 'Start'}
      >
        {state === 'IDLE' && '🎤'}
        {state === 'LISTENING' && '⏹'}
        {state === 'PROCESSING' && '⏳'}
        {state === 'SPEAKING' && '🔊'}
      </button>
    </div>
  );
}
