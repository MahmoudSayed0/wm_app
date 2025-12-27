import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Car,
  MessageCircle,
  Star,
  Navigation,
  X,
  CheckCircle2,
  Sparkles,
  Phone,
  Calendar,
  CreditCard,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { format, parseISO } from 'date-fns';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { Button, Loading, RatingModal } from '@/components/ui';
import { useRealtimeOrder, useRealtimeLocation } from '@/hooks';
import { getOrder, cancelOrder } from '@/lib/api/orders';
import { useAuthStore } from '@/stores';
import type { OrderWithRelations, CountryCode } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Status steps
const statusSteps = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'assigned', label: 'Assigned', icon: Car },
  { key: 'on_the_way', label: 'On the Way', icon: Navigation },
  { key: 'arrived', label: 'Arrived', icon: MapPin },
  { key: 'in_progress', label: 'In Progress', icon: Sparkles },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

function getStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-600' };
    case 'confirmed':
      return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600' };
    case 'assigned':
      return { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600' };
    case 'on_the_way':
      return { bg: 'bg-amber-500', light: 'bg-amber-100', text: 'text-amber-600' };
    case 'arrived':
      return { bg: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-600' };
    case 'in_progress':
      return { bg: 'bg-primary', light: 'bg-primary/10', text: 'text-primary' };
    case 'completed':
      return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600' };
    case 'cancelled':
      return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-600' };
    default:
      return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-600' };
  }
}

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id || '';
  const { detectedCountry } = useAuthStore();
  const country: CountryCode = detectedCountry || 'EG';
  const currency = country === 'EG' ? 'EGP' : 'AED';

  // State
  const [order, setOrder] = useState<OrderWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasShownRatingPrompt, setHasShownRatingPrompt] = useState(false);

  // Real-time order tracking hooks
  const {
    orderStatus: realtimeStatus,
    washerLocation: realtimeWasherLocation,
    messages,
    estimatedArrival,
    isConnected,
    error: orderError,
    sendMessage,
  } = useRealtimeOrder(orderId);

  // Real-time location tracking with smooth interpolation
  const {
    currentLocation: washerLocation,
    isTracking,
    eta: realtimeEta,
  } = useRealtimeLocation({
    orderId,
    interpolate: true,
  });

  const mapRef = useRef<MapView>(null);

  // Load order data
  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError('Order ID is missing');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getOrder(orderId);
      if (data) {
        setOrder(data);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  }, [loadOrder]);

  // Update order status from realtime
  const currentStatus = realtimeStatus || order?.status || 'pending';

  // Use realtime washer location or fall back to order washer location
  const washerPosition = washerLocation
    ? { latitude: washerLocation.latitude, longitude: washerLocation.longitude }
    : order?.washer
    ? { latitude: 30.05, longitude: 31.24 } // Default position if no realtime
    : null;

  // ETA from realtime
  const displayEta = realtimeEta || estimatedArrival || 5;

  // Update order status when realtime status changes
  useEffect(() => {
    if (realtimeStatus && order) {
      setOrder((prev) => prev ? { ...prev, status: realtimeStatus as OrderWithRelations['status'] } : prev);
    }
  }, [realtimeStatus]);

  // Animate map when washer position updates
  useEffect(() => {
    if (washerPosition && mapRef.current && order?.location && ['on_the_way', 'arrived'].includes(currentStatus)) {
      mapRef.current.animateToRegion({
        latitude: ((order.location.latitude || 30.0444) + washerPosition.latitude) / 2,
        longitude: ((order.location.longitude || 31.2357) + washerPosition.longitude) / 2,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  }, [washerPosition, currentStatus, order?.location]);

  // Auto-show rating modal when order completes
  useEffect(() => {
    if (
      currentStatus === 'completed' &&
      order &&
      !order.rating &&
      !hasShownRatingPrompt
    ) {
      // Delay showing modal slightly for better UX
      const timer = setTimeout(() => {
        setShowRatingModal(true);
        setHasShownRatingPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, order, hasShownRatingPrompt]);

  // Handle rating success
  const handleRatingSuccess = (rating: number, review?: string) => {
    setOrder((prev) =>
      prev ? { ...prev, rating, review: review || null } : prev
    );
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelOrder(orderId, 'Cancelled by customer');
              Toast.show({
                type: 'success',
                text1: 'Order Cancelled',
                text2: 'Your order has been cancelled',
              });
              router.back();
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: 'Failed to cancel',
                text2: err.message || 'Please try again',
              });
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const currentStepIndex = statusSteps.findIndex((s) => s.key === currentStatus);
  const statusStyle = getStatusStyle(currentStatus);
  const currentStatusStep = statusSteps.find((s) => s.key === currentStatus);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Loading size="large" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading order...</Text>
      </View>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-row items-center gap-3 px-4 h-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-gray-900 dark:text-white">
            Order Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center mb-6">
            <X size={40} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            {error || 'Order not found'}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            The order you're looking for doesn't exist or you don't have access to it.
          </Text>
          <Button variant="primary" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Get service name (handle localized fields)
  const serviceName = order.service
    ? (order.service as any).name_en || (order.service as any).name || 'Car Wash Service'
    : 'Car Wash Service';

  // Format date and time
  const formattedDate = order.scheduled_date
    ? format(parseISO(order.scheduled_date), 'MMM d, yyyy')
    : 'Not scheduled';
  const formattedTime = order.scheduled_time || '';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between px-4 h-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="font-bold text-gray-900 dark:text-white text-sm">
            Order #{order.order_number?.split('-').pop() || orderId.slice(0, 6)}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="w-10 h-10 items-center justify-center"
          >
            <RefreshCw size={18} color={refreshing ? '#9CA3AF' : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Map Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {/* Map Container */}
          <View className="h-52 relative">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: order.location?.latitude || 30.0444,
                longitude: order.location?.longitude || 31.2357,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
            >
              {/* Customer Location Marker */}
              {order.location && (
                <Marker
                  coordinate={{
                    latitude: order.location.latitude || 30.0444,
                    longitude: order.location.longitude || 31.2357,
                  }}
                >
                  <View className="items-center">
                    <View className="w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg">
                      <MapPin size={20} color="white" />
                    </View>
                    <View className="w-3 h-3 bg-primary rotate-45 -mt-1.5" />
                  </View>
                </Marker>
              )}

              {/* Washer Location Marker */}
              {['on_the_way', 'arrived', 'in_progress'].includes(currentStatus) && washerPosition && (
                <Marker coordinate={washerPosition}>
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center shadow-lg border-2 border-white">
                      <Car size={24} color="white" />
                    </View>
                  </View>
                </Marker>
              )}
            </MapView>

            {/* Status Badge Overlay */}
            <View className="absolute top-3 left-3 right-3 flex-row justify-between">
              <View
                className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${statusStyle.light}`}
              >
                <View className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg}`} />
                <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                  {currentStatusStep?.label || currentStatus}
                </Text>
              </View>
              <View className="px-2.5 py-1 rounded-full bg-white/90 flex-row items-center gap-1">
                {isConnected ? (
                  <>
                    <Wifi size={10} color="#22C55E" />
                    <Text className="text-[10px] font-medium text-green-600">Live</Text>
                  </>
                ) : (
                  <>
                    <WifiOff size={10} color="#9CA3AF" />
                    <Text className="text-[10px] font-medium text-gray-500">Offline</Text>
                  </>
                )}
              </View>
            </View>

            {/* ETA Badge */}
            {currentStatus === 'on_the_way' && (
              <View className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <View className="bg-white rounded-xl px-4 py-2 shadow-lg flex-row items-center gap-2">
                  <Navigation size={16} color={Colors.primary} />
                  <Text className="text-sm font-bold text-gray-900">{displayEta} min</Text>
                </View>
              </View>
            )}
          </View>

          {/* Order Info Below Map */}
          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-400 font-mono">
                  {order.order_number}
                </Text>
                <Text className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {serviceName}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-400">Total</Text>
                <Text className="font-bold text-primary text-lg">
                  {currency} {order.total || 0}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Progress Steps */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-bold text-gray-900 dark:text-white">
              Order Status
            </Text>
            <Text className="text-xs text-gray-400">
              {Math.max(0, currentStepIndex + 1)}/{statusSteps.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="relative h-1 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <View
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{
                width: `${Math.max(5, ((currentStepIndex + 1) / statusSteps.length) * 100)}%`,
              }}
            />
          </View>

          {/* Steps Row */}
          <View className="flex-row justify-between">
            {statusSteps.slice(0, 5).map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <View key={step.key} className="items-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCurrent
                        ? 'bg-primary scale-110'
                        : isActive
                        ? 'bg-primary/20'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    <Icon
                      size={16}
                      color={isCurrent ? 'white' : isActive ? Colors.primary : '#9CA3AF'}
                    />
                  </View>
                  <Text
                    className={`text-[10px] mt-1.5 text-center max-w-[50px] ${
                      isCurrent
                        ? 'text-primary font-semibold'
                        : isActive
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-400'
                    }`}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Washer Card */}
        {order.washer && (
          <Animated.View
            entering={FadeInDown.delay(300)}
            className="bg-gradient-to-br rounded-2xl p-4 shadow-lg"
            style={{ backgroundColor: Colors.primary }}
          >
            <View className="flex-row items-center gap-4">
              <View className="relative">
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border-2 border-white/30">
                  <User size={28} color="white" />
                </View>
                {currentStatus === 'on_the_way' && (
                  <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white items-center justify-center">
                    <Navigation size={10} color="white" />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white/70 text-xs">Your Washer</Text>
                <Text className="text-white font-bold text-base">
                  {(order.washer as any).full_name || 'Assigned Washer'}
                </Text>
                {(order.washer as any).rating && (
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <Text className="text-white text-sm font-medium">
                      {(order.washer as any).rating}
                    </Text>
                  </View>
                )}
              </View>

              {/* Message Button */}
              <TouchableOpacity className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
                <MessageCircle size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Details Cards */}
        <Animated.View entering={FadeInDown.delay(400)} className="gap-3">
          {/* Vehicle Card */}
          {order.vehicle && (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center">
                  <Car size={24} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 dark:text-white">
                    {order.vehicle.make} {order.vehicle.model}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-0.5">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {order.vehicle.year}
                    </Text>
                    <Text className="text-gray-300">•</Text>
                    <Text className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {order.vehicle.plate}
                    </Text>
                  </View>
                </View>
                {order.vehicle.color && (
                  <View
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: order.vehicle.color }}
                  />
                )}
              </View>
            </View>
          )}

          {/* Schedule & Location */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 items-center justify-center">
                <Calendar size={16} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400">Schedule</Text>
                <Text className="font-semibold text-gray-900 dark:text-white text-sm">
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
            </View>
            <View className="h-px bg-gray-100 dark:bg-gray-700 mb-3" />
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 items-center justify-center">
                <MapPin size={16} color="#0D9488" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-400">Location</Text>
                <Text
                  className="font-semibold text-gray-900 dark:text-white text-sm"
                  numberOfLines={1}
                >
                  {order.location?.label || 'Location'} - {order.location?.address || ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes Card */}
          {order.notes && (
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <Text className="text-xs text-gray-400 mb-1">Notes</Text>
              <Text className="text-gray-700 dark:text-gray-300">{order.notes}</Text>
            </View>
          )}

          {/* Payment Card */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                <CreditCard size={16} color={Colors.primary} />
              </View>
              <Text className="font-bold text-gray-900 dark:text-white">
                Payment
              </Text>
              <View className="flex-1" />
              <View className={`px-2 py-0.5 rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  order.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 dark:text-gray-400">Service</Text>
                <Text className="text-gray-900 dark:text-white">
                  {currency} {order.subtotal || 0}
                </Text>
              </View>
              {(order.addons_total || 0) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 dark:text-gray-400">Add-ons</Text>
                  <Text className="text-gray-900 dark:text-white">
                    {currency} {order.addons_total}
                  </Text>
                </View>
              )}
              {(order.discount || 0) > 0 && (
                <View className="flex-row justify-between">
                  <Text className="text-green-600">Discount</Text>
                  <Text className="text-green-600">-{currency} {order.discount}</Text>
                </View>
              )}
              <View className="h-px bg-gray-100 dark:bg-gray-700" />
              <View className="flex-row justify-between">
                <Text className="font-bold text-gray-900 dark:text-white">Total</Text>
                <Text className="font-bold text-primary">{currency} {order.total || 0}</Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-400">Payment Method</Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {order.payment_method || 'Cash'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500)} className="gap-2 pt-2">
          {/* Rate Order Button - for completed orders without rating */}
          {currentStatus === 'completed' && !order.rating && (
            <TouchableOpacity
              onPress={() => setShowRatingModal(true)}
              className="py-3 rounded-xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: Colors.primary }}
            >
              <Star size={18} color="#fff" />
              <Text className="text-white font-semibold">
                Rate Your Experience
              </Text>
            </TouchableOpacity>
          )}

          {/* Display existing rating */}
          {currentStatus === 'completed' && order.rating && (
            <View className="py-4 rounded-xl bg-green-50 dark:bg-green-900/20 items-center">
              <View className="flex-row items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    color="#FCD34D"
                    fill={star <= order.rating! ? '#FCD34D' : 'transparent'}
                  />
                ))}
              </View>
              <Text className="text-green-700 dark:text-green-400 font-medium">
                Thanks for your feedback!
              </Text>
              {order.review && (
                <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center px-4">
                  "{order.review}"
                </Text>
              )}
            </View>
          )}

          {['pending', 'confirmed', 'assigned'].includes(currentStatus) && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={isCancelling}
              className="py-3 rounded-xl border border-red-200 dark:border-red-800 flex-row items-center justify-center gap-2"
            >
              <X size={16} color="#EF4444" />
              <Text className="text-red-600 font-medium text-sm">
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Demo: Simulate Order Completion */}
          {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
            <TouchableOpacity
              onPress={() => {
                // Simulate order completion for demo
                setOrder((prev) => prev ? { ...prev, status: 'completed' } : prev);
                Toast.show({
                  type: 'success',
                  text1: 'Order Completed!',
                  text2: 'Your car wash is done. Please rate your experience.',
                });
                // Show rating modal after a short delay
                setTimeout(() => {
                  setShowRatingModal(true);
                }, 1500);
              }}
              className="py-3 rounded-xl bg-green-500 flex-row items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} color="#fff" />
              <Text className="text-white font-semibold">
                Demo: Complete Order
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="py-3 rounded-xl bg-gray-100 dark:bg-gray-800 flex-row items-center justify-center gap-2">
            <Phone size={16} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              Contact Support
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        orderId={orderId}
        washerName={order?.washer ? (order.washer as any).full_name : undefined}
        onClose={() => setShowRatingModal(false)}
        onSuccess={handleRatingSuccess}
      />
    </SafeAreaView>
  );
}
