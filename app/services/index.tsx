import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Car, Anchor, ArrowLeft, ChevronRight } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { Badge } from '@/components/ui';

const serviceCategories = [
  {
    id: 'car-wash',
    name: 'Car Wash',
    description: 'Professional car washing services',
    icon: Car,
    href: '/services/car-wash',
    count: 6,
    disabled: false,
  },
  {
    id: 'boat-services',
    name: 'Boat Services',
    description: 'Coming soon',
    icon: Anchor,
    href: '/services/boat',
    count: 0,
    disabled: true,
  },
];

export default function ServicesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-3 px-4 h-16">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
          >
            <ArrowLeft size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="font-semibold text-lg text-gray-900 dark:text-white">
            Services
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {serviceCategories.map((category) => {
          const Icon = category.icon;

          if (category.disabled) {
            return (
              <View
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 opacity-60"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center">
                    <Icon size={28} color="#9CA3AF" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white text-base">
                      {category.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </Text>
                  </View>
                  <Badge variant="default">Soon</Badge>
                </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push(category.href as any)}
              activeOpacity={0.7}
            >
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center gap-4">
                  <View className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center">
                    <Icon size={28} color={Colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white text-base">
                      {category.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </Text>
                  </View>
                  <Badge variant="primary">{category.count} services</Badge>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
