import { Audio } from "expo-av";
import { useEffect, useState } from "react";

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

  return { correctSound, incorrectSound, winningSound };
  }
