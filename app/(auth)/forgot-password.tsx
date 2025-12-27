import React, { useState } from 'react';
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
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Send,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Logo } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';

export default function ForgotPasswordScreen() {
  const { signInWithPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const formatPhoneNumber = (text: string) => {
    return text.replace(/\D/g, '');
  };

  const handleSendReset = async () => {
    const cleanPhone = formatPhoneNumber(phone);

    if (cleanPhone.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid phone number',
      });
      return;
    }

    setLoading(true);
    const fullPhone = `${countryCode}${cleanPhone}`;

    try {
      const { error } = await signInWithPhone(fullPhone);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
        });
        return;
      }

      setSent(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your phone for the verification code',
      });

      // Navigate to verify screen after short delay
      setTimeout(() => {
        router.push({
          pathname: '/(auth)/verify',
          params: { phone: fullPhone },
        });
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send reset code',
      });
    } finally {
      setLoading(false);
    }
  };

  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
  const isPhoneValid = phone.length >= 10;

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

            <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
              {/* Logo */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Logo variant="teal" width={160} />
              </View>

              {/* Icon & Title */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    backgroundColor: `${Colors.primary}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <KeyRound size={40} color={Colors.primary} />
                </View>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#1A1A1A',
                    marginBottom: 8,
                  }}
                >
                  Reset Access
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#6B7280',
                    textAlign: 'center',
                    lineHeight: 24,
                    paddingHorizontal: 20,
                  }}
                >
                  Enter your phone number and we'll send you a verification code to regain access
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

              {/* Sent Success Banner */}
              {sent && (
                <View
                  style={{
                    backgroundColor: '#DCFCE7',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      color: '#166534',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    Verification Code Sent!
                  </Text>
                  <Text
                    style={{
                      color: '#15803D',
                      fontSize: 13,
                      textAlign: 'center',
                      marginTop: 4,
                    }}
                  >
                    Check your phone for the OTP
                  </Text>
                </View>
              )}

              {/* Phone Input Section */}
              <View style={{ marginBottom: 32 }}>
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
                      placeholder="Enter your phone number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        fontSize: 18,
                        color: '#1A1A1A',
                      }}
                      maxLength={11}
                      editable={!sent}
                    />
                  </View>
                </View>
              </View>

              {/* Send Reset Button */}
              <TouchableOpacity
                onPress={handleSendReset}
                disabled={!isPhoneValid || loading || sent}
                style={{
                  backgroundColor:
                    isPhoneValid && !sent ? Colors.primary : '#D1D5DB',
                  borderRadius: 16,
                  paddingVertical: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isPhoneValid && !sent ? 0.3 : 0,
                  shadowRadius: 16,
                  elevation: isPhoneValid && !sent ? 8 : 0,
                }}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                    Sending...
                  </Text>
                ) : sent ? (
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                    Code Sent!
                  </Text>
                ) : (
                  <>
                    <Send size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
                      Send Verification Code
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

              {/* Back to Sign In */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 15, color: '#6B7280' }}>
                  Remember your account?{' '}
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
