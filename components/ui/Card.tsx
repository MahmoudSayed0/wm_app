import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

interface CardPressableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm',
        'border border-gray-100 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardPressable({ children, className, ...props }: CardPressableProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm',
        'border border-gray-100 dark:border-gray-700',
        'active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('pb-3 border-b border-gray-100 dark:border-gray-700', className)}>
      {children}
    </View>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={cn('py-3', className)}>{children}</View>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('pt-3 border-t border-gray-100 dark:border-gray-700', className)}>
      {children}
    </View>
  );
}
