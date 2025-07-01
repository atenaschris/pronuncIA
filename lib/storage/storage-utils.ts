import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Create MMKV instances for different data types
export const appStorage = new 
MMKV({
  id: 'app-storage',
  encryptionKey: undefined, // No encryption for non-sensitive data
});

export const userDataStorage = new MMKV({
  id: 'user-data-storage',
  encryptionKey: undefined, // No encryption for user preferences and lesson data
});

// MMKV storage adapter for Zustand
export const createMMKVStorage = (storage: MMKV): StateStorage => ({
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
});

// SecureStore adapter for sensitive data (auth tokens, credentials)
export const createSecureStorage = (): StateStorage => ({
  getItem: async (name: string) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
});

// Helper functions for storage management
export const clearAppStorage = (): void => {
  appStorage.clearAll();
};

export const clearUserDataStorage = (): void => {
  userDataStorage.clearAll();
};

export const getAppStorageSize = (): number => {
  return appStorage.getAllKeys().length;
};

export const getUserDataStorageSize = (): number => {
  return userDataStorage.getAllKeys().length;
};