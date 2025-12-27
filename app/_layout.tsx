import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colorScheme } from 'nativewind';

import { useThemeStore } from '@/stores';
import { AuthProvider } from '@/providers/AuthProvider';
import SplashScreen from '@/components/SplashScreen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Euclid Circular A - Main app font
    'EuclidCircularA-Light': require('../assets/fonts/EuclidCircularA-Light.ttf'),
    'EuclidCircularA-Regular': require('../assets/fonts/EuclidCircularA-Regular.ttf'),
    'EuclidCircularA-Medium': require('../assets/fonts/EuclidCircularA-Medium.ttf'),
    'EuclidCircularA-SemiBold': require('../assets/fonts/EuclidCircularA-SemiBold.ttf'),
    'EuclidCircularA-Bold': require('../assets/fonts/EuclidCircularA-Bold.ttf'),
    ...FontAwesome.font,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide native splash and show custom animated splash
      ExpoSplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {showSplash && appReady ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <RootLayoutNav />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isDarkMode } = useThemeStore();

  // Sync theme store with NativeWind
  useEffect(() => {
    colorScheme.set(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <View style={{ flex: 1 }} className={isDarkMode ? 'dark' : ''}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="services" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="vehicles" />
          <Stack.Screen name="locations" />
          <Stack.Screen name="membership" />
          <Stack.Screen name="zones" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
        <Toast />
      </View>
    </AuthProvider>
  );
}
