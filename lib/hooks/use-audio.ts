import { Audio } from "expo-av";
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from "react";
import { useOnboardingStore } from "../store/onboarding-store";

  export const useAudio = () => {
    const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
    const [incorrectSound, setIncorrectSound] = useState<Audio.Sound | null>(null);
    const [winningSound, setWinningSound] = useState<Audio.Sound | null>(null);
      // Load audio files
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(
          require('../../assets/sounds/correct.mp3')
        );
        const { sound: incorrect } = await Audio.Sound.createAsync(
          require('../../assets/sounds/incorrect.mp3')
        );
        const { sound: winning } = await Audio.Sound.createAsync(
          require('../../assets/sounds/win.mp3')
        );
        
        setCorrectSound(correct);
        setIncorrectSound(incorrect);
        setWinningSound(winning);
      } catch (error) {
        console.warn('Failed to load audio files:', error);
      }
    };

    loadAudio();

    // Cleanup function
    return () => {
      correctSound?.unloadAsync();
      incorrectSound?.unloadAsync();
      winningSound?.unloadAsync();
    };
  }, []);

  const playCorrect = async () => {
    if (correctSound) {
      await correctSound.replayAsync();
    }
  };

  const playIncorrect = async () => {
    if (incorrectSound) {
      await incorrectSound.replayAsync();
    }
  };

  const playWin = async () => {
    if (winningSound) {
      await winningSound.replayAsync();
    }
  };

  const playWordAudio = useCallback((word: string) => {
    try {
      const onboarding = useOnboardingStore.getState();
      const target = onboarding?.targetLanguage || 'en';
      const speechLocales: Record<string, string> = {
        en: 'en-US',
        it: 'it-IT',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        pt: 'pt-PT',
        ru: 'ru-RU',
        zh: 'zh-CN',
        ja: 'ja-JP',
        ko: 'ko-KR',
        ar: 'ar-SA',
      };
      const language = speechLocales[target] || 'en-US';
      Speech.speak(word, {
        language,
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.warn('Failed to play word audio:', error);
    }
  }, []);

  return { 
    correctSound, 
    incorrectSound, 
    winningSound,
    playCorrect,
    playIncorrect,
    playWin,
    playWordAudio
  };
  }
