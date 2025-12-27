import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@/types/database.types';

// Demo user ID storage key
const DEMO_USER_ID_KEY = '@washman_demo_user_id';

// Store reference to the demo user (set by AuthProvider)
let demoUser: User | null = null;
let demoUserId: string | null = null;

export function setDemoUser(user: User | null) {
  demoUser = user;
  if (user) {
    demoUserId = user.id;
    // Persist to AsyncStorage
    AsyncStorage.setItem(DEMO_USER_ID_KEY, user.id).catch(console.error);
  }
}

export function getDemoUser(): User | null {
  return demoUser;
}

export function getDemoUserId(): string | null {
  return demoUserId;
}

export async function loadDemoUserId(): Promise<string | null> {
  try {
    const id = await AsyncStorage.getItem(DEMO_USER_ID_KEY);
    demoUserId = id;
    return id;
  } catch {
    return null;
  }
}

export async function clearDemoUserId(): Promise<void> {
  demoUserId = null;
  demoUser = null;
  await AsyncStorage.removeItem(DEMO_USER_ID_KEY).catch(console.error);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create typed Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper for type-safe table access
export function getTable<T extends keyof Database['public']['Tables']>(table: T) {
  return supabase.from(table);
}

// Helper to get the current user (works with demo mode)
export async function getCurrentUser() {
  // First check for demo user (set by AuthProvider)
  if (demoUser) {
    return demoUser;
  }

  // Then try Supabase auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

// Helper to get current session
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
