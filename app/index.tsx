import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore, useAppStore } from '@/stores';
import { clearAllAppData } from '@/stores/app-store';
import Colors from '@/constants/Colors';

// DEV: Set to true to clear ALL data and start fresh
const CLEAR_ALL_DATA = false;

// DEV: Set to true to always show onboarding
const FORCE_ONBOARDING = false;

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasSeenOnboarding, resetOnboarding } = useAppStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for stores to hydrate from AsyncStorage
  useEffect(() => {
    const init = async () => {
      // DEV: Clear all data and start fresh
      if (CLEAR_ALL_DATA) {
        await clearAllAppData();
        console.log('🧹 All app data cleared! Set CLEAR_ALL_DATA to false and reload.');
      }

      // DEV: Reset onboarding state for testing
      if (FORCE_ONBOARDING) {
        resetOnboarding();
      }

      // Give stores time to hydrate
      setTimeout(() => {
        setIsHydrated(true);
      }, 100);
    };

    init();
  }, []);

  // Show loading while stores hydrate or auth is checking
  if (!isHydrated || isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Show onboarding for first-time users
  if (!hasSeenOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(auth)/login" />;
}
