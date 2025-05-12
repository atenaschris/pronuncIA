import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';

import { LanguageLevel, LearningGoal, LearningStyle, NativeLanguageCode } from './onboarding-store';

type UserPreferences = {
  language_level: LanguageLevel;
  native_language: NativeLanguageCode;
  learning_goal: LearningGoal;
  time_commitment: number;
  learning_style: LearningStyle;
};

type Profile = {
  id: string;
  created_at: string;
  user_id: string;
  preferences: UserPreferences;
  is_onboarded: boolean;
};

interface AuthState {
  isAuthenticated: boolean;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isAnonymous: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  createProfile: (preferences: UserPreferences, asAnonymous?: boolean) => Promise<void>;
  checkAuth: () => Promise<void>;
  canAccessFeature: (feature: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      session: null,
      profile: null,
      isLoading: true,
      error: null,
      isAnonymous: false,

      setSession: (session) =>
        set({ isAuthenticated: !!session, session }),

      checkAuth: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (session?.user) {
            const { data: rawProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            const profile = rawProfile ? {
              ...rawProfile,
              preferences: rawProfile.preferences as UserPreferences,
              is_onboarded: rawProfile.is_onboarded ?? false
            } : null;

            set({
              isAuthenticated: true,
              session,
              profile,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              session: null,
              profile: null,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      signInWithEmail: async (email: string) => {
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: 'pronuncia://auth/callback',
            },
          });
          if (error) throw error;
          set({ error: null });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      signOut: async () => {
        try {
          // If user is anonymous, just reset the state
          if (get().isAnonymous) {
            set({
              isAuthenticated: false,
              session: null,
              profile: null,
              error: null,
              isAnonymous: false
            });
            return;
          }
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({
            isAuthenticated: false,
            session: null,
            profile: null,
            error: null,
            isAnonymous: false
          });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      createProfile: async (preferences: UserPreferences, asAnonymous = false) => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          // Allow anonymous profile creation
          if (asAnonymous) {
            set({
              profile: {
                id: 'anonymous',
                created_at: new Date().toISOString(),
                user_id: 'anonymous',
                preferences,
                is_onboarded: true
              },
              isAnonymous: true,
              error: null
            });
            return;
          }
          
          if (sessionError) throw new Error('Authentication required');
          if (!session?.user) throw new Error('Please sign in to continue');

          const { error: profileError } = await supabase.from('profiles').upsert({
            user_id: session.user.id,
            preferences,
            is_onboarded: true,
          }, { onConflict: 'user_id' });

          if (profileError) {
            throw new Error('Failed to save your preferences. Please try again.');
          }

          const { data: rawProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (fetchError) throw new Error('Failed to retrieve your profile');

          const profile = {
            ...rawProfile,
            preferences: rawProfile.preferences as UserPreferences,
            is_onboarded: true
          };

          set({
            profile,
            error: null,
          });
        } catch (error) {
          const message = (error as Error).message;
          set({ error: message });
          throw error; // Re-throw to handle in the UI
        }
      },

      canAccessFeature: (feature: string) => {
        const { isAuthenticated, profile } = get();
        
        // Features that don't require authentication
        const publicFeatures = [
          'demo_lessons',
          'public_articles',
          'tutor_preview',
          'app_navigation',
          'onboarding_content'
        ];

        if (publicFeatures.includes(feature)) {
          return true;
        }

        // Features that require authentication
        const authFeatures = [
          'live_tutor_session',
          'personalized_plan',
          'progress_sync',
          'subscription',
          'saved_articles',
          'speaking_contests'
        ];

        return isAuthenticated && authFeatures.includes(feature);
      },
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