import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = 'large',
  color = Colors.primary,
  text,
  fullScreen = false,
  className,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text className="text-gray-500 dark:text-gray-400 mt-4 text-base">
            {text}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={cn('items-center justify-center py-8', className)}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
          {text}
        </Text>
      )}
    </View>
  );
}

// Skeleton loading component
export function Skeleton({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse',
        className
      )}
    />
  );
}

// Loading overlay
export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/30 items-center justify-center z-50">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </View>
  );
}
