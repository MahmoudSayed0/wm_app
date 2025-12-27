import { supabase, getCurrentUser } from '../supabase';
import type { Profile, ProfileUpdate, CountryCode } from '@/types';

// Get current user's profile
export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    // If profile doesn't exist, create one
    if (error.code === 'PGRST116') {
      return createProfile(user.id, user.phone || '');
    }
    throw error;
  }

  return data;
}

// Create a new profile
export async function createProfile(
  userId: string,
  phone: string
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      full_name: 'New User',
      phone,
      country: 'EG',
      language: 'ar',
      push_enabled: true,
      biometric_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update profile
export async function updateProfile(
  updates: ProfileUpdate
): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update profile country
export async function updateCountry(country: CountryCode): Promise<Profile> {
  return updateProfile({ country });
}

// Update profile language
export async function updateLanguage(language: string): Promise<Profile> {
  return updateProfile({ language });
}

// Update notification settings
export async function updateNotificationSettings(
  pushEnabled: boolean
): Promise<Profile> {
  return updateProfile({ push_enabled: pushEnabled });
}

// Update biometric settings
export async function updateBiometricSettings(
  enabled: boolean
): Promise<Profile> {
  return updateProfile({ biometric_enabled: enabled });
}

// Sign out
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
