'use client';

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import {
  Headphones,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  HelpCircle,
  FileText,
  ChevronRight,
  Shield,
} from 'lucide-react-native';

import { BottomSheet } from '@/components/ui';
import Colors from '@/constants/Colors';

interface SupportSheetProps {
  visible: boolean;
  onClose: () => void;
}

const supportOptions = [
  {
    id: 'call',
    label: 'Call Us',
    description: 'Talk to our support team',
    icon: Phone,
    iconColor: Colors.primary,
    iconBg: 'bg-primary/10',
    action: 'tel:+201234567890',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Chat with us on WhatsApp',
    icon: MessageCircle,
    iconColor: '#22C55E',
    iconBg: 'bg-green-50',
    action: 'https://wa.me/201234567890',
  },
  {
    id: 'email',
    label: 'Email Support',
    description: 'Get help via email',
    icon: Mail,
    iconColor: '#3B82F6',
    iconBg: 'bg-blue-50',
    action: 'mailto:support@washman.app',
  },
];

const quickLinks = [
  {
    id: 'faq',
    label: 'FAQs',
    icon: HelpCircle,
  },
  {
    id: 'terms',
    label: 'Terms',
    icon: FileText,
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
  },
];

export default function SupportSheet({ visible, onClose }: SupportSheetProps) {
  const handleAction = (action: string) => {
    Linking.openURL(action).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} showHandle>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
      >
        {/* Hero */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <Headphones size={32} color={Colors.primary} />
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Help Center
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            We're here to help
          </Text>
        </View>

        {/* Working Hours */}
        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 items-center justify-center">
              <Clock size={20} color="#D97706" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                Working Hours
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                Daily 1 PM - 10 PM
              </Text>
            </View>
            <View className="bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-medium text-green-600 dark:text-green-400">
                Open
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Options */}
        <View className="mb-6">
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
            Contact Us
          </Text>
          <View className="gap-3">
            {supportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleAction(option.action)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View className={`h-12 w-12 rounded-xl items-center justify-center ${option.iconBg}`}>
                    <Icon size={24} color={option.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Links */}
        <View>
          <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 px-1">
            Quick Links
          </Text>
          <View className="flex-row gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <TouchableOpacity
                  key={link.id}
                  activeOpacity={0.7}
                  className="flex-1 items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
                >
                  <Icon size={20} color="#6B7280" />
                  <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
