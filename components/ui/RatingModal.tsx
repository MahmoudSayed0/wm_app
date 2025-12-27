import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Award, Heart, Send, Sparkles, Star, ThumbsUp, User, Zap } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { rateOrder } from '@/lib/api/orders';
import { useThemeStore } from '@/stores';
import BottomSheet from './BottomSheet';

interface RatingModalProps {
  visible: boolean;
  orderId: string;
  washerName?: string;
  onClose: () => void;
  onSuccess?: (rating: number, review?: string) => void;
}

const RATING_EMOJIS = ['', '😕', '😐', '🙂', '😊', '🤩'];
const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'];

const QUICK_FEEDBACK = [
  { id: 'friendly', label: 'Friendly', icon: Heart },
  { id: 'professional', label: 'Professional', icon: Award },
  { id: 'fast', label: 'Fast Service', icon: Zap },
  { id: 'thorough', label: 'Thorough', icon: ThumbsUp },
];

function AnimatedStar({
  filled,
  index,
  onPress,
  rating,
}: {
  filled: boolean;
  index: number;
  onPress: () => void;
  rating: number;
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (filled && index === rating) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 120, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) })
      );
      rotation.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [filled, rating]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      entering={FadeIn.delay(300 + index * 80).duration(300)}
    >
      <TouchableOpacity
        onPress={onPress}
        className="p-1.5"
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        activeOpacity={0.7}
      >
        <View
          style={{
            shadowColor: filled ? '#FCD34D' : 'transparent',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: filled ? 0.4 : 0,
            shadowRadius: 6,
            elevation: filled ? 3 : 0,
          }}
        >
          <Star
            size={42}
            color={filled ? '#FBBF24' : '#D1D5DB'}
            fill={filled ? '#FBBF24' : 'transparent'}
            strokeWidth={1.5}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function QuickFeedbackChip({
  item,
  selected,
  onToggle,
}: {
  item: typeof QUICK_FEEDBACK[0];
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      <Icon size={14} color={selected ? Colors.primary : '#9CA3AF'} />
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function RatingModal({
  visible,
  orderId,
  washerName = 'your washer',
  onClose,
  onSuccess,
}: RatingModalProps) {
  const { isDarkMode } = useThemeStore();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setRating(0);
      setReview('');
      setSelectedFeedback([]);
    }
  }, [visible]);

  const toggleFeedback = (id: string) => {
    setSelectedFeedback((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select a rating',
        text2: 'Tap the stars to rate your experience',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine quick feedback with review
      const feedbackLabels = selectedFeedback
        .map((id) => QUICK_FEEDBACK.find((f) => f.id === id)?.label)
        .filter(Boolean);
      const fullReview = [
        feedbackLabels.length > 0 ? feedbackLabels.join(', ') : '',
        review.trim(),
      ]
        .filter(Boolean)
        .join('. ');

      await rateOrder(orderId, rating, fullReview || undefined);
      Toast.show({
        type: 'success',
        text1: 'Thank you for your feedback!',
        text2: 'Your rating helps us maintain quality service',
      });
      onSuccess?.(rating, fullReview || undefined);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to submit',
        text2: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      showCloseButton
      avoidKeyboard
    >
      {/* Header with Washer Avatar */}
      <View className="items-center pt-2 pb-6 px-6">
          {/* Avatar */}
          <View className="relative mb-4">
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.brandBeige }}
            >
              <User size={36} color={Colors.primary} />
            </View>
            {/* Sparkle decoration */}
            <View
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
            >
              <Sparkles size={16} color="#fff" />
            </View>
          </View>

          <Text
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}
          >
            Rate Your Experience
          </Text>
          <Text
            className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 text-center`}
          >
            How was your service with {washerName}?
          </Text>
        </View>

        {/* Stars */}
        <View className="flex-row items-center justify-center gap-1 pb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <AnimatedStar
              key={star}
              index={star}
              filled={star <= rating}
              rating={rating}
              onPress={() => setRating(star)}
            />
          ))}
        </View>

        {/* Rating Label with Emoji */}
        <View className="h-12 items-center justify-center mb-2">
          {rating > 0 && (
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl">{RATING_EMOJIS[rating]}</Text>
              <Text
                className="text-xl font-bold"
                style={{ color: Colors.primary }}
              >
                {STAR_LABELS[rating]}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Feedback Chips */}
        {rating > 0 && (
          <View className="px-6 pb-4">
            <Text
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              What did you like? (optional)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_FEEDBACK.map((item) => (
                <QuickFeedbackChip
                  key={item.id}
                  item={item}
                  selected={selectedFeedback.includes(item.id)}
                  onToggle={() => toggleFeedback(item.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Review Input */}
        {rating > 0 && (
          <View className="px-6 pb-4">
            <Text
              className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Additional comments (optional)
            </Text>
            <View
              className={`rounded-2xl overflow-hidden border ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <TextInput
                value={review}
                onChangeText={setReview}
                placeholder="Tell us more about your experience..."
                placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                multiline
                numberOfLines={3}
                maxLength={500}
                className={`p-4 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                style={{
                  minHeight: 90,
                  textAlignVertical: 'top',
                }}
              />
              <View className="px-4 pb-3 flex-row justify-end">
                <Text
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {review.length}/500
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="px-6 pt-2">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className={`flex-1 py-4 rounded-full items-center justify-center border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 py-4 rounded-full flex-row items-center justify-center gap-2"
              style={{
                backgroundColor: rating > 0 ? Colors.primary : '#E5E7EB',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Send size={18} color={rating > 0 ? '#fff' : '#9CA3AF'} />
                  <Text
                    className="font-semibold"
                    style={{ color: rating > 0 ? '#fff' : '#9CA3AF' }}
                  >
                    Submit
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </BottomSheet>
  );
}
