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
  conversationId: string;
}

export default function VoiceConversation({
  language,
  mode,
  scenarioId,
  conversationId,
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
    sendNow,
    error,
  } = useVoiceChat({ language, mode, scenarioId, conversationId });

  const statusText: Record<ConversationState, string> = {
    IDLE: 'Tap the mic to start',
    LISTENING: 'Listening... tap to send',
    PROCESSING: 'Thinking...',
    SPEAKING: 'Speaking...',
  };

  function handleStop() {
    if (state === CONVERSATION_STATES.LISTENING) {
      sendNow();
    } else {
      stopConversation();
    }
  }

  // Map AI SDK messages to a simpler format for ChatHistory
  const displayMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      // Extract text from parts array (AI SDK v6 format)
      const textParts =
        m.parts?.filter(
          (p): p is { type: 'text'; text: string } => p.type === 'text',
        ) ?? [];
      let content = textParts.map((p) => p.text).join('');
      // Fallback: if parts are empty, try content as string
      if (!content && typeof (m as unknown as Record<string, unknown>).content === 'string') {
        content = (m as unknown as Record<string, unknown>).content as string;
      }
      return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content,
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
            onStop={handleStop}
          />
          <p className="text-xs text-muted">
            {statusText[state as ConversationState] ?? ''}
          </p>
        </div>
      </div>
    </BrowserSupportWarning>
  );
}
