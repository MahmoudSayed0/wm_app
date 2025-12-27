import { useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import type { Profile } from '@/types';
import type { Database } from '@/types/database.types';

export function useAuth() {
  const {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    setUser,
    setSession,
    setProfile,
    setLoading,
    reset,
  } = useAuthStore();

  // Initialize auth state on app start
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      setProfile(data as Profile | null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to phone number
  const sendOtp = useCallback(async (phone: string) => {
    try {
      // Format phone number for Egypt (add +20 prefix if not present)
      const formattedPhone = phone.startsWith('+') ? phone : `+20${phone}`;

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }, []);

  // Verify OTP
  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+20${phone}`;

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });

      if (error) throw error;

      // Check if user has a profile
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileData) {
          // New user, needs to complete profile
          return { success: true, needsProfile: true, user: data.user };
        }

        setProfile(profileData as Profile);
        return { success: true, needsProfile: false, user: data.user };
      }

      return { success: true, needsProfile: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid OTP',
      };
    }
  }, []);

  // Create or update profile
  const createProfile = useCallback(
    async (data: { fullName: string; email?: string }) => {
      try {
        if (!user) throw new Error('No user');

        const profileData: Database['public']['Tables']['profiles']['Insert'] = {
          id: user.id,
          full_name: data.fullName,
          email: data.email || null,
          phone: user.phone,
        };

        const { error } = await (supabase.from('profiles') as any).upsert(profileData);

        if (error) throw error;

        // Fetch updated profile
        await fetchProfile(user.id);

        return { success: true };
      } catch (error) {
        console.error('Error creating profile:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create profile',
        };
      }
    },
    [user]
  );

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      reset();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    sendOtp,
    verifyOtp,
    createProfile,
    signOut,
    fetchProfile,
  };
}
