import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value: boolean) => set({ hasSeenOnboarding: value }),
      resetOnboarding: () => set({ hasSeenOnboarding: false }),
    }),
    {
      name: 'washman-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper to reset onboarding (call from console or dev menu)
export const resetOnboardingState = async () => {
  await AsyncStorage.removeItem('washman-app');
  useAppStore.setState({ hasSeenOnboarding: false });
};

// Clear ALL app data and restart fresh
export const clearAllAppData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All app data cleared!');
    return true;
  } catch (e) {
    console.error('Failed to clear app data:', e);
    return false;
  }
};
