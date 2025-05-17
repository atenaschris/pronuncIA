import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  setSession: (session: Session | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      session: null,
      setSession: (session) =>
        set({ isAuthenticated: !!session, session }),
      signOut: () =>
        set({ isAuthenticated: false, session: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          return await SecureStore.getItemAsync(name);
        },
        setItem: async (name: string, value: string) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name: string) => {
          await SecureStore.deleteItemAsync(name);
        }
      } as StateStorage)),
    }
  )
);