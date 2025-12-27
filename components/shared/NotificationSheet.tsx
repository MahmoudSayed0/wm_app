'use client';

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Car,
  Sparkles,
  CreditCard,
  UserCheck,
  Play,
  MapPin,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

import { BottomSheet } from '@/components/ui';
import Colors from '@/constants/Colors';

// Notification types
export type NotificationType =
  | 'booking_confirmed'
  | 'washer_assigned'
  | 'washer_on_way'
  | 'washer_arrived'
  | 'wash_started'
  | 'wash_completed'
  | 'payment_received'
  | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  read: boolean;
  createdAt: Date;
  orderId?: string;
}

interface NotificationSheetProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationPress?: (notification: Notification) => void;
}

const notificationIcons: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  booking_confirmed: { icon: CheckCircle2, color: '#22C55E', bg: 'bg-green-50' },
  washer_assigned: { icon: UserCheck, color: '#3B82F6', bg: 'bg-blue-50' },
  washer_on_way: { icon: Car, color: Colors.primary, bg: 'bg-primary/10' },
  washer_arrived: { icon: MapPin, color: '#F97316', bg: 'bg-orange-50' },
  wash_started: { icon: Play, color: '#6366F1', bg: 'bg-indigo-50' },
  wash_completed: { icon: Sparkles, color: '#D97706', bg: 'bg-amber-50' },
  payment_received: { icon: CreditCard, color: '#22C55E', bg: 'bg-green-50' },
  reminder: { icon: Clock, color: '#3B82F6', bg: 'bg-blue-50' },
};

export default function NotificationSheet({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationPress,
}: NotificationSheetProps) {
  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);
  const unreadCount = unreadNotifications.length;

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onNotificationPress?.(notification);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle>
      <View className="px-5 pb-8">
        {/* Title */}
        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">
                {unreadCount} new
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        {notifications.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
              <BellOff size={32} color="#9CA3AF" />
            </View>
            <Text className="font-medium text-gray-500 dark:text-gray-400">
              No notifications yet
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              We'll notify you when something arrives
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: Dimensions.get('window').height * 0.5 }}
          >
            {/* Unread Section */}
            {unreadNotifications.length > 0 && (
              <View className="mb-6">
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
                  New
                </Text>
                <View className="gap-2">
                  {unreadNotifications.map((notification) => {
                    const iconConfig = notificationIcons[notification.type];
                    const Icon = iconConfig.icon;
                    return (
                      <Animated.View
                        key={notification.id}
                        entering={FadeIn}
                        exiting={FadeOut}
                        layout={Layout}
                      >
                        <TouchableOpacity
                          onPress={() => handleNotificationPress(notification)}
                          activeOpacity={0.7}
                          className="flex-row gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10"
                        >
                          <View
                            className={`h-11 w-11 rounded-xl items-center justify-center ${iconConfig.bg}`}
                          >
                            <Icon size={20} color={iconConfig.color} />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-start justify-between gap-2">
                              <Text className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                                {notification.titleEn}
                              </Text>
                              <Text className="text-[10px] text-gray-400">
                                {formatTime(notification.createdAt)}
                              </Text>
                            </View>
                            <Text
                              className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                              numberOfLines={2}
                            >
                              {notification.messageEn}
                            </Text>
                          </View>
                          <View className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Read Section */}
            {readNotifications.length > 0 && (
              <View>
                <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
                  Earlier
                </Text>
                <View className="gap-2">
                  {readNotifications.map((notification) => {
                    const iconConfig = notificationIcons[notification.type];
                    const Icon = iconConfig.icon;
                    return (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => handleNotificationPress(notification)}
                        activeOpacity={0.7}
                        className="flex-row gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      >
                        <View
                          className={`h-11 w-11 rounded-xl items-center justify-center ${iconConfig.bg}`}
                        >
                          <Icon size={20} color={iconConfig.color} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-start justify-between gap-2">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                              {notification.titleEn}
                            </Text>
                            <Text className="text-[10px] text-gray-400">
                              {formatTime(notification.createdAt)}
                            </Text>
                          </View>
                          <Text
                            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                            numberOfLines={2}
                          >
                            {notification.messageEn}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={onMarkAllAsRead}
                className="py-4 mt-4"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-gray-500 text-center">
                  Mark all as read
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}
