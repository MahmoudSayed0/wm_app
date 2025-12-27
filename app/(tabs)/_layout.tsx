import { Tabs } from 'expo-router';
import { ClipboardList, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.9;
const TAB_PADDING = 8;
const TAB_WIDTH = (TAB_BAR_WIDTH - TAB_PADDING * 2) / 3; // 3 tabs

import Colors from '@/constants/Colors';
import { useThemeStore } from '@/stores';

// Washman W logo icon
function WashmanIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 0.4} viewBox="0 0 34 12" fill="none">
      <Path
        d="M23.185 2.02985L23.1695 3.18067C23.1678 3.4215 23.271 3.66061 23.462 3.84984L28.6123 9.00015H26.3261L19.2801 1.95588C19.029 1.73569 18.709 1.61528 18.377 1.61528H17.8111V9.00015H15.623C14.8798 9.00015 14.1677 8.72664 13.6189 8.2295L13.0151 7.6257C12.9326 7.54485 12.8242 7.52765 12.7502 7.52765C12.5937 7.52765 12.4234 7.61022 12.4217 7.73408V9.00015H10.237C9.49213 9.00015 8.77996 8.72664 8.23122 8.2295L0 0H2.28616L9.33387 7.04771C9.45429 7.15264 9.59019 7.23521 9.73984 7.29198C9.89982 7.35391 10.0667 7.38487 10.237 7.38487C10.5466 7.38487 10.8098 7.19393 10.8133 6.9703L10.8287 5.82808C10.8287 5.58209 10.7238 5.33782 10.5277 5.14L5.38599 0H7.67387L14.7199 7.04599C14.971 7.26446 15.291 7.38487 15.623 7.38487H16.1941V0H18.377C19.1184 0 19.8289 0.273514 20.3794 0.767215L20.3931 0.780976L20.9849 1.37445C21.1036 1.49314 21.2945 1.49314 21.4218 1.43982C21.4683 1.42262 21.5766 1.36757 21.5783 1.26608V0H23.763C24.5062 0 25.2166 0.273514 25.7671 0.767215L25.7791 0.780976L34 9.00015H31.7138L24.6661 1.95588C24.415 1.73569 24.095 1.61528 23.763 1.61528C23.5996 1.61528 23.4431 1.66689 23.3312 1.75806C23.2384 1.83375 23.1867 1.93008 23.185 2.02985Z"
        fill={color}
      />
    </Svg>
  );
}

// Animated Tab Item - icon and text animate smoothly
function TabItem({
  isFocused,
  tab,
  inactiveColor,
  onPress,
}: {
  isFocused: boolean;
  tab: { label: string; isWashman?: boolean; icon?: any };
  inactiveColor: string;
  onPress: () => void;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 280,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [isFocused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * -4 },
      { scale: 0.95 + progress.value * 0.05 },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * -8 }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View style={[styles.tabContent, isFocused && styles.tabContentActive]}>
        <Animated.View style={iconStyle}>
          {tab.isWashman ? (
            <WashmanIcon
              color={isFocused ? Colors.primary : inactiveColor}
              size={28}
            />
          ) : (
            <tab.icon
              size={isFocused ? 22 : 24}
              color={isFocused ? Colors.primary : inactiveColor}
              strokeWidth={isFocused ? 2.5 : 2}
            />
          )}
        </Animated.View>
        {isFocused && (
          <Animated.Text style={[styles.activeLabel, textStyle]}>
            {tab.label}
          </Animated.Text>
        )}
      </View>
    </Pressable>
  );
}

// Custom Tab Bar with sliding background
function CustomTabBar({ state, navigation }: any) {
  const { isDarkMode } = useThemeStore();
  const bgColor = isDarkMode ? '#1F2937' : '#FFFFFF';
  const borderColor = isDarkMode ? '#374151' : '#E5E7EB';
  const inactiveColor = isDarkMode ? '#71717A' : '#9CA3AF';

  const tabs = [
    { name: 'index', label: 'Home', isWashman: true },
    { name: 'orders', label: 'Orders', icon: ClipboardList },
    { name: 'profile', label: 'Profile', icon: User },
  ];

  // Animated position for sliding background
  const translateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    translateX.value = withTiming(state.index * TAB_WIDTH, {
      duration: 280,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [state.index]);

  const animatedBgStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          shadowOpacity: isDarkMode ? 0.15 : 0.08,
        },
      ]}
    >
      {/* Sliding background indicator */}
      <Animated.View style={[styles.slidingBg, animatedBgStyle]} />

      {/* Tab items */}
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            tab={tab}
            inactiveColor={inactiveColor}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: '5%',
    right: '5%',
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: TAB_PADDING,
  },
  slidingBg: {
    position: 'absolute',
    left: TAB_PADDING,
    width: TAB_WIDTH,
    height: 50,
    backgroundColor: Colors.brandBeige,
    borderRadius: 25,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentActive: {
    gap: 8,
  },
  activeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
