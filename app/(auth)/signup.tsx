import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
  Check,
  Shield,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Logo } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';

export default function SignupScreen() {
  const { signUpWithPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formatPhoneNumber = (text: string) => {
    return text.replace(/\D/g, '');
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    return {
      hasMinLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordStrength).filter(Boolean).length;
  }, [passwordStrength]);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const getStrengthColor = (index: number) => {
    if (passwordScore === 0) return '#E5E7EB';
    if (index < passwordScore) {
      if (passwordScore === 1) return '#EF4444'; // Red
      if (passwordScore === 2) return '#F59E0B'; // Amber
      return '#22C55E'; // Green
    }
    return '#E5E7EB';
  };

  const handleSignup = async () => {
    const cleanPhone = formatPhoneNumber(phone);
    if (cleanPhone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid phone number',
      });
      return;
    }

    if (passwordScore < 3) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must have 6+ chars, uppercase, and number',
      });
      return;
    }

    if (!passwordsMatch) {
      Toast.show({
        type: 'error',
        text1: 'Passwords Don\'t Match',
        text2: 'Please make sure both passwords are the same',
      });
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${cleanPhone}`;

    try {
      const { error } = await signUpWithPhone(fullPhone, password);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your phone for the verification code',
      });

      router.push({
        pathname: '/(auth)/verify',
        params: {
          phone: fullPhone,
          isSignup: 'true',
        },
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create account',
      });
    } finally {
      setLoading(false);
    }
  };

  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  const isFormValid = phone.length >= 10 && passwordScore === 3 && passwordsMatch && agreedToTerms;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      {/* Gradient Background - 10% from top */}
      <LinearGradient
        colors={[`${Colors.primary}18`, 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '10%',
        }}
      />

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

            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 20 }}>
              {/* Logo */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Logo variant="teal" width={160} />
              </View>

              {/* Welcome Text */}
              <View style={{ alignItems: 'center', marginBottom: 28 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 8,
                  }}
                >
                  Create Account
                </Text>
                <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
                  Join Washman today
                </Text>
              </View>

              {/* Demo Mode Banner */}
              {isDemoMode && (
                <View
                  style={{
                    backgroundColor: '#FEF3C7',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      color: '#92400E',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Demo Mode Active
                  </Text>
                  <Text
                    style={{
                      color: '#B45309',
                      fontSize: 13,
                      textAlign: 'center',
                      marginTop: 4,
                    }}
                  >
                    Use any phone number and OTP: 123456
                  </Text>
                </View>
              )}

              {/* Phone Input Section */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Phone size={18} color={Colors.primary} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginLeft: 8,
                    }}
                  >
                    Phone Number
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Country Code */}
                  <TouchableOpacity
                    onPress={() =>
                      setCountryCode(countryCode === '+20' ? '+971' : '+20')
                    }
                    style={{
                      backgroundColor: '#F3F4F6',
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      borderWidth: 2,
                      borderColor: '#E5E7EB',
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>
                      {countryCode === '+20' ? '🇪🇬' : '🇦🇪'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      {countryCode}
                    </Text>
                  </TouchableOpacity>

                  {/* Phone Input */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#F3F4F6',
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: phone ? Colors.primary : '#E5E7EB',
                    }}
                  >
                    <TextInput
                      value={phone}
                      onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                      placeholder="Enter phone number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        fontSize: 18,
                        color: '#1A1A1A',
                      }}
                      maxLength={11}
                    />
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Lock size={18} color={Colors.primary} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginLeft: 8,
                    }}
                  >
                    Password
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: password ? Colors.primary : '#E5E7EB',
                  }}
                >
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1A1A1A',
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <Animated.View entering={FadeIn.duration(200)} style={{ marginBottom: 16 }}>
                  {/* Strength Bars */}
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                    {[0, 1, 2].map((index) => (
                      <View
                        key={index}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: getStrengthColor(index),
                        }}
                      />
                    ))}
                  </View>
                  {/* Requirements */}
                  <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Check
                        size={14}
                        color={passwordStrength.hasMinLength ? '#22C55E' : '#9CA3AF'}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: passwordStrength.hasMinLength ? '#22C55E' : '#9CA3AF',
                        }}
                      >
                        6+ chars
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Check
                        size={14}
                        color={passwordStrength.hasUppercase ? '#22C55E' : '#9CA3AF'}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: passwordStrength.hasUppercase ? '#22C55E' : '#9CA3AF',
                        }}
                      >
                        Uppercase
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Check
                        size={14}
                        color={passwordStrength.hasNumber ? '#22C55E' : '#9CA3AF'}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: passwordStrength.hasNumber ? '#22C55E' : '#9CA3AF',
                        }}
                      >
                        Number
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Confirm Password Input */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Shield size={18} color={Colors.primary} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginLeft: 8,
                    }}
                  >
                    Confirm Password
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: passwordsMatch
                      ? '#22C55E'
                      : confirmPassword
                      ? '#EF4444'
                      : '#E5E7EB',
                  }}
                >
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1A1A1A',
                      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                      letterSpacing: 0,
                    }}
                  />
                  {passwordsMatch && (
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#22C55E',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 8,
                      }}
                    >
                      <Check size={14} color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  backgroundColor: '#F9FAFB',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 24,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: agreedToTerms ? Colors.primary : '#D1D5DB',
                    backgroundColor: agreedToTerms ? Colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {agreedToTerms && (
                    <Check size={14} color="#fff" />
                  )}
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: '#6B7280', lineHeight: 20 }}>
                  I agree to the{' '}
                  <Text style={{ color: Colors.primary, fontWeight: '500' }}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={{ color: Colors.primary, fontWeight: '500' }}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={!isFormValid || loading}
                style={{
                  backgroundColor: isFormValid ? Colors.primary : '#D1D5DB',
                  borderRadius: 16,
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isFormValid ? 0.3 : 0,
                  shadowRadius: 16,
                  elevation: isFormValid ? 8 : 0,
                }}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                    Creating Account...
                  </Text>
                ) : (
                  <>
                    <UserPlus size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                      Create Account
                    </Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 24,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                <Text
                  style={{
                    paddingHorizontal: 16,
                    fontSize: 14,
                    color: '#9CA3AF',
                  }}
                >
                  or
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              </View>

              {/* Sign In Link */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: '#6B7280' }}>
                  Already have an account?{' '}
                  <Text
                    style={{ color: Colors.primary, fontWeight: '700' }}
                    onPress={() => router.back()}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
