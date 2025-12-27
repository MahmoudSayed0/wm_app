import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  ClipboardList,
  Car,
  MapPin,
  ChevronRight,
  Calendar,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

import { Card, Button, Badge } from '@/components/ui';
import Colors from '@/constants/Colors';
import { t } from '@/lib/i18n';
import { getOrders } from '@/lib/api/orders';
import { useAuth } from '@/hooks';
import type { OrderWithRelations, OrderStatus } from '@/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  assigned: '#8B5CF6',
  on_the_way: '#3B82F6',
  arrived: '#10B981',
  in_progress: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

function OrderCard({ order }: { order: OrderWithRelations }) {
  const statusColor = STATUS_COLORS[order.status] || '#6B7280';
  const statusLabel = t(`orders.status.${order.status}`);

  const formattedDate = order.scheduled_date
    ? format(parseISO(order.scheduled_date), 'MMM d, yyyy')
    : '';
  const formattedTime = order.scheduled_time || '';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/orders/${order.id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
            {order.order_number}
          </Text>
          <Text className="font-semibold text-gray-900 dark:text-white">
            {order.service?.name_en || 'Car Wash'}
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          <Text style={{ color: statusColor }} className="text-xs font-medium">
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="gap-2 mb-3">
        {order.vehicle && (
          <View className="flex-row items-center gap-2">
            <Car size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {order.vehicle.make} {order.vehicle.model} • {order.vehicle.plate}
            </Text>
          </View>
        )}
        {order.location && (
          <View className="flex-row items-center gap-2">
            <MapPin size={14} color="#6B7280" />
            <Text
              className="text-sm text-gray-600 dark:text-gray-400 flex-1"
              numberOfLines={1}
            >
              {order.location.label} - {order.location.address}
            </Text>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <Calendar size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {formattedDate} at {formattedTime}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <Text className="font-bold text-primary text-lg">
          {order.total} EGP
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            View Details
          </Text>
          <ChevronRight size={16} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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

  const activeOrders = orders.filter(
    (o) => !['completed', 'cancelled'].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ['completed', 'cancelled'].includes(o.status)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('orders.title')}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          className={`flex-1 py-3 rounded-xl mr-2 ${
            activeTab === 'active'
              ? 'bg-primary'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'active' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('orders.active')} ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          className={`flex-1 py-3 rounded-xl ml-2 ${
            activeTab === 'completed'
              ? 'bg-primary'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'completed' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('orders.completed')} ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {displayOrders.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8 py-20">
              <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-6">
                <ClipboardList size={40} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
                {activeTab === 'active'
                  ? t('orders.noOrders')
                  : 'No completed orders'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
                {activeTab === 'active'
                  ? t('orders.bookFirst')
                  : 'Your completed orders will appear here'}
              </Text>
              {activeTab === 'active' && (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={() => router.push('/services/car-wash')}
                >
                  {t('home.bookNow')}
                </Button>
              )}
            </View>
          ) : (
            <View className="gap-4">
              {displayOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
