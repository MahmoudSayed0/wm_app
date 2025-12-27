import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, CountryCode } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  detectedCountry: CountryCode;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setDetectedCountry: (country: CountryCode) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  detectedCountry: 'EG',
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setSession: (session) => set({ session }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      setDetectedCountry: (country) => set({ detectedCountry: country }),

      reset: () =>
        set({
          ...initialState,
          isLoading: false,
        }),
    }),
    {
      name: 'washman-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Persist user for demo mode (user.id starts with 'demo-')
        user: state.user?.id?.startsWith('demo-') ? state.user : null,
        profile: state.profile,
        detectedCountry: state.detectedCountry,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectProfile = (state: AuthState) => state.profile;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
