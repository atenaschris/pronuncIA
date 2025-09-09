import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export const usePlayback = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const playSound = async (uri: string) => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    setSound(newSound);
    setIsPlayingRecording(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlayingRecording(false);
      }
    });
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { playSound, isPlayingRecording };
};
