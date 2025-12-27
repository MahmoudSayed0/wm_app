import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      inputClassName,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = secureTextEntry !== undefined;

    return (
      <View className={cn('mb-4', containerClassName)}>
        {label && (
          <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            {label}
          </Text>
        )}
        <View
          className={cn(
            'flex-row items-center bg-gray-50 dark:bg-gray-800 rounded-xl border-2',
            error
              ? 'border-red-500'
              : 'border-transparent focus:border-primary'
          )}
        >
          {leftIcon && <View className="pl-4">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={cn(
              'flex-1 px-4 py-3 text-gray-900 dark:text-white text-base',
              inputClassName
            )}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="pr-4"
            >
              {showPassword ? (
                <EyeOff size={20} color="#9CA3AF" />
              ) : (
                <Eye size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
          {rightIcon && !isPassword && <View className="pr-4">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-red-500 text-sm mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className="text-gray-500 text-sm mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
