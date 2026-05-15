'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useConversationState } from '@/hooks/useConversationState';
import { CONVERSATION_STATES, TTS_SENTENCE_REGEX } from '@/lib/constants';
import type { ConversationMode } from '@/lib/constants';

interface UseVoiceChatParams {
  language: string;
  mode: string;
  scenarioId?: string;
  conversationId?: string;
}

interface UseVoiceChatReturn {
  state: string;
  messages: ReturnType<typeof useChat>['messages'];
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  startConversation: () => void;
  stopConversation: () => void;
  error: string | null;
}

export function useVoiceChat({
  language,
  mode,
  scenarioId,
  conversationId,
}: UseVoiceChatParams): UseVoiceChatReturn {
  // Use refs for values that the transport body callback needs
  // so the transport doesn't recreate on every param change
  const languageRef = useRef(language);
  const modeRef = useRef(mode);
  const scenarioIdRef = useRef(scenarioId);

  // Keep refs in sync with props
  useEffect(() => {
    languageRef.current = language;
  }, [language]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    scenarioIdRef.current = scenarioId;
  }, [scenarioId]);

  // Create transport once — refs ensure body always reads current values
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({
          language: languageRef.current,
          mode: modeRef.current as ConversationMode,
          scenarioId: scenarioIdRef.current,
        }),
      }),
    []
  );

  const chat = useChat({
    id: conversationId,
    transport,
  });

  const {
    state,
    transitionToListening,
    transitionToProcessing,
    transitionToSpeaking,
    transitionToIdle,
    handleBargeIn,
  } = useConversationState();

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: isRecognitionSupported,
    error: recognitionError,
  } = useSpeechRecognition(language);

  const {
    speak,
    stop: stopTTS,
    isSpeaking,
    isSupported: isSynthesisSupported,
  } = useSpeechSynthesis(language);

  // Track whether conversation is active (user started it and hasn't stopped)
  const isActiveRef = useRef(false);
  // Track the last spoken text to avoid re-speaking already spoken content
  const spokenTextRef = useRef('');
  // Track the last processed message index to avoid processing old messages
  const lastProcessedMessageIdRef = useRef<string>('');
  // Timer ref for auto-restart delay
  const autoRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  // Track whether we've already transitioned to speaking for current response
  const hasTransitionedToSpeakingRef = useRef(false);

  const isSupported = isRecognitionSupported && isSynthesisSupported;

  // Clear any pending auto-restart timer
  const clearAutoRestartTimer = useCallback(() => {
    if (autoRestartTimerRef.current !== null) {
      clearTimeout(autoRestartTimerRef.current);
      autoRestartTimerRef.current = null;
    }
  }, []);

  // Start the conversation loop
  const startConversation = useCallback(() => {
    if (!isSupported) return;

    isActiveRef.current = true;
    spokenTextRef.current = '';
    hasTransitionedToSpeakingRef.current = false;

    transitionToListening();
    startListening();
  }, [isSupported, transitionToListening, startListening]);

  // Stop the conversation entirely
  const stopConversation = useCallback(() => {
    isActiveRef.current = false;
    clearAutoRestartTimer();

    stopListening();
    stopTTS();
    transitionToIdle();
  }, [stopListening, stopTTS, transitionToIdle, clearAutoRestartTimer]);

  // When speech recognition produces a final transcript, send it to the AI
  useEffect(() => {
    if (!isActiveRef.current || !transcript) return;
    // Only send when we're in the LISTENING state
    if (state !== CONVERSATION_STATES.LISTENING) return;

    const finalTranscript = transcript.trim();
    if (!finalTranscript) return;

    // Stop listening while processing
    stopListening();
    transitionToProcessing();

    // Send the transcript to the AI
    chat
      .sendMessage({ text: finalTranscript })
      .catch((err) => {
        console.error('Failed to send message:', err);
        // On error, go back to idle
        if (isActiveRef.current) {
          transitionToIdle();
        }
      });

    // Note: transcript is managed by useSpeechRecognition, which resets on startListening
  }, [transcript, state, stopListening, transitionToProcessing, transitionToIdle, chat]);

  // Watch chat status and stream incoming assistant text for TTS
  useEffect(() => {
    const status = chat.status;

    // When streaming starts, transition to speaking
    if (status === 'streaming') {
      if (!hasTransitionedToSpeakingRef.current) {
        hasTransitionedToSpeakingRef.current = true;
        transitionToSpeaking();
      }

      // Find the last assistant message
      const lastAssistantMsg = [...chat.messages]
        .reverse()
        .find((msg) => msg.role === 'assistant');

      if (!lastAssistantMsg) return;

      // Avoid re-processing the same message
      if (lastAssistantMsg.id === lastProcessedMessageIdRef.current) {
        // Check if there's new text since last spoken
        const textParts = lastAssistantMsg.parts
          ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          ?? [];
        const fullText = textParts.map((p) => p.text).join('');

        if (fullText.length > spokenTextRef.current.length) {
          const newText = fullText.slice(spokenTextRef.current.length);

          // Extract complete sentences from the new text
          const sentenceMatches = newText.match(TTS_SENTENCE_REGEX);
          if (sentenceMatches && sentenceMatches.length > 0) {
            // Check if there's remaining incomplete text after the sentences
            const lastMatch = sentenceMatches[sentenceMatches.length - 1];
            const lastMatchIndex = newText.lastIndexOf(lastMatch);
            const remaining = newText.slice(
              lastMatchIndex + lastMatch.length
            );

            // Update spoken text marker to include everything up to the incomplete part
            spokenTextRef.current =
              fullText.slice(0, spokenTextRef.current.length) +
              newText.slice(0, lastMatchIndex + lastMatch.length);

            // Speak only the complete sentences
            speak(sentenceMatches.join(' '));
          }
        }
        return;
      }

      // New message — reset tracking
      lastProcessedMessageIdRef.current = lastAssistantMsg.id;
      spokenTextRef.current = '';

      const textParts = lastAssistantMsg.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        ?? [];
      const fullText = textParts.map((p) => p.text).join('');

      // Extract complete sentences from the streamed text so far
      const sentenceMatches = fullText.match(TTS_SENTENCE_REGEX);
      if (sentenceMatches && sentenceMatches.length > 0) {
        const lastMatch = sentenceMatches[sentenceMatches.length - 1];
        const lastMatchIndex = fullText.lastIndexOf(lastMatch);

        // Track what we've spoken
        spokenTextRef.current = fullText.slice(
          0,
          lastMatchIndex + lastMatch.length
        );

        speak(sentenceMatches.join(' '));
      }
    }

    // When streaming is done (ready state), speak any remaining text
    if (status === 'ready') {
      const lastAssistantMsg = [...chat.messages]
        .reverse()
        .find((msg) => msg.role === 'assistant');

      if (lastAssistantMsg) {
        const textParts = lastAssistantMsg.parts
          ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          ?? [];
        const fullText = textParts.map((p) => p.text).join('');

        const remaining = fullText.slice(spokenTextRef.current.length).trim();
        if (remaining) {
          spokenTextRef.current = fullText;
          speak(remaining);
        }
      }

      // Reset for next response
      hasTransitionedToSpeakingRef.current = false;
    }
  }, [chat.status, chat.messages, transitionToSpeaking, speak]);

  // When TTS finishes speaking and conversation is active, auto-restart listening
  useEffect(() => {
    if (!isSpeaking && isActiveRef.current && state === CONVERSATION_STATES.SPEAKING) {
      // Check if chat is done streaming
      if (chat.status === 'ready' || chat.status === 'error') {
        transitionToIdle();

        // Auto-restart listening after a short pause
        clearAutoRestartTimer();
        autoRestartTimerRef.current = setTimeout(() => {
          if (isActiveRef.current) {
            spokenTextRef.current = '';
            hasTransitionedToSpeakingRef.current = false;
            transitionToListening();
            startListening();
          }
        }, 300);
      }
    }
  }, [isSpeaking, state, chat.status, transitionToIdle, transitionToListening, startListening, clearAutoRestartTimer]);

  // Handle barge-in: when user starts speaking during TTS, stop the audio
  useEffect(() => {
    if (isListening && state === CONVERSATION_STATES.SPEAKING && isActiveRef.current) {
      stopTTS();
      clearAutoRestartTimer();
      handleBargeIn();
    }
  }, [isListening, state, stopTTS, handleBargeIn, clearAutoRestartTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      clearAutoRestartTimer();
    };
  }, [clearAutoRestartTimer]);

  // Determine combined error state
  const error =
    recognitionError ??
    (chat.error?.message ?? null);

  return {
    state,
    messages: chat.messages,
    transcript,
    interimTranscript,
    isListening,
    isSpeaking,
    isSupported,
    startConversation,
    stopConversation,
    error,
  };
}
