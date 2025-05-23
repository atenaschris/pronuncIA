import { Session } from "@supabase/supabase-js";
import { LanguageLevel, LearningGoal, LearningStyle, NativeLanguageCode, TimeCommitment } from "./onboarding-types";

export type UserPreferences = {
    language_level: LanguageLevel;
    native_language: NativeLanguageCode;
    learning_goal: LearningGoal;
    time_commitment: TimeCommitment;
    learning_style: LearningStyle;
  };
  
  type Profile = {
    id: string;
    created_at: string;
    user_id: string;
    preferences: UserPreferences;
    is_onboarded: boolean;
  };
  
  export interface AuthState {
    isAuthenticated: boolean;
    session: Session | null;
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
    isAnonymous: boolean;
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;
    signInWithEmail: (email: string) => Promise<void>;
    createOrUpsertProfile: (preferences: UserPreferences, asAnonymous?: boolean) => Promise<void>;
    checkAuth: () => Promise<void>;
    canAccessFeature: (feature: string) => boolean;
  }