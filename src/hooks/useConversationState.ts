'use client';

import { useCallback, useState } from 'react';
import { CONVERSATION_STATES, type ConversationState } from '@/lib/constants';

interface UseConversationStateReturn {
  state: ConversationState;
  transitionToListening: () => void;
  transitionToProcessing: () => void;
  transitionToSpeaking: () => void;
  transitionToIdle: () => void;
  handleBargeIn: () => void;
}

export function useConversationState(): UseConversationStateReturn {
  const [state, setState] = useState<ConversationState>(
    CONVERSATION_STATES.IDLE
  );

  const transitionToListening = useCallback(() => {
    setState(CONVERSATION_STATES.LISTENING);
  }, []);

  const transitionToProcessing = useCallback(() => {
    setState(CONVERSATION_STATES.PROCESSING);
  }, []);

  const transitionToSpeaking = useCallback(() => {
    setState(CONVERSATION_STATES.SPEAKING);
  }, []);

  const transitionToIdle = useCallback(() => {
    setState(CONVERSATION_STATES.IDLE);
  }, []);

  // Barge-in only transitions from SPEAKING to LISTENING — ignores other states
  const handleBargeIn = useCallback(() => {
    setState((current) => {
      if (current === CONVERSATION_STATES.SPEAKING) {
        return CONVERSATION_STATES.LISTENING;
      }
      return current;
    });
  }, []);

  return {
    state,
    transitionToListening,
    transitionToProcessing,
    transitionToSpeaking,
    transitionToIdle,
    handleBargeIn,
  };
}
