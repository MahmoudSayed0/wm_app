import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  ClipboardList,
  Car,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  Navigation,
  Sparkles,
  AlertCircle,
  Play,
  Bell,
  Headphones,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

import { Button, Loading } from '@/components/ui';
import { NotificationSheet, SupportSheet } from '@/components/shared';
import Colors from '@/constants/Colors';
import { t } from '@/lib/i18n';
import { getOrders } from '@/lib/api/orders';
import { useAuth } from '@/hooks';
import type { OrderWithRelations, OrderStatus } from '@/types';

// Nice shadow style like Next.js
const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
};

const headerShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
};

// Status configuration with icons and colors
const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: typeof Clock;
    isActive: boolean;
  }
> = {
  pending: {
    label: 'Pending',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    icon: Clock,
    isActive: true,
  },
  confirmed: {
    label: 'Confirmed',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    icon: CheckCircle2,
    isActive: true,
  },
  assigned: {
    label: 'Washer Assigned',
    color: '#6366F1',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    icon: Car,
    isActive: true,
  },
  on_the_way: {
    label: 'On the Way',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: Navigation,
    isActive: true,
  },
  arrived: {
    label: 'Arrived',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    icon: MapPin,
    isActive: true,
  },
  in_progress: {
    label: 'Washing Now',
    color: Colors.primary,
    bgColor: 'rgba(31, 135, 131, 0.1)',
    borderColor: 'rgba(31, 135, 131, 0.3)',
    icon: Sparkles,
    isActive: true,
  },
  completed: {
    label: 'Completed',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    icon: CheckCircle2,
    isActive: false,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    icon: AlertCircle,
    isActive: false,
  },
};

// Status steps for progress bar
const statusSteps = [
  'pending',
  'confirmed',
  'assigned',
  'on_the_way',
  'arrived',
  'in_progress',
  'completed',
];

// Format time to 12-hour format
function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get vehicle image based on type
function getVehicleImage(type?: string) {
  // Use placeholder for now
  return null;
}

// Enhanced Order Card with status progression
function OrderCard({ order, index }: { order: OrderWithRelations; index: number }) {
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const currentStepIndex = statusSteps.indexOf(order.status);
  const currency = 'EGP';

  // Check if order is live (on_the_way, arrived, in_progress)
  const isLive = ['on_the_way', 'arrived', 'in_progress'].includes(order.status);

  const formattedDate = order.scheduled_date
    ? (() => {
        const date = new Date(order.scheduled_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
          return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return 'Tomorrow';
        } else {
          return format(parseISO(order.scheduled_date), 'MMM d');
        }
      })()
    : '';

  return (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <TouchableOpacity
        onPress={() => router.push(`/orders/${order.id}`)}
        activeOpacity={0.7}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2"
        style={[
          cardShadow,
          {
            borderColor: isLive ? 'rgba(31, 135, 131, 0.3)' : status.borderColor,
          },
        ]}
      >
        {/* Live indicator for active tracking */}
        {isLive && (
          <View className="bg-primary px-4 py-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-white" />
              <Text className="text-white text-xs font-semibold">Live Tracking</Text>
            </View>
            <Text className="text-white/80 text-xs">Tap to track</Text>
          </View>
        )}

        {/* Header with date/time and status */}
        <View
          className="px-4 py-3 flex-row items-center justify-between"
          style={{ backgroundColor: !isLive ? status.bgColor : 'transparent' }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: status.bgColor }}
            >
              <StatusIcon size={20} color={status.color} />
            </View>
            <View>
              <Text style={{ color: status.color }} className="text-sm font-bold">
                {status.label}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <Calendar size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedDate}
                </Text>
                <Text className="text-gray-300 dark:text-gray-600">•</Text>
                <Clock size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {order.scheduled_time ? formatTime(order.scheduled_time) : ''}
                </Text>
              </View>
            </View>
          </View>
          {order.status !== 'cancelled' && (
            <View className="items-end">
              <Text className="text-xs text-gray-400 dark:text-gray-500">{currency}</Text>
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {order.total}
              </Text>
            </View>
          )}
        </View>

        {/* Mini progress bar */}
        {status.isActive && order.status !== 'cancelled' && (
          <View className="px-4 py-2 bg-gray-50/50 dark:bg-gray-700/50">
            <View className="flex-row items-center gap-1">
              {statusSteps.slice(0, -1).map((step, i) => {
                const isComplete = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <View
                    key={step}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: isComplete
                        ? Colors.primary
                        : isCurrent
                        ? 'rgba(31, 135, 131, 0.5)'
                        : '#E5E7EB',
                    }}
                  />
                );
              })}
            </View>
          </View>
        )}

        <View className="p-4 pt-3">
          {/* Service & Vehicle */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-16 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 items-center justify-center border border-gray-100 dark:border-gray-600"
              style={{ padding: 8 }}
            >
              <Car size={24} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                {order.service?.name_en || 'Car Wash Service'}
              </Text>
              {order.vehicle && (
                <View className="flex-row items-center gap-2 mt-0.5">
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {order.vehicle.make} {order.vehicle.model}
                  </Text>
                  {order.vehicle.plate && (
                    <Text className="text-xs font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">
                      {order.vehicle.plate}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>

          {/* Location */}
          {order.location && (
            <View className="flex-row items-center gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <MapPin size={16} color={Colors.primary} />
              <Text
                className="text-sm text-gray-600 dark:text-gray-300 flex-1"
                numberOfLines={1}
              >
                {order.location.label || order.location.address}
              </Text>
            </View>
          )}

          {/* Action hint for live orders */}
          {isLive && (
            <View className="mt-3 flex-row items-center justify-center gap-2 py-2 bg-primary/5 rounded-lg">
              <Play size={16} color={Colors.primary} />
              <Text className="text-sm font-medium text-primary">
                Watch washer on map
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Empty state component
function EmptyState({ activeTab }: { activeTab: 'active' | 'completed' }) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-28 h-28 rounded-3xl bg-primary/10 items-center justify-center mb-6">
        <Car size={48} color={Colors.primary} />
      </View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {activeTab === 'active' ? t('orders.noOrders') : 'No Completed Orders'}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs">
        {activeTab === 'active'
          ? t('orders.bookFirst')
          : 'Your completed orders will appear here'}
      </Text>
      {activeTab === 'active' && (
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push('/services/car-wash')}
          style={{ paddingHorizontal: 32 }}
        >
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color="#fff" />
            <Text className="text-white font-semibold">{t('home.bookNow')}</Text>
          </View>
        </Button>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Demo notifications
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'washer_on_way' as const,
      titleEn: 'Washer On The Way',
      titleAr: 'الغاسل في الطريق',
      messageEn: 'Ahmed is heading to your location. ETA: 10 minutes.',
      messageAr: 'أحمد في طريقه إليك. الوصول خلال 10 دقائق.',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      type: 'booking_confirmed' as const,
      titleEn: 'Booking Confirmed',
      titleAr: 'تم تأكيد الحجز',
      messageEn: 'Your car wash has been confirmed for today.',
      messageAr: 'تم تأكيد غسيل سيارتك لليوم.',
      read: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // Sort orders by status priority
  const sortOrders = (orderList: OrderWithRelations[]) => {
    const statusPriority: Record<string, number> = {
      in_progress: 0,
      arrived: 1,
      on_the_way: 2,
      assigned: 3,
      confirmed: 4,
      pending: 5,
      completed: 6,
      cancelled: 7,
    };
    return [...orderList].sort(
      (a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99)
    );
  };

  const activeOrders = sortOrders(
    orders.filter((o) => !['completed', 'cancelled'].includes(o.status))
  );
  const completedOrders = sortOrders(
    orders.filter((o) => ['completed', 'cancelled'].includes(o.status))
  );

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header - Next.js style */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3" style={headerShadow}>
        <View className="flex-row items-center justify-between">
          {/* Left - Support Button */}
          <TouchableOpacity
            onPress={() => setShowSupport(true)}
            className="w-11 h-11 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 items-center justify-center"
            style={cardShadow}
            activeOpacity={0.7}
          >
            <Headphones size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Center - Title */}
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {t('orders.title')}
          </Text>

          {/* Right - Notification Button */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            className="w-11 h-11 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 items-center justify-center relative"
            style={cardShadow}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#6B7280" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 items-center justify-center">
                <Text className="text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl mr-2 ${
            activeTab === 'active'
              ? 'bg-primary'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
          style={activeTab === 'active' ? cardShadow : undefined}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'active' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl ml-2 ${
            activeTab === 'completed'
              ? 'bg-primary'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}
          style={activeTab === 'completed' ? cardShadow : undefined}
          activeOpacity={0.7}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'completed' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {displayOrders.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          displayOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))
        )}
      </ScrollView>

      {/* Notification Sheet */}
      <NotificationSheet
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Support Sheet */}
      <SupportSheet visible={showSupport} onClose={() => setShowSupport(false)} />
    </SafeAreaView>
  );
}
