import React, { useEffect, createContext, useContext, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase, setDemoUser, getDemoUserId, loadDemoUserId, clearDemoUserId } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  signUpWithPhone: (phone: string, password: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string, isSignup?: boolean) => Promise<{ error: Error | null; user: User | null; isNewUser?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setLoading, reset } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  // Use ref to store userId - avoids closure issues with callbacks
  const currentUserIdRef = useRef<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        // Load demo user ID from storage first
        const storedDemoUserId = await loadDemoUserId();
        if (storedDemoUserId) {
          console.log('Loaded demo user ID from storage:', storedDemoUserId);
          currentUserIdRef.current = storedDemoUserId;
        }

        // Demo users are now real Supabase users, so just check for session normally
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          currentUserIdRef.current = session.user.id;

          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setProfile(profile);
          }
        } else {
          setUser(null);
          setSession(null);
          currentUserIdRef.current = null;
        }
      } catch (error) {
        console.error('Auth init error:', error);
        reset();
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session) {
          setSession(session);
          setUser(session.user);
          currentUserIdRef.current = session.user.id;

          // Fetch profile on sign in
          if (event === 'SIGNED_IN') {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setProfile(profile);
            }
          }
        } else {
          reset();
          currentUserIdRef.current = null;
        }
      }
    );

    // Handle app state changes for token refresh
    const handleAppStateChange = async (state: AppStateStatus) => {
      if (state === 'active') {
        await supabase.auth.startAutoRefresh();
      } else {
        await supabase.auth.stopAutoRefresh();
      }
    };

    const subscription2 = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.unsubscribe();
      subscription2.remove();
    };
  }, []);

  // Sign in with phone - sends OTP
  const signInWithPhone = async (phone: string): Promise<{ error: Error | null }> => {
    try {
      // Demo mode - skip real SMS
      const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

      if (isDemoMode) {
        // In demo mode, we'll just pretend the OTP was sent
        console.log('Demo mode: OTP would be sent to', phone);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  // Sign up with phone and password - sends OTP for verification
  const signUpWithPhone = async (phone: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

      if (isDemoMode) {
        // In demo mode, we'll just pretend the OTP was sent
        console.log('Demo mode: Signup OTP would be sent to', phone);
        return { error: null };
      }

      // For real signup, we use signInWithOtp which will create or sign in the user
      // The password will be set after OTP verification
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
          data: {
            password, // Store password temporarily to set after verification
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  // Verify OTP
  const verifyOtp = async (
    phone: string,
    token: string,
    isSignup: boolean = false
  ): Promise<{ error: Error | null; user: User | null; isNewUser?: boolean }> => {
    try {
      const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
      console.log('verifyOtp called. isDemoMode:', isDemoMode, 'token:', token, 'isSignup:', isSignup);

      if (isDemoMode && token === '123456') {
        // Demo mode - Use anonymous sign-in so RLS policies work
        const userCountry = phone.startsWith('+971') ? 'AE' : 'EG';

        // Sign in anonymously
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();

        if (anonError) {
          console.error('Anonymous sign-in error:', anonError);
          throw anonError;
        }

        const user = anonData.user;
        const session = anonData.session;

        if (!user || !session) {
          throw new Error('Failed to create anonymous user');
        }

        console.log('Demo mode: Signed in anonymously with user', user.id);

        // Set session and user in store immediately
        setSession(session);
        setUser(user);
        currentUserIdRef.current = user.id;
        console.log('Set currentUserIdRef to:', user.id);

        // Check if profile exists
        let isNewUser = isSignup;
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            // Create minimal profile - user will complete it in onboarding
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: '',
              phone,
              country: userCountry,
              language: 'en',
              push_enabled: true,
              biometric_enabled: false,
              onboarding_completed: false,
            });
            console.log('Created demo user profile in database');
            isNewUser = true;
          } else {
            // Check if onboarding is completed
            isNewUser = !existingProfile.onboarding_completed;
            setProfile(existingProfile);
          }
        } catch (dbError) {
          console.log('Profile check/create:', dbError);
          isNewUser = true;
        }

        // Fetch profile for local state
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfile(profile);
        }

        // Store the demo user (this persists to AsyncStorage now)
        setDemoUser(user);
        console.log('Demo user stored with ID:', user.id);

        return { error: null, user, isNewUser };
      }

      // Real OTP verification
      console.log('Attempting real OTP verification for phone:', phone);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      console.log('verifyOtp result - error:', error, 'user:', data?.user?.id, 'session:', !!data?.session);

      if (error) throw error;

      // Set session and user in store immediately
      if (data.session) {
        setSession(data.session);
        console.log('Session set successfully');
      } else {
        console.warn('No session returned from verifyOtp!');
      }

      if (data.user) {
        setUser(data.user);
        currentUserIdRef.current = data.user.id;
        console.log('Set currentUserIdRef to:', data.user.id);
      } else {
        console.error('No user returned from verifyOtp! This should not happen.');
        throw new Error('Authentication failed - no user returned');
      }

      // Check if profile exists and if onboarding is completed
      let isNewUser = isSignup;
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Create minimal profile - user will complete it in onboarding
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: '',
            phone,
            country: phone.startsWith('+971') ? 'AE' : 'EG',
            language: 'en',
            push_enabled: true,
            biometric_enabled: false,
            onboarding_completed: false,
          });
          isNewUser = true;
        } else {
          isNewUser = !existingProfile.onboarding_completed;
          setProfile(existingProfile);
        }
      }

      return { error: null, user: data.user, isNewUser };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { error, user: null };
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<Profile>): Promise<{ error: Error | null }> => {
    try {
      // First use the stored ref (most reliable after just signing in)
      let userId = currentUserIdRef.current;
      console.log('updateProfile called. currentUserIdRef.current:', userId);

      // Try demo user ID from storage
      if (!userId) {
        userId = getDemoUserId();
        console.log('Got userId from getDemoUserId:', userId);
      }

      // Try loading from AsyncStorage
      if (!userId) {
        userId = await loadDemoUserId();
        console.log('Got userId from loadDemoUserId:', userId);
      }

      // If no stored userId, try to get session from Supabase
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
        console.log('Got userId from getSession:', userId);
      }

      // If still no userId, try getUser as last fallback
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
        console.log('Got userId from getUser:', userId);
      }

      if (!userId) {
        console.error('No user ID found anywhere!');
        throw new Error('Not authenticated');
      }

      console.log('Updating profile for user:', userId);

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setProfile(profile);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear demo user and current user id
      await clearDemoUserId();
      currentUserIdRef.current = null;
      await supabase.auth.signOut();
      reset();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signInWithPhone,
        signUpWithPhone,
        verifyOtp,
        signOut,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
