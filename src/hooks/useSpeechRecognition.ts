'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export function useSpeechRecognition(lang: string): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldKeepListeningRef = useRef(false);

  // Feature-detect SpeechRecognition API
  const isSupported =
    typeof window !== 'undefined' &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions.');
          shouldKeepListeningRef.current = false;
          setIsListening(false);
          break;
        case 'no-speech':
          // Silence detected - don't treat as a hard error, just log it
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error occurred. Please check your connection.');
          shouldKeepListeningRef.current = false;
          setIsListening(false);
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
          break;
      }
    };

    recognition.onend = () => {
      // Auto-restart if user hasn't explicitly stopped
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // If restart fails (e.g. recognition already started), ignore
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [isSupported, lang]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Clean up any existing recognition instance
    if (recognitionRef.current) {
      shouldKeepListeningRef.current = false;
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore errors during abort
      }
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    shouldKeepListeningRef.current = true;
    setError(null);
    setTranscript('');
    setInterimTranscript('');

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError('Failed to start speech recognition.');
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors during stop
      }
    }

    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Update language when it changes while listening
  useEffect(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.lang = lang;
    }
  }, [lang, isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}
