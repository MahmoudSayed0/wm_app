import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
  primary: {
    container: 'bg-primary/10',
    text: 'text-primary',
  },
  secondary: {
    container: 'bg-brand-beige',
    text: 'text-gray-800',
  },
  success: {
    container: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    container: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    container: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
};

export function Badge({
  children,
  variant = 'default',
  className,
  textClassName,
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View
      className={cn(
        'px-2.5 py-1 rounded-full self-start',
        styles.container,
        className
      )}
    >
      <Text className={cn('text-xs font-medium', styles.text, textClassName)}>
        {children}
      </Text>
    </View>
  );
}

// Status badge specifically for order status
type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'on_the_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

const statusVariants: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'primary',
  assigned: 'primary',
  on_the_way: 'primary',
  arrived: 'success',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
};

interface StatusBadgeProps {
  status: OrderStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]} className={className}>
      {label}
    </Badge>
  );
}
