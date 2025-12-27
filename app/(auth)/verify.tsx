import React, { useState, useRef, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import MaskedView from '@react-native-masked-view/masked-view';

import { useAuth } from '@/providers/AuthProvider';

const OTP_LENGTH = 6;
const OTP_VALIDITY_MINUTES = 15;

export default function VerifyScreen() {
  const { phone, isSignup } = useLocalSearchParams<{ phone: string; isSignup?: string }>();
  const { verifyOtp, signInWithPhone } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatPhone = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    // Format: +20 100 123 4567
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('20')) {
      return `+20 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    if (cleaned.startsWith('971')) {
      return `+971 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    return phoneNumber;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    // Handle paste
    if (value.length > 1) {
      const pastedOtp = value.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      setError('');
      const lastIndex = Math.min(index + pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();

      // Auto-submit if complete
      if (newOtp.every((d) => d)) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === OTP_LENGTH - 1 && newOtp.every((d) => d)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current digit
        newOtp[index] = '';
        setOtp(newOtp);
        setError('');
      } else if (index > 0) {
        // Move to previous and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setError('');
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async (code?: string) => {
    const otpString = code || otp.join('');

    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!phone) {
      setError('Phone number is missing');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: verifyError, isNewUser } = await verifyOtp(phone, otpString, isSignup === 'true');

      if (verifyError) {
        setError(verifyError.message || 'Invalid code');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      setSuccess(true);
      Toast.show({
        type: 'success',
        text1: isNewUser ? 'Account Created!' : 'Welcome Back!',
        text2: isNewUser ? 'Let\'s set up your profile' : 'Signed in successfully',
      });

      // Short delay for success animation
      setTimeout(() => {
        if (isNewUser) {
          // Redirect to onboarding for new users
          router.replace('/(auth)/onboarding/profile');
        } else {
          router.replace('/(tabs)');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !phone) return;

    setResendLoading(true);
    setError('');

    try {
      const { error: resendError } = await signInWithPhone(phone);

      if (resendError) {
        setError(resendError.message || 'Failed to resend');
        setResendLoading(false);
        return;
      }

      setCanResend(false);
      setCountdown(59);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: 'Check your phone',
      });
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  const isOtpComplete = otp.every((digit) => digit !== '');

  // Success overlay
  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#FCFCFC',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: '#22C55E',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldCheck size={48} color="#fff" />
        </Animated.View>
        <Animated.Text
          entering={FadeIn.delay(200).duration(300)}
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#090909',
            marginTop: 24,
          }}
        >
          Verified!
        </Animated.Text>
      </View>
    );
  }

  // Gradient text component for OTP digits
  const GradientText = ({ children, style }: { children: string; style?: any }) => {
    if (!children) return null;

    return (
      <MaskedView
        maskElement={
          <Text style={[{ fontSize: 30, fontWeight: '500', textAlign: 'center' }, style]}>
            {children}
          </Text>
        }
      >
        <LinearGradient
          colors={['#1F8783', '#12504E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 38 }}
        >
          <Text style={[{ opacity: 0, fontSize: 30, fontWeight: '500', textAlign: 'center' }, style]}>
            {children}
          </Text>
        </LinearGradient>
      </MaskedView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FCFCFC' }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={{ marginTop: 85 }}>
              {/* Title & Subtitle */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: '500',
                    color: '#090909',
                    marginBottom: 3,
                  }}
                >
                  Verify your phone number
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#676767',
                    textAlign: 'center',
                  }}
                >
                  We've sent a code to {formatPhone(phone || '')}
                </Text>
              </View>

              {/* OTP Valid Badge */}
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <LinearGradient
                  colors={['#1F8783', '#12504E']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 13,
                    borderRadius: 32,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '300',
                      color: '#FFFFFF',
                    }}
                  >
                    Your OTP is valid for {OTP_VALIDITY_MINUTES} minutes
                  </Text>
                </LinearGradient>
              </View>

              {/* Demo Banner */}
              {isDemoMode && (
                <View
                  style={{
                    backgroundColor: '#DCFCE7',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: '#166534',
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Demo OTP: 123456
                  </Text>
                </View>
              )}

              {/* OTP Input */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 33,
                }}
              >
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 8,
                      backgroundColor: '#F2F2F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {digit ? (
                      <GradientText>{digit}</GradientText>
                    ) : null}
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      value=""
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={6}
                      selectTextOnFocus
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: digit ? 0 : 1,
                        textAlign: 'center',
                        fontSize: 30,
                        fontWeight: '500',
                        color: '#1F8783',
                      }}
                      editable={!loading}
                    />
                  </View>
                ))}
              </View>

              {/* Error Message */}
              {error ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: '#DC2626',
                      fontSize: 14,
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </Text>
                </Animated.View>
              ) : null}

              {/* Resend Section */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  marginBottom: 24,
                }}
              >
                <Text style={{ fontSize: 12, color: '#949494' }}>
                  Didn't get a code?{'\n'}
                  {canResend ? 'Tap to resend' : `Resend after 0:${countdown.toString().padStart(2, '0')}`}
                </Text>

                {canResend && (
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendLoading}
                  >
                    <LinearGradient
                      colors={['#1F8783', '#12504E']}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 70,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#FCFCFC',
                        }}
                      >
                        {resendLoading ? 'Sending...' : 'Send OTP'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Bottom Button */}
            <View style={{ paddingBottom: 40 }}>
              <TouchableOpacity
                onPress={() => handleVerify()}
                disabled={!isOtpComplete || loading}
              >
                <LinearGradient
                  colors={isOtpComplete ? ['#1F8783', '#12504E'] : ['#BBBBBB', '#999999']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    paddingVertical: 16,
                    borderRadius: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#FCFCFC',
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
