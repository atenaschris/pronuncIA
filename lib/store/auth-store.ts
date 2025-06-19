import { supabase } from '@/lib/supabase/client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createAnonymousProfile, fetchAndSetProfile, handleError, resetAuthState } from '../helpers/auth-utils';
import { AuthState, UserPreferences } from '../types/auth-types';
import { createSecureStorage } from '../storage/storage-utils';



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
            const profile = await fetchAndSetProfile(session.user.id);
            set({
              isAuthenticated: true,
              session,
              profile,
              isLoading: false,
              error: null
            });
          } else {
            set({
              isAuthenticated: false,
              session: null,
              profile: null,
              isLoading: false,
              error: null
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
          const currentState = get();
          
          // Prevent anonymous users from signing out
          if (currentState.isAnonymous) {
            return;
          }
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          resetAuthState(set);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      createOrUpsertProfile: async (preferences: UserPreferences, asAnonymous = false) => {
        try {
          if (asAnonymous) {
            createAnonymousProfile(preferences, set);
            return;
          }
          
          // If transitioning from anonymous to authenticated
          const currentState = get();
          if (currentState.isAnonymous && currentState.profile) {
            preferences = currentState.profile.preferences;
          }

          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session?.user) {
            // Allow anonymous users to continue using the app
            if (currentState.isAnonymous) return;
            throw new Error('Authentication required');
          }

          const { error: profileError } = await supabase.from('profiles').upsert({
            user_id: session.user.id,
            preferences,
            is_onboarded: true,
            anonymous_id: currentState.isAnonymous ? currentState.profile?.id : null
          }, { onConflict: 'user_id' });

          if (profileError) {
            throw new Error('Failed to save your preferences. Please try again.');
          }

          const profile = await fetchAndSetProfile(session.user.id);
          set({ profile, error: null, isAnonymous: false });

        } catch (error) {
          handleError(error as Error, set);
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
      storage: createJSONStorage(() => createSecureStorage()),
    }
  )
);
