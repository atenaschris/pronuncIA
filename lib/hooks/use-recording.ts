import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        console.log('Timer cleaned up on unmount');
      }
    };
  }, []);
  
  // Effect to ensure timer persists when isRecording is true
  useEffect(() => {
    if (isRecording && !timerRef.current) {
      console.log('Restarting timer due to state inconsistency');
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          console.log('Recording duration updated (recovery):', newDuration);
          return newDuration;
        });
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      console.log('Clearing timer due to recording stop');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.log('Permission to access microphone denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // Clear any existing timer first
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer after state updates
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          console.log('Recording duration updated:', newDuration);
          return newDuration;
        });
      }, 1000);
      
      console.log('Recording started, timer initialized');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      setIsRecording(false);
      setRecordingUri(uri);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      return uri;
    } catch (err) {
      console.error('Failed to stop recording', err);
      return null;
    }
  }, [recording]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Use ref to access current recording without dependency
    if (recording) {
      recording.stopAndUnloadAsync();
    }
  }, []); // Remove recording dependency to prevent useEffect re-runs

  return {
    recording,
    recordingUri,
    isProcessing,
    isRecording,
    recordingDuration,
    setIsProcessing,
    setRecordingUri,
    startRecording,
    stopRecording,
    cleanup,
  };
}