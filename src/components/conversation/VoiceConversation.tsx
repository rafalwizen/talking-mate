'use client';

import { useVoiceChat } from '@/hooks/useVoiceChat';
import BrowserSupportWarning from '@/components/ui/BrowserSupportWarning';
import ChatHistory from '@/components/ui/ChatHistory';
import MicButton from '@/components/ui/MicButton';
import VoiceVisualizer from '@/components/ui/VoiceVisualizer';
import { CONVERSATION_STATES } from '@/lib/constants';
import type { ConversationState } from '@/lib/constants';

interface VoiceConversationProps {
  language: string;
  mode: string;
  scenarioId?: string;
}

export default function VoiceConversation({
  language,
  mode,
  scenarioId,
}: VoiceConversationProps) {
  const {
    state,
    messages,
    transcript,
    interimTranscript,
    isListening,
    isSpeaking,
    isSupported,
    startConversation,
    stopConversation,
    error,
  } = useVoiceChat({ language, mode, scenarioId });

  const statusText: Record<ConversationState, string> = {
    IDLE: 'Tap the mic to start',
    LISTENING: 'Listening...',
    PROCESSING: 'Thinking...',
    SPEAKING: 'Speaking...',
  };

  // Map AI SDK messages to a simpler format for ChatHistory
  const displayMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const textParts =
        m.parts?.filter(
          (p): p is { type: 'text'; text: string } => p.type === 'text',
        ) ?? [];
      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: textParts.map((p) => p.text).join(''),
      };
    })
    .filter((m) => m.content.length > 0);

  return (
    <BrowserSupportWarning>
      <div className="flex h-dvh flex-col bg-background">
        <ChatHistory messages={displayMessages} interimTranscript={interimTranscript} />

        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-danger dark:bg-red-950">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-secondary-dark bg-background px-4 py-4">
          <VoiceVisualizer active={isListening || isSpeaking} />
          <MicButton
            state={state as ConversationState}
            onStart={startConversation}
            onStop={stopConversation}
          />
          <p className="text-xs text-muted">
            {statusText[state as ConversationState] ?? ''}
          </p>
        </div>
      </div>
    </BrowserSupportWarning>
  );
}
