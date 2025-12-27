import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  MapPin,
  ChevronDown,
  Car,
  Anchor,
  Sparkles,
  ChevronRight,
  Map,
  Clock,
  Calendar,
  Plus,
  Star,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, CardPressable, Button, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores';
import Colors from '@/constants/Colors';
import { getOrders, getActiveOrders } from '@/lib/api/orders';
import { getVehicles } from '@/lib/api/vehicles';
import { getLocations } from '@/lib/api/locations';
import { useAuth } from '@/hooks';
import type { OrderWithRelations, Vehicle, Location as LocationType } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// High quality car wash images
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80',
  'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

const CAR_IMAGES: Record<string, string> = {
  sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
  pickup: 'https://images.unsplash.com/photo-1558383331-f520f2888351?w=400&q=80',
  luxury: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80',
};

const SERVICE_IMAGE = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400&q=80';

export default function HomeScreen() {
  const { profile, detectedCountry } = useAuthStore();
  const { isAuthenticated } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Guest';
  const currency = detectedCountry === 'AE' ? 'AED' : 'EGP';

  const [activeOrders, setActiveOrders] = useState<OrderWithRelations[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderWithRelations[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroImageIndex] = useState(Math.floor(Math.random() * HERO_IMAGES.length));

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const [ordersData, vehiclesData, locationsData] = await Promise.all([
        getOrders().catch(() => []),
        getVehicles().catch(() => []),
        getLocations().catch(() => []),
      ]);

      // Separate active and completed orders
      const active = ordersData.filter(o => !['completed', 'cancelled'].includes(o.status));
      const completed = ordersData.filter(o => ['completed', 'cancelled'].includes(o.status)).slice(0, 3);

      setActiveOrders(active);
      setRecentOrders(completed);
      setVehicles(vehiclesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const defaultLocation = locations.find(l => l.is_default) || locations[0];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {getGreeting()}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {firstName} 👋
              </Text>
            </View>

            {/* Location Selector */}
            <TouchableOpacity
              onPress={() => router.push('/locations')}
              className="flex-row items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <MapPin size={14} color={Colors.primary} />
              <Text
                className="text-gray-700 dark:text-gray-300 text-sm font-medium mx-2 max-w-[80px]"
                numberOfLines={1}
              >
                {defaultLocation?.label || 'Add Location'}
              </Text>
              <ChevronDown size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card with Image */}
        <Animated.View entering={FadeInDown.delay(100)} className="px-4 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/services/car-wash')}
            activeOpacity={0.9}
          >
            <View className="relative rounded-3xl overflow-hidden" style={{ height: 180 }}>
              <Image
                source={{ uri: HERO_IMAGES[heroImageIndex] }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
              {/* Gradient Overlay */}
              <View className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

              {/* Content */}
              <View className="absolute inset-0 p-5 justify-between">
                <View>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Sparkles size={16} color="#FCD34D" />
                    <Text className="text-amber-300 text-xs font-semibold uppercase tracking-wide">
                      Premium Service
                    </Text>
                  </View>
                  <Text className="text-white text-2xl font-bold">
                    Your car deserves
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    the best care
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push('/services/car-wash')}
                  >
                    Book Now
                  </Button>
                  <View className="flex-row items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                    <Star size={12} color="#FCD34D" fill="#FCD34D" />
                    <Text className="text-white text-xs font-medium">4.9 Rating</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200)} className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Active Order
              </Text>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Text className="text-xs text-green-600 font-medium">Live</Text>
              </View>
            </View>

            {activeOrders.slice(0, 1).map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/orders/${order.id}`)}
                activeOpacity={0.7}
              >
                <View className="bg-primary rounded-2xl p-4 shadow-lg">
                  <View className="flex-row items-center justify-between mb-3">
                    <View>
                      <Text className="text-white/70 text-xs">
                        {order.order_number}
                      </Text>
                      <Text className="text-white font-bold text-base">
                        {(order.service as any)?.name_en || 'Car Wash Service'}
                      </Text>
                    </View>
                    <View className="bg-white/20 px-3 py-1 rounded-full">
                      <Text className="text-white text-xs font-medium capitalize">
                        {order.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <Calendar size={14} color="white" style={{ opacity: 0.7 }} />
                      <Text className="text-white/80 text-xs">
                        {order.scheduled_date ? format(parseISO(order.scheduled_date), 'MMM d') : '-'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Clock size={14} color="white" style={{ opacity: 0.7 }} />
                      <Text className="text-white/80 text-xs">
                        {order.scheduled_time || '-'}
                      </Text>
                    </View>
                    <View className="flex-1" />
                    <Text className="text-white font-bold">
                      {currency} {order.total}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* My Vehicles */}
        {vehicles.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)} className="mb-6">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                My Vehicles
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/vehicles')}
                className="flex-row items-center gap-1"
              >
                <Plus size={14} color={Colors.primary} />
                <Text className="text-primary text-sm font-medium">Add</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => router.push('/vehicles')}
                  activeOpacity={0.7}
                >
                  <View
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
                    style={{ width: 160 }}
                  >
                    <Image
                      source={{ uri: CAR_IMAGES[vehicle.type] || CAR_IMAGES.sedan }}
                      style={{ width: 160, height: 90 }}
                      contentFit="cover"
                    />
                    <View className="p-3">
                      <Text className="font-bold text-gray-900 dark:text-white text-sm" numberOfLines={1}>
                        {vehicle.make} {vehicle.model}
                      </Text>
                      <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                          {vehicle.year}
                        </Text>
                        <Text className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                          {vehicle.plate}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Services Section */}
        <Animated.View entering={FadeInDown.delay(400)} className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Services
          </Text>

          {/* Car Wash Service */}
          <TouchableOpacity
            onPress={() => router.push('/services/car-wash')}
            activeOpacity={0.7}
          >
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-3">
              <View className="flex-row">
                <Image
                  source={{ uri: SERVICE_IMAGE }}
                  style={{ width: 100, height: 100 }}
                  contentFit="cover"
                />
                <View className="flex-1 p-3 justify-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                      <Car size={18} color={Colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 dark:text-white">
                        Car Wash
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Professional car washing
                      </Text>
                    </View>
                    <Badge variant="primary">6 services</Badge>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Boat Services - Coming Soon */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 opacity-60 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                <Anchor size={24} color="#9CA3AF" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white">
                  Boat Services
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Coming Soon
                </Text>
              </View>
              <Badge variant="default">Soon</Badge>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(500)} className="px-4 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/zones')}
              className="flex-1"
              activeOpacity={0.7}
            >
              <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                <Map size={24} color="#3B82F6" />
                <Text className="font-semibold text-gray-900 dark:text-white mt-2">
                  Service Areas
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Check coverage
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/locations')}
              className="flex-1"
              activeOpacity={0.7}
            >
              <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
                <MapPin size={24} color="#10B981" />
                <Text className="font-semibold text-gray-900 dark:text-white mt-2">
                  My Locations
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {locations.length} saved
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Recent Orders */}
        <Animated.View entering={FadeInDown.delay(600)} className="px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Orders
            </Text>
            {recentOrders.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
                <Text className="text-primary font-medium text-sm">View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentOrders.length === 0 ? (
            <Card>
              <View className="items-center py-8">
                <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
                  <Car size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 dark:text-white font-medium mb-1">
                  No orders yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-4">
                  Book your first car wash service
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/services/car-wash')}
                >
                  Book Now
                </Button>
              </View>
            </Card>
          ) : (
            <View className="gap-3">
              {recentOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => router.push(`/orders/${order.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center">
                          <Car size={20} color="#6B7280" />
                        </View>
                        <View>
                          <Text className="font-semibold text-gray-900 dark:text-white">
                            {(order.service as any)?.name_en || 'Car Wash'}
                          </Text>
                          <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {order.scheduled_date ? format(parseISO(order.scheduled_date), 'MMM d, yyyy') : '-'}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-gray-900 dark:text-white">
                          {currency} {order.total}
                        </Text>
                        <View className={`px-2 py-0.5 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Text className={`text-[10px] font-medium ${
                            order.status === 'completed' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {order.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
