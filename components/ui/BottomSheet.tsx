import React, { useEffect, useCallback, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';

import { useThemeStore } from '@/stores';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  showHandle?: boolean;
  maxHeight?: number;
  avoidKeyboard?: boolean;
  scrollable?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  showCloseButton = false,
  showHandle = true,
  maxHeight = SCREEN_HEIGHT * 0.85,
  avoidKeyboard = false,
  scrollable = true,
}: BottomSheetProps) {
  const { isDarkMode } = useThemeStore();

  // Use React state to track modal visibility (prevents race condition)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Animation values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const closeSheet = useCallback(() => {
    setIsModalVisible(false);
    setIsClosing(false);
    onClose();
  }, [onClose]);

  // Handle visibility changes
  useEffect(() => {
    if (visible && !isModalVisible && !isClosing) {
      // Opening
      setIsModalVisible(true);
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else if (!visible && isModalVisible && !isClosing) {
      // Closing - animate out first, then hide modal
      setIsClosing(true);
      opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 250, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(closeSheet)();
          }
        }
      );
    }
  }, [visible, isModalVisible, isClosing]);

  const handleClose = () => {
    if (isClosing) return; // Prevent double-close

    // Animate out then close
    setIsClosing(true);
    opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 250, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(closeSheet)();
        }
      }
    );
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isModalVisible) {
    return null;
  }

  const sheetContent = (
    <>
      {/* Handle */}
      {showHandle && (
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handle,
              { backgroundColor: isDarkMode ? '#4B5563' : '#D1D5DB' },
            ]}
          />
        </View>
      )}

      {/* Close Button */}
      {showCloseButton && (
        <TouchableOpacity
          onPress={handleClose}
          style={[
            styles.closeButton,
            { backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6' },
          ]}
          activeOpacity={0.7}
        >
          <X size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      )}

      {/* Content */}
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </>
  );

  const content = (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
              maxHeight,
            },
          ]}
        >
          {sheetContent}
        </Animated.View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isModalVisible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
});
