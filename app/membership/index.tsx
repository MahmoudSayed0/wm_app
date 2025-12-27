import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Check,
  Clock,
  CreditCard,
  Pause,
  Play,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { format, differenceInDays } from 'date-fns';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { useThemeStore, useLocaleStore, useAuthStore } from '@/stores';
import { t } from '@/lib/i18n';
import type { MembershipPlan, Membership, CountryCode } from '@/types';
import {
  getMembershipPlans,
  getCurrentMembership,
  getMembershipWithPlan,
  subscribeToPlan,
  pauseMembership,
  resumeMembership,
  cancelMembership,
  toggleAutoRenew,
  getPlanName,
  getPlanDescription,
  getPlanPrice,
  formatMembershipPrice,
} from '@/lib/api/memberships';

export default function MembershipScreen() {
  const { isDarkMode } = useThemeStore();
  const { locale } = useLocaleStore();
  const { detectedCountry } = useAuthStore();
  const country: CountryCode = detectedCountry || 'EG';

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [currentPlan, setCurrentPlan] = useState<MembershipPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const loadData = useCallback(async () => {
    try {
      const [plansData, membershipData] = await Promise.all([
        getMembershipPlans(),
        getMembershipWithPlan(),
      ]);

      setPlans(plansData);

      if (membershipData) {
        setCurrentMembership(membershipData.membership);
        setCurrentPlan(membershipData.plan);
      } else {
        setCurrentMembership(null);
        setCurrentPlan(null);
      }
    } catch (error) {
      console.error('Error loading membership data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load membership data',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSubscribe = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    Alert.alert(
      'Subscribe to Plan',
      `Subscribe to ${getPlanName(plan, locale)} for ${formatMembershipPrice(plan, country, locale)}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const membership = await subscribeToPlan(planId);
              setCurrentMembership(membership);
              setCurrentPlan(plan);
              setSelectedPlanId(null);
              Toast.show({
                type: 'success',
                text1: 'Subscribed!',
                text2: `You now have ${plan.wash_credits} wash credits`,
              });
            } catch (error) {
              console.error('Error subscribing:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to subscribe. Please try again.',
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handlePause = async () => {
    Alert.alert(
      'Pause Membership',
      'Your credits will be preserved. You can resume anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const updated = await pauseMembership();
              setCurrentMembership(updated);
              Toast.show({
                type: 'success',
                text1: 'Membership Paused',
                text2: 'Your credits are safe. Resume anytime!',
              });
            } catch (error) {
              console.error('Error pausing:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pause membership',
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleResume = async () => {
    setIsProcessing(true);
    try {
      const updated = await resumeMembership();
      setCurrentMembership(updated);
      Toast.show({
        type: 'success',
        text1: 'Membership Resumed',
        text2: 'Welcome back! Your credits are ready to use.',
      });
    } catch (error) {
      console.error('Error resuming:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resume membership',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Membership',
      'Are you sure? You will lose any remaining credits when your current period ends.',
      [
        { text: 'Keep Membership', style: 'cancel' },
        {
          text: 'Cancel Membership',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const updated = await cancelMembership();
              setCurrentMembership(updated);
              Toast.show({
                type: 'info',
                text1: 'Membership Cancelled',
                text2: 'You can use remaining credits until expiry.',
              });
            } catch (error) {
              console.error('Error cancelling:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to cancel membership',
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleAutoRenew = async (value: boolean) => {
    setIsProcessing(true);
    try {
      const updated = await toggleAutoRenew(value);
      setCurrentMembership(updated);
      Toast.show({
        type: 'success',
        text1: value ? 'Auto-Renew Enabled' : 'Auto-Renew Disabled',
        text2: value
          ? 'Your membership will renew automatically'
          : 'Your membership will expire at end of period',
      });
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    return Math.max(0, differenceInDays(new Date(expiresAt), new Date()));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-amber-500';
      case 'expired':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'expired':
        return 'Expired';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className={`mt-4 ${textMuted}`}>Loading membership...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center border-b ${borderColor}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
          style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
        >
          <ArrowLeft size={20} color={isDarkMode ? '#fff' : '#1F2937'} />
        </TouchableOpacity>
        <Text className={`flex-1 text-center text-lg font-semibold ${textColor}`}>
          Membership
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Membership Card */}
        {currentMembership && currentPlan && (
          <View className="px-4 pt-4">
            <View
              className={`${cardBg} rounded-2xl overflow-hidden border ${borderColor}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Header with gradient */}
              <View
                className="px-5 py-4"
                style={{ backgroundColor: Colors.primary }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                      <Crown size={24} color="#fff" />
                    </View>
                    <View>
                      <Text className="text-white/80 text-sm">Current Plan</Text>
                      <Text className="text-white text-xl font-bold">
                        {getPlanName(currentPlan, locale)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${getStatusColor(
                      currentMembership.status
                    )}`}
                  >
                    <Text className="text-white text-xs font-semibold">
                      {getStatusText(currentMembership.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Credits & Expiry */}
              <View className="px-5 py-4">
                <View className="flex-row">
                  {/* Credits */}
                  <View className="flex-1 items-center py-3">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: Colors.brandBeige }}
                    >
                      <Sparkles size={28} color={Colors.primary} />
                    </View>
                    <Text className={`text-2xl font-bold ${textColor}`}>
                      {currentMembership.wash_credits_remaining}
                    </Text>
                    <Text className={`text-sm ${textMuted}`}>
                      Washes Left
                    </Text>
                  </View>

                  {/* Divider */}
                  <View className={`w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

                  {/* Days Remaining */}
                  <View className="flex-1 items-center py-3">
                    <View
                      className="w-16 h-16 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                    >
                      <Clock size={28} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                    </View>
                    <Text className={`text-2xl font-bold ${textColor}`}>
                      {getDaysRemaining(currentMembership.expires_at)}
                    </Text>
                    <Text className={`text-sm ${textMuted}`}>
                      Days Left
                    </Text>
                  </View>
                </View>

                {/* Expiry Date */}
                <View
                  className={`mt-4 p-3 rounded-xl ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-center text-sm ${textMuted}`}>
                    Expires on{' '}
                    <Text className={`font-semibold ${textColor}`}>
                      {format(new Date(currentMembership.expires_at), 'MMMM d, yyyy')}
                    </Text>
                  </Text>
                </View>

                {/* Auto-Renew Toggle */}
                {currentMembership.status === 'active' && (
                  <View
                    className={`mt-4 flex-row items-center justify-between p-4 rounded-xl border ${borderColor}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <CreditCard size={20} color={Colors.primary} />
                      <Text className={textColor}>Auto-Renew</Text>
                    </View>
                    <Switch
                      value={currentMembership.auto_renew}
                      onValueChange={handleToggleAutoRenew}
                      disabled={isProcessing}
                      trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                )}

                {/* Action Buttons */}
                <View className="mt-4 flex-row gap-3">
                  {currentMembership.status === 'active' && (
                    <>
                      <TouchableOpacity
                        onPress={handlePause}
                        disabled={isProcessing}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 border ${borderColor}`}
                      >
                        <Pause size={18} color="#F59E0B" />
                        <Text className="text-amber-500 font-medium">Pause</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancel}
                        disabled={isProcessing}
                        className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2 border border-red-200 dark:border-red-800"
                      >
                        <X size={18} color="#EF4444" />
                        <Text className="text-red-500 font-medium">Cancel</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {currentMembership.status === 'paused' && (
                    <TouchableOpacity
                      onPress={handleResume}
                      disabled={isProcessing}
                      className="flex-1 py-3 rounded-xl flex-row items-center justify-center gap-2"
                      style={{ backgroundColor: Colors.primary }}
                    >
                      <Play size={18} color="#fff" />
                      <Text className="text-white font-medium">Resume</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Plans Section */}
        <View className="px-4 pt-6">
          <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
            {currentMembership ? 'Upgrade Your Plan' : 'Choose a Plan'}
          </Text>

          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isSelected = selectedPlanId === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => {
                  if (!isCurrentPlan) {
                    setSelectedPlanId(isSelected ? null : plan.id);
                  }
                }}
                disabled={isCurrentPlan || isProcessing}
                className={`mb-3 rounded-2xl overflow-hidden border-2 ${
                  isSelected
                    ? 'border-primary'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : borderColor
                }`}
                style={{
                  borderColor: isSelected
                    ? Colors.primary
                    : isCurrentPlan
                    ? '#10B981'
                    : undefined,
                }}
              >
                {/* Popular Badge */}
                {plan.is_popular && !isCurrentPlan && (
                  <View
                    className="py-1 px-4"
                    style={{ backgroundColor: Colors.primary }}
                  >
                    <Text className="text-white text-xs font-semibold text-center">
                      MOST POPULAR
                    </Text>
                  </View>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <View className="py-1 px-4 bg-green-500">
                    <Text className="text-white text-xs font-semibold text-center">
                      CURRENT PLAN
                    </Text>
                  </View>
                )}

                <View className={`p-4 ${cardBg}`}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className={`text-lg font-bold ${textColor}`}>
                        {getPlanName(plan, locale)}
                      </Text>
                      <Text className={`text-sm mt-1 ${textMuted}`}>
                        {getPlanDescription(plan, locale)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-2xl font-bold ${textColor}`}>
                        {formatMembershipPrice(plan, country, locale)}
                      </Text>
                      <Text className={`text-xs ${textMuted}`}>/month</Text>
                    </View>
                  </View>

                  {/* Features */}
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <View
                      className="flex-row items-center gap-2 px-3 py-2 rounded-full"
                      style={{ backgroundColor: Colors.brandBeige }}
                    >
                      <Sparkles size={14} color={Colors.primary} />
                      <Text style={{ color: Colors.brandBeigeForeground }}>
                        {plan.wash_credits} washes
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Clock size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Text className={textMuted}>
                        {plan.duration_days} days
                      </Text>
                    </View>
                    <View
                      className={`flex-row items-center gap-2 px-3 py-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Zap size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Text className={textMuted}>
                        {(getPlanPrice(plan, country) / plan.wash_credits).toFixed(0)}{' '}
                        {country === 'EG' ? 'EGP' : 'AED'}/wash
                      </Text>
                    </View>
                  </View>

                  {/* Subscribe Button */}
                  {isSelected && !isCurrentPlan && (
                    <TouchableOpacity
                      onPress={() => handleSubscribe(plan.id)}
                      disabled={isProcessing}
                      className="mt-4 py-3 rounded-xl flex-row items-center justify-center gap-2"
                      style={{ backgroundColor: Colors.primary }}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Check size={18} color="#fff" />
                          <Text className="text-white font-semibold">
                            Subscribe Now
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Benefits Section */}
        <View className="px-4 pt-6">
          <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
            Membership Benefits
          </Text>
          <View className={`${cardBg} rounded-2xl p-4 border ${borderColor}`}>
            {[
              { icon: Sparkles, text: 'Pre-paid wash credits at discounted rates' },
              { icon: Clock, text: 'Priority booking & shorter wait times' },
              { icon: Crown, text: 'Exclusive member-only promotions' },
              { icon: CreditCard, text: 'Flexible payment - pause or cancel anytime' },
            ].map((benefit, index) => (
              <View
                key={index}
                className={`flex-row items-center gap-4 py-3 ${
                  index < 3 ? `border-b ${borderColor}` : ''
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: Colors.brandBeige }}
                >
                  <benefit.icon size={20} color={Colors.primary} />
                </View>
                <Text className={`flex-1 ${textColor}`}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Processing Overlay */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className={`${cardBg} p-6 rounded-2xl items-center`}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className={`mt-3 ${textColor}`}>Processing...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
