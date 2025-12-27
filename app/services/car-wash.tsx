import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import { Button, Badge } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { getServiceCategories } from '@/lib/api/services';
import type { ServiceDisplay, CountryCode } from '@/types';
import { toServiceDisplay } from '@/types';

type ServiceType = 'exterior_interior' | 'exterior_only' | 'interior_only';

// Demo services fallback
const demoServices: ServiceDisplay[] = [
  {
    id: 'express-glow',
    category_id: 'car-wash',
    slug: 'express-glow',
    name: 'Express Glow',
    description: 'Quick exterior wash and interior refresh.',
    duration_minutes: 25,
    price_sedan_eg: 120,
    price_suv_eg: 150,
    price_luxury_eg: 180,
    price_sedan_ae: 45,
    price_suv_ae: 55,
    price_luxury_ae: 70,
    service_type: 'exterior_interior',
    is_recommended: true,
    is_active: true,
    display_order: 1,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    features: ['Exterior hand wash', 'Interior vacuum', 'Window cleaning', 'Dashboard wipe-down', 'Air freshener'],
  },
  {
    id: 'royal-detailing',
    category_id: 'car-wash',
    slug: 'royal-detailing',
    name: 'Royal Detailing',
    description: 'Deep clean, gloss, and freshness in every detail.',
    duration_minutes: 40,
    price_sedan_eg: 260,
    price_suv_eg: 300,
    price_luxury_eg: 350,
    price_sedan_ae: 95,
    price_suv_ae: 110,
    price_luxury_ae: 130,
    service_type: 'exterior_interior',
    is_recommended: false,
    is_active: true,
    display_order: 2,
    image_url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop',
    features: ['Window & glass cleaning', 'Floor mat cleaning', 'Tire & rim cleaning', 'Exterior shampoo wash', 'Interior vacuuming', 'Interior perfuming', 'Dashboard wipe-down'],
  },
  {
    id: 'elite-shine',
    category_id: 'car-wash',
    slug: 'elite-shine',
    name: 'Elite Shine',
    description: 'High-pressure wash, deep shine, and fresh interior.',
    duration_minutes: 35,
    price_sedan_eg: 160,
    price_suv_eg: 200,
    price_luxury_eg: 240,
    price_sedan_ae: 60,
    price_suv_ae: 75,
    price_luxury_ae: 90,
    service_type: 'exterior_interior',
    is_recommended: false,
    is_active: true,
    display_order: 3,
    image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop',
    features: ['High-pressure exterior wash', 'Interior deep clean', 'Leather conditioning', 'Tire shine', 'Air freshener'],
  },
  {
    id: 'crystal-gloss-polish',
    category_id: 'car-wash',
    slug: 'crystal-gloss-polish',
    name: 'Crystal Gloss Polish',
    description: 'Premium polish and wax for a mirror-like finish.',
    duration_minutes: 45,
    price_sedan_eg: 180,
    price_suv_eg: 220,
    price_luxury_eg: 260,
    price_sedan_ae: 70,
    price_suv_ae: 85,
    price_luxury_ae: 100,
    service_type: 'exterior_interior',
    is_recommended: false,
    is_active: true,
    display_order: 4,
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
    features: ['Premium wax application', 'Paint correction', 'Chrome polishing', 'Exterior wash', 'Interior refresh'],
  },
  {
    id: 'luxe-clean',
    category_id: 'car-wash',
    slug: 'luxe-clean',
    name: 'Luxe Clean',
    description: 'Thorough exterior wash and polish for a stunning shine.',
    duration_minutes: 25,
    price_sedan_eg: 140,
    price_suv_eg: 170,
    price_luxury_eg: 200,
    price_sedan_ae: 50,
    price_suv_ae: 65,
    price_luxury_ae: 75,
    service_type: 'exterior_only',
    is_recommended: false,
    is_active: true,
    display_order: 5,
    image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop',
    features: ['Premium exterior wash', 'Wheel cleaning', 'Tire dressing', 'Window cleaning', 'Body dry'],
  },
  {
    id: 'fresh-start',
    category_id: 'car-wash',
    slug: 'fresh-start',
    name: 'Fresh Start',
    description: 'Comprehensive interior cleaning, vacuuming, and deodorizing.',
    duration_minutes: 20,
    price_sedan_eg: 100,
    price_suv_eg: 130,
    price_luxury_eg: 160,
    price_sedan_ae: 40,
    price_suv_ae: 50,
    price_luxury_ae: 60,
    service_type: 'interior_only',
    is_recommended: false,
    is_active: true,
    display_order: 6,
    image_url: 'https://images.unsplash.com/photo-1558618047-f4b511ce9cda?w=600&h=400&fit=crop',
    features: ['Full interior vacuum', 'Seat cleaning', 'Dashboard detailing', 'Door panel cleaning', 'Air freshener'],
  },
];

function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case 'exterior_interior':
      return 'Exterior + interior';
    case 'exterior_only':
      return 'Exterior Only';
    case 'interior_only':
      return 'Interior Only';
  }
}

function getServiceTypeStyle(type: ServiceType) {
  switch (type) {
    case 'exterior_interior':
      return 'bg-gray-100 dark:bg-gray-700';
    case 'exterior_only':
      return 'bg-blue-50 dark:bg-blue-900/30';
    case 'interior_only':
      return 'bg-amber-50 dark:bg-amber-900/30';
  }
}

function getServiceTypeTextStyle(type: ServiceType) {
  switch (type) {
    case 'exterior_interior':
      return 'text-gray-600 dark:text-gray-300';
    case 'exterior_only':
      return 'text-blue-600 dark:text-blue-400';
    case 'interior_only':
      return 'text-amber-600 dark:text-amber-400';
  }
}

function FeaturedServiceCard({ service, country }: { service: ServiceDisplay; country: CountryCode }) {
  const price = country === 'EG' ? service.price_suv_eg : service.price_suv_ae;
  const currency = country === 'EG' ? 'EGP' : 'AED';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/booking?serviceId=${service.id}` as any)}
      activeOpacity={0.9}
    >
      <View className="relative rounded-2xl overflow-hidden shadow-md">
        <Image
          source={{ uri: service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop' }}
          style={{ width: '100%', aspectRatio: 2 }}
          contentFit="cover"
        />
        {/* Gradient overlay */}
        <View className="absolute inset-0 bg-black/50" style={{ opacity: 0.5 }} />

        {/* Recommended Badge */}
        <View className="absolute top-3 left-3">
          <View className="px-3 py-1.5 rounded-full bg-brand-beige">
            <Text className="text-xs font-medium text-gray-800">
              Recommended
            </Text>
          </View>
        </View>

        {/* Duration Badge */}
        <View className="absolute top-3 right-3">
          <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-white/90">
            <Clock size={12} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-700">
              {service.duration_minutes} min
            </Text>
          </View>
        </View>

        {/* Service Info */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <View className="flex-row items-end justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-white text-xl font-bold mb-0.5">
                {service.name}
              </Text>
              <Text className="text-white/80 text-sm" numberOfLines={2}>{service.description}</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-lg">{currency} {price}</Text>
              <Text className="text-white/70 text-[10px] text-right">SUV price</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ServiceCard({ service, country }: { service: ServiceDisplay; country: CountryCode }) {
  const price = country === 'EG' ? service.price_suv_eg : service.price_suv_ae;
  const currency = country === 'EG' ? 'EGP' : 'AED';
  const serviceType = (service.service_type || 'exterior_interior') as ServiceType;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/booking?serviceId=${service.id}` as any)}
      activeOpacity={0.7}
    >
      <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        <View className="flex-row" style={{ height: 120 }}>
          {/* Service Image */}
          <Image
            source={{ uri: service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' }}
            style={{ width: 110, height: 120 }}
            contentFit="cover"
          />

          {/* Content */}
          <View className="flex-1 p-3 justify-between">
            {/* Top Section */}
            <View>
              {/* Service Type Badge */}
              <View
                className={`self-start px-2 py-0.5 rounded-full ${getServiceTypeStyle(serviceType)}`}
              >
                <Text
                  className={`text-[10px] font-medium ${getServiceTypeTextStyle(serviceType)}`}
                >
                  {getServiceTypeLabel(serviceType)}
                </Text>
              </View>

              {/* Title */}
              <Text
                className="font-bold text-gray-900 dark:text-white text-base mt-2"
                numberOfLines={1}
              >
                {service.name}
              </Text>

              {/* Description */}
              <Text
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                numberOfLines={2}
              >
                {service.description}
              </Text>
            </View>

            {/* Bottom Section */}
            <View className="flex-row items-center justify-between mt-2">
              {/* Price and Duration */}
              <View>
                <View className="flex-row items-center gap-1">
                  <Clock size={11} color="#9CA3AF" />
                  <Text className="text-[10px] text-gray-400">
                    {service.duration_minutes} min
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary mt-0.5">
                  {currency} {price}
                </Text>
              </View>

              {/* Book Button */}
              <Button variant="primary" size="sm">
                Book
              </Button>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CarWashScreen() {
  const { detectedCountry } = useAuthStore();
  const country: CountryCode = detectedCountry || 'EG';

  const [services, setServices] = useState<ServiceDisplay[]>(demoServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, [country]);

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const categories = await getServiceCategories(country);
      // Find car wash category and get its services
      const carWashCategory = categories.find(
        (c) => c.slug === 'car-wash' || c.name_en.toLowerCase().includes('car wash')
      );

      if (carWashCategory && carWashCategory.services.length > 0) {
        // Transform services to display format
        const displayServices = carWashCategory.services.map(s => toServiceDisplay(s, 'en'));
        setServices(displayServices);
      } else {
        // If no services from DB, use demo services
        setServices(demoServices);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError('Failed to load services');
      // Use demo services on error
      setServices(demoServices);
    } finally {
      setLoading(false);
    }
  };

  const recommendedService = services.find((s) => s.is_recommended);
  const otherServices = services.filter((s) => !s.is_recommended);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between px-4 h-16">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
            >
              <ArrowLeft size={20} color="#6B7280" />
            </TouchableOpacity>
            <Text className="font-semibold text-lg text-gray-900 dark:text-white">
              Car Wash
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadServices}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <RefreshCw size={18} color={loading ? '#9CA3AF' : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading services...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Featured/Recommended Service */}
          {recommendedService && <FeaturedServiceCard service={recommendedService} country={country} />}

          {/* Other Services */}
          {otherServices.map((service) => (
            <ServiceCard key={service.id} service={service} country={country} />
          ))}

          {/* Show count */}
          <View className="py-4">
            <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
              {services.length} services available
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
