import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, User } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/stores';

export default function ProfileOnboardingScreen() {
  const { updateProfile } = useAuth();
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Give a moment for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!user) {
        console.log('No user found in onboarding, redirecting to login');
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Please sign in again',
        });
        router.replace('/(auth)/login');
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [user]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleContinue = async () => {
    if (fullName.trim().length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter your full name (at least 2 characters)',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateProfile({ full_name: fullName.trim() });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
        return;
      }

      // Navigate to location selection
      router.push('/(auth)/onboarding/location');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = fullName.trim().length >= 2;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              <ArrowLeft size={22} color="#6B7280" />
            </TouchableOpacity>

            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
              {/* User Icon */}
              <Animated.View
                entering={FadeInDown.delay(100).duration(500)}
                style={{ alignItems: 'center', marginBottom: 24 }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 24,
                    backgroundColor: `${Colors.primary}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={48} color={Colors.primary} />
                </View>
              </Animated.View>

              {/* Title */}
              <Animated.View
                entering={FadeInDown.delay(200).duration(500)}
                style={{ alignItems: 'center', marginBottom: 40 }}
              >
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Tell Us About Yourself
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#6B7280',
                    textAlign: 'center',
                  }}
                >
                  Enter your name to continue
                </Text>
              </Animated.View>

              {/* Full Name Input */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(500)}
                style={{ marginBottom: 32 }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 8,
                  }}
                >
                  Full Name
                </Text>
                <View
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    borderColor: fullName ? Colors.primary : '#E5E7EB',
                  }}
                >
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoFocus
                    style={{
                      paddingVertical: 16,
                      fontSize: 18,
                      color: '#1A1A1A',
                    }}
                  />
                </View>
              </Animated.View>

              {/* Spacer */}
              <View style={{ flex: 1 }} />

              {/* Continue Button */}
              <Animated.View entering={FadeIn.delay(400).duration(500)}>
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={!isValid || loading}
                  style={{
                    backgroundColor: isValid ? Colors.primary : '#D1D5DB',
                    borderRadius: 16,
                    paddingVertical: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isValid ? 0.3 : 0,
                    shadowRadius: 16,
                    elevation: isValid ? 8 : 0,
                    marginBottom: 20,
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 18,
                      fontWeight: '600',
                    }}
                  >
                    {loading ? 'Saving...' : 'Continue'}
                  </Text>
                  {!loading && <ArrowRight size={20} color="#fff" />}
                </TouchableOpacity>
              </Animated.View>

              {/* Progress Dots */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  paddingBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.primary,
                  }}
                />
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#E5E7EB',
                  }}
                />
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#E5E7EB',
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
