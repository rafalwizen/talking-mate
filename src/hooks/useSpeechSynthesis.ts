'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TTS_SENTENCE_REGEX } from '@/lib/constants';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSpeakingRef: React.RefObject<boolean>;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(lang: string): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Synchronous ref mirroring isSpeaking state (avoids React batching race conditions)
  const isSpeakingRef = useRef(false);
  // Keep utterance references alive to prevent iOS garbage collection
  const utteranceRefsRef = useRef<SpeechSynthesisUtterance[]>([]);
  // Track whether we should continue speaking the next sentence
  const shouldContinueRef = useRef(false);
  // Queue of sentences to speak
  const sentenceQueueRef = useRef<string[]>([]);

  const isSupported =
    typeof window !== 'undefined' && !!window.speechSynthesis;

  // Extract language prefix for voice filtering (e.g. 'en' from 'en-US')
  const langPrefix = lang.split('-')[0];

  // Load voices asynchronously (Chrome fires voiceschanged event)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const filtered = allVoices.filter(
        (voice) =>
          voice.lang.startsWith(langPrefix) || voice.lang === lang
      );
      setVoices(filtered);
    };

    // Try loading immediately (works in Firefox/Safari)
    loadVoices();

    // Also listen for voiceschanged (Chrome loads voices async)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, lang, langPrefix]);

  // Speak the next sentence from the queue
  const speakNextSentence = useCallback(() => {
    if (!isSupported) return;

    const nextSentence = sentenceQueueRef.current.shift();
    if (!nextSentence || !shouldContinueRef.current) {
      // Queue empty or stopped — done speaking
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      utteranceRefsRef.current = [];
      return;
    }

    const utterance = new SpeechSynthesisUtterance(nextSentence);
    // Always set lang explicitly — critical for Android compatibility
    utterance.lang = lang;

    // Pick a voice that matches the language
    const matchingVoice = voices.find(
      (v) => v.lang === lang || v.lang.startsWith(langPrefix)
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      // Speak the next sentence in the queue
      speakNextSentence();
    };

    utterance.onerror = (event) => {
      // Only report real errors, not cancelation
      if (event.error !== 'canceled') {
        console.error('TTS error:', event.error);
      }
      // Continue with next sentence even on error
      speakNextSentence();
    };

    // Keep reference alive to prevent iOS GC from destroying utterance
    utteranceRefsRef.current.push(utterance);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, lang, langPrefix, voices]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return;

      // Split text into sentences using the project's regex
      const matches = text.match(TTS_SENTENCE_REGEX);
      const sentences = matches?.length
        ? matches.map((s) => s.trim()).filter(Boolean)
        : [text.trim()];

      if (sentences.length === 0) return;

      const wasAlreadySpeaking = shouldContinueRef.current;

      // Append sentences to the queue
      sentenceQueueRef.current.push(...sentences);
      shouldContinueRef.current = true;
      isSpeakingRef.current = true;
      setIsSpeaking(true);

      if (!wasAlreadySpeaking) {
        // No active speech — start playing from the front of the queue
        speakNextSentence();
      }
      // If already speaking, the onend handler will pick up the new sentences
    },
    [isSupported, speakNextSentence]
  );

  const stop = useCallback(() => {
    shouldContinueRef.current = false;
    sentenceQueueRef.current = [];

    if (isSupported) {
      window.speechSynthesis.cancel();
    }

    utteranceRefsRef.current = [];
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldContinueRef.current = false;
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSpeakingRef,
    isSupported,
    voices,
  };
}
