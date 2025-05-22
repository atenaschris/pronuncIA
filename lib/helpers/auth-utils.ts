import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { AuthState, UserPreferences } from '../types/auth-types';

type AuthSetState = Parameters<StateCreator<AuthState>>[0];

export const resetAuthState = (set: AuthSetState) => {
  set({
    isAuthenticated: false,
    session: null,
    profile: null,
    error: null,
    isAnonymous: false
  });
};

export const handleError = (error: Error, set: AuthSetState) => {
  set({ error: error.message });
  throw error;
};

export const createAnonymousProfile = (preferences: UserPreferences, set: AuthSetState) => {
  const anonymousId = uuidv4();
  set({
    profile: {
      id: anonymousId,
      created_at: new Date().toISOString(),
      user_id: anonymousId,
      preferences,
      is_onboarded: true
    },
    isAnonymous: true,
    error: null
  });
};

export const fetchAndSetProfile = async (userId: string) => {
  const { data: rawProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError) throw new Error('Failed to retrieve your profile');

  const profile = rawProfile ? {
    ...rawProfile,
    preferences: rawProfile.preferences as UserPreferences,
    is_onboarded: rawProfile.is_onboarded ?? false
  } : null;

  return profile;
};