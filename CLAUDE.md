# Washman Mobile - Claude Code Rules

## Project Overview

This is a React Native/Expo mobile app using NativeWind (Tailwind CSS for React Native), Expo Router for navigation, and Supabase for backend.

---

# Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

## Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into React Native with NativeWind conventions
6. Validate against Figma for 1:1 look and behavior before marking complete

## Implementation Rules

- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style
- IMPORTANT: Translate web Tailwind to NativeWind - not all web utilities work in React Native
- Replace web-specific elements with React Native equivalents:
  - `div` → `View`
  - `p`, `span`, `h1-h6` → `Text`
  - `img` → `Image` from `expo-image`
  - `button` → `Pressable` or `TouchableOpacity`
  - `input` → `TextInput`
  - `svg` → Icons from `lucide-react-native`
- Reuse existing components from `components/` instead of duplicating functionality
- Use the project's design tokens from `constants/DesignTokens.ts` consistently
- Strive for 1:1 visual parity with the Figma design
- Validate the final UI against the Figma screenshot for both look and behavior

---

## Component Organization

- **Shared components**: `components/`
- **Screen components**: `app/` (Expo Router file-based routing)
- **Hooks**: `hooks/`
- **API functions**: `lib/api/`
- **Constants & tokens**: `constants/`
- **Utilities**: `lib/utils.ts`

---

## Design Tokens

### Colors - Use from `constants/DesignTokens.ts`

```typescript
import { Colors } from '@/constants/DesignTokens';

// Brand
Colors.primary       // '#1F8783' - Main teal brand color
Colors.primaryDark   // '#12504E'
Colors.primaryLight  // 'rgba(31, 135, 131, 0.1)'

// Text
Colors.textPrimary   // '#090909'
Colors.textSecondary // '#1A1A1A'
Colors.textMuted     // '#6B7280'
Colors.textPlaceholder // '#9CA3AF'

// Background
Colors.background    // '#FCFCFC'
Colors.white         // '#FFFFFF'
Colors.inputBg       // '#F9FAFB'

// Status
Colors.success       // '#22C55E'
Colors.error         // '#DC2626'
Colors.warning       // '#D97706'
```

### NativeWind/Tailwind Colors (use in className)

```
primary           → #1F8783
primary-light     → #2A9D99
brand-beige       → #F9EFDB
background        → #FCFCFC
foreground        → #1A1A2E
muted             → #F4F4F5
muted-foreground  → #71717A
accent            → #E6F4F3
destructive       → #EF4444
success           → #10B981
warning           → #F59E0B
```

### Spacing - Use Tailwind scale or DesignTokens

```typescript
import { Spacing, ScreenPadding } from '@/constants/DesignTokens';

ScreenPadding.horizontal  // 24 - Screen side padding
Spacing[4]                // 16
Spacing[6]                // 24
```

### Border Radius

```typescript
import { BorderRadius } from '@/constants/DesignTokens';

BorderRadius.sm    // 4
BorderRadius.md    // 8
BorderRadius.lg    // 12
BorderRadius.xl    // 16
BorderRadius['2xl'] // 20
BorderRadius.full  // 70 (pills)
```

### Typography

```typescript
import { TextStyles, FontSize } from '@/constants/DesignTokens';

// Pre-defined text styles
TextStyles.heading1   // 26px, bold
TextStyles.heading2   // 25px, medium
TextStyles.body       // 15px, regular
TextStyles.caption    // 12px, muted
TextStyles.button     // 14px, medium

// Font sizes
FontSize.sm  // 12
FontSize.md  // 14
FontSize.lg  // 16
FontSize.xl  // 18
```

### Shadows

```typescript
import { Shadows } from '@/constants/DesignTokens';

Shadows.sm             // Subtle shadow
Shadows.md             // Medium shadow
Shadows.lg             // Large shadow
Shadows.primaryButton  // Teal-tinted button shadow
```

---

## Styling Approach

### Prefer NativeWind (Tailwind) for styling

```tsx
// Good - NativeWind classes
<View className="bg-white p-4 rounded-xl">
  <Text className="text-primary font-semibold text-lg">Title</Text>
</View>

// Also Good - Design tokens for complex styles
<View style={[ComponentStyles.card, Shadows.md]}>
  <Text style={TextStyles.heading2}>Title</Text>
</View>
```

### Common NativeWind patterns for this project

```tsx
// Cards
<View className="bg-white rounded-xl p-4 shadow-sm">

// Primary buttons
<Pressable className="bg-primary rounded-full py-4 px-6 items-center">
  <Text className="text-white font-semibold">Button</Text>
</Pressable>

// Inputs
<TextInput className="bg-gray-100 rounded-lg px-4 py-3 border-2 border-gray-200" />

// Screen container
<View className="flex-1 bg-background px-6">
```

---

## Asset Handling

- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages - use `lucide-react-native` for all icons
- Store downloaded assets in `assets/images/`
- Use `expo-image` for optimized image loading:

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
/>
```

---

## Icons

Use `lucide-react-native` exclusively:

```tsx
import { Home, User, Settings, ChevronRight } from 'lucide-react-native';

<Home size={24} color={Colors.primary} />
```

Icon sizes from tokens:
```typescript
import { IconSizes } from '@/constants/DesignTokens';

IconSizes.sm   // 18
IconSizes.md   // 20
IconSizes.lg   // 22
IconSizes.xl   // 24
IconSizes['2xl'] // 32
```

---

## Navigation

Uses Expo Router (file-based routing):

```
app/
├── _layout.tsx           # Root layout
├── index.tsx             # Entry/splash
├── (auth)/              # Auth group
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/              # Tab navigator
│   ├── _layout.tsx
│   ├── index.tsx        # Home tab
│   ├── orders.tsx
│   └── profile.tsx
└── booking/
    └── index.tsx
```

Navigation examples:
```tsx
import { router } from 'expo-router';

router.push('/booking');
router.replace('/(tabs)');
router.back();
```

---

## Forms

Use `react-hook-form` with `zod` validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

---

## State Management

Use Zustand for global state:

```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

## API Calls

Located in `lib/api/`. Use Supabase client:

```tsx
import { supabase } from '@/lib/supabase';
import { getOrders, createOrder } from '@/lib/api/orders';
```

---

## Animations

Use `react-native-reanimated`:

```tsx
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View entering={FadeIn} exiting={FadeOut}>
```

Animation durations from tokens:
```typescript
import { AnimationDuration } from '@/constants/DesignTokens';

AnimationDuration.fast   // 200ms
AnimationDuration.normal // 300ms
AnimationDuration.slow   // 500ms
```

---

## Bottom Sheets

Use `@gorhom/bottom-sheet`:

```tsx
import BottomSheet from '@gorhom/bottom-sheet';

<BottomSheet snapPoints={['25%', '50%']}>
  <View style={ComponentStyles.bottomSheetBackground}>
    {/* Content */}
  </View>
</BottomSheet>
```

---

## Component Patterns

### Screen Layout Pattern

```tsx
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenName() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Pattern

```tsx
<View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
  <Text className="text-lg font-semibold text-foreground">Title</Text>
  <Text className="text-muted-foreground mt-1">Description</Text>
</View>
```

### Button Variants

```tsx
// Primary
<Pressable className="bg-primary rounded-full py-4 items-center">
  <Text className="text-white font-semibold">Primary</Text>
</Pressable>

// Secondary
<Pressable className="bg-gray-100 rounded-full py-3 px-4">
  <Text className="text-foreground font-medium">Secondary</Text>
</Pressable>

// Outline
<Pressable className="border-2 border-primary rounded-full py-3 px-4">
  <Text className="text-primary font-medium">Outline</Text>
</Pressable>
```

---

## Import Aliases

Use path aliases defined in tsconfig:

```tsx
import { Colors } from '@/constants/DesignTokens';
import { useAuth } from '@/hooks/useAuth';
import { getOrders } from '@/lib/api/orders';
```

---

## Critical Rules Summary

1. IMPORTANT: Always use design tokens from `constants/DesignTokens.ts` - never hardcode colors, spacing, or typography
2. IMPORTANT: Use `lucide-react-native` for ALL icons - do not add other icon libraries
3. IMPORTANT: Translate Figma's web output to React Native equivalents (View, Text, Pressable, etc.)
4. IMPORTANT: Use NativeWind classes where possible, fall back to design tokens for complex styles
5. IMPORTANT: Follow the existing component patterns in `components/` and `app/` directories
6. IMPORTANT: Maintain 1:1 visual parity with Figma designs
