import { useState, useEffect, useRef } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@chaukanna/shared';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const speak = (text: string, lang: SupportedLanguage = 'en', rate: number = 0.95) => {
    if (!isSupported || !text) return;

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = SUPPORTED_LANGUAGES[lang]?.speechLocale || 'en-IN';
    utterance.lang = targetLocale;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Attempt to pick a matching voice if present
    if (voices.length > 0) {
      const match = voices.find(v => v.lang === targetLocale || v.lang.startsWith(lang));
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error/interruption:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  return {
    isSupported,
    isPlaying,
    isPaused,
    speak,
    stop,
    pause,
    resume,
  };
}
