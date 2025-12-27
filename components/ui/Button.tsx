import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-brand-beige',
    text: 'text-gray-800 font-semibold',
  },
  outline: {
    container: 'bg-white dark:bg-gray-800 border border-primary',
    text: 'text-primary font-semibold',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary font-medium',
  },
  destructive: {
    container: 'bg-red-500',
    text: 'text-white font-semibold',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-4 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-6 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-8 py-4 rounded-full',
    text: 'text-lg',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center',
        variantStyle.container,
        sizeStyle.container,
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50',
        className
      )}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text className={cn(variantStyle.text, sizeStyle.text, textClassName)}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
