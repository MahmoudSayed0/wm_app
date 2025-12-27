# Washman Design System

A comprehensive guide to the Washman mobile app design language.

---

## Brand Colors

### Primary Gradient
The signature Washman gradient used for buttons, highlights, and accent elements.

```
Start: #1F8783 (Teal)
End:   #12504E (Dark Teal)
Direction: Horizontal (left to right)
```

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#1F8783` | Main brand color, buttons, links |
| Primary Dark | `#12504E` | Gradient end, dark accents |
| Primary Light | `#1F878310` | Selected states background (10% opacity) |
| Background | `#FCFCFC` | Main app background |
| White | `#FFFFFF` | Cards, inputs, overlays |
| Black | `#090909` | Primary text, headings |
| Text Primary | `#1A1A1A` | Body text, labels |
| Text Secondary | `#374151` | Secondary text |
| Text Muted | `#6B7280` | Hints, descriptions |
| Text Placeholder | `#9CA3AF` | Input placeholders |
| Text Light | `#949494` | Disabled text, captions |
| Border | `#E5E7EB` | Input borders, dividers |
| Border Light | `#D1D5DB` | Subtle borders |
| Input Background | `#F9FAFB` | Text input backgrounds |
| Input Background Alt | `#F3F4F6` | Alternative input bg |
| Input Background Dark | `#F2F2F2` | OTP input backgrounds |

### Status Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#22C55E` | Success states, confirmations |
| Success Light | `#DCFCE7` | Success background |
| Success Dark | `#166534` | Success text |
| Error | `#DC2626` | Error states |
| Error Light | `#FEF2F2` | Error background |
| Error Border | `#FECACA` | Error border |
| Warning | `#D97706` | Warnings, luxury category |

---

## Typography

### Font Family
- iOS: System (San Francisco)
- Android: Roboto
- Monospace (plates): Menlo (iOS) / monospace (Android)

### Text Styles

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Heading 1 | 26px | 700 | - | Screen titles |
| Heading 2 | 25px | 500 | - | Section titles |
| Heading 3 | 24px | 700 | - | Card titles |
| Heading 4 | 20px | 700 | - | Sheet headers |
| Body Large | 16px | 400 | - | Primary body text |
| Body | 15px | 400 | - | Input text |
| Body Small | 14px | 400/500 | - | Labels, buttons |
| Caption | 12px | 400 | - | Hints, timestamps |
| Caption Small | 11px | 300 | - | Badges |
| Monospace | 22px | - | - | License plates |
| OTP | 30px | 500 | - | OTP digits |

---

## Spacing

### Base Unit
Base spacing unit: **4px**

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Minimal gaps |
| sm | 6px | Tight spacing |
| md | 8px | Small gaps |
| lg | 10px | Medium gaps |
| xl | 12px | Standard gaps |
| 2xl | 14px | Input padding |
| 3xl | 16px | Button padding, cards |
| 4xl | 20px | Section padding |
| 5xl | 24px | Screen padding |
| 6xl | 28px | Large sections |
| 7xl | 32px | Title margins |
| 8xl | 40px | Bottom padding |

### Screen Padding
- Horizontal: `20-24px`
- Top (after safe area): `8-20px`
- Bottom: `20-40px`

---

## Border Radius

| Name | Value | Usage |
|------|-------|-------|
| none | 0px | - |
| sm | 4px | Small tags |
| md | 8px | OTP inputs, small cards |
| lg | 12px | Inputs, cards |
| xl | 16px | Large cards, buttons |
| 2xl | 20px | Chips, tags |
| 3xl | 22px | Color circles |
| 4xl | 24px | Bottom sheets |
| full | 70px | Pill buttons |
| circle | 50% | Avatar, icons |

---

## Shadows

### Primary Button Shadow
```javascript
{
  shadowColor: '#1F8783',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 8
}
```

### Card Shadow
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4
}
```

### Selected Item Shadow
```javascript
{
  shadowColor: '#1F8783',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4
}
```

---

## Components

### Gradient Button (Primary)
```javascript
<LinearGradient
  colors={['#1F8783', '#12504E']}
  start={{ x: 0, y: 0.5 }}
  end={{ x: 1, y: 0.5 }}
  style={{
    paddingVertical: 16,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Text style={{ fontSize: 14, fontWeight: '500', color: '#FCFCFC' }}>
    Button Text
  </Text>
</LinearGradient>
```

### Disabled Button
```javascript
colors={['#BBBBBB', '#999999']}
```

### Text Input
```javascript
{
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 14,
  borderWidth: 2,
  borderColor: '#E5E7EB', // or Colors.primary when focused/filled
  fontSize: 15,
  color: '#1A1A1A',
}
```

### OTP Input Box
```javascript
{
  width: 45,
  height: 45,
  borderRadius: 8,
  backgroundColor: '#F2F2F2',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### Badge/Chip
```javascript
{
  paddingVertical: 6,
  paddingHorizontal: 13,
  borderRadius: 32,
}
// With gradient background for primary
// With #F3F4F6 background for secondary
```

### Back Button
```javascript
{
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#F3F4F6',
  alignItems: 'center',
  justifyContent: 'center',
}
```

### Bottom Sheet
```javascript
{
  backgroundStyle: { borderRadius: 24 },
  handleIndicatorStyle: { backgroundColor: '#D1D5DB', width: 40 },
}
```

### License Plate Input
```javascript
{
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: '#D1D5DB', // or Colors.primary when filled
  borderRadius: 12,
  paddingVertical: 4,
}
// Inner text input:
{
  fontSize: 22,
  fontFamily: 'Menlo', // iOS
  letterSpacing: 4,
  textAlign: 'center',
  paddingVertical: 14,
  color: '#374151',
}
```

### Color Picker Circle
```javascript
{
  width: 44,
  height: 44,
  borderRadius: 22,
  borderWidth: 2,
  // borderColor: Colors.primary when selected, else color value
  alignItems: 'center',
  justifyContent: 'center',
}
```

### Vehicle Type Selector
```javascript
{
  flex: 1,
  paddingVertical: 14,
  paddingHorizontal: 8,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: isSelected ? Colors.primary : '#E5E7EB',
  backgroundColor: isSelected ? `${Colors.primary}10` : '#fff',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
}
```

### Error Message Box
```javascript
{
  backgroundColor: '#FEF2F2',
  borderWidth: 1,
  borderColor: '#FECACA',
  borderRadius: 12,
  padding: 16,
}
```

### Success Overlay
```javascript
// Green circle with icon
{
  width: 96,
  height: 96,
  borderRadius: 48,
  backgroundColor: '#22C55E',
  alignItems: 'center',
  justifyContent: 'center',
}
```

---

## Animations

### Library
Using `react-native-reanimated`

### Entry Animations

| Animation | Delay Pattern | Duration |
|-----------|---------------|----------|
| FadeIn | - | 300ms |
| FadeInDown | 100ms increments | 500ms |

### Common Patterns
```javascript
// Staggered entry
entering={FadeInDown.delay(100).duration(500)}  // First item
entering={FadeInDown.delay(200).duration(500)}  // Second item
entering={FadeInDown.delay(300).duration(500)}  // Third item

// Simple fade
entering={FadeIn.duration(300)}

// Success animation delay
setTimeout(() => { /* action */ }, 1000);
```

---

## Icons

### Library
Using `lucide-react-native`

### Common Sizes

| Usage | Size |
|-------|------|
| Navigation | 22px |
| Buttons | 20px |
| Inputs | 18-20px |
| Large display | 24px |
| Success overlay | 48px |
| Category icons | 18px |

### Common Icons
- Navigation: `ArrowLeft`, `ArrowRight`, `ChevronDown`, `X`
- Actions: `Check`, `Search`, `Plus`, `Edit`, `Trash`
- Auth: `Eye`, `EyeOff`, `ShieldCheck`, `Phone`
- Vehicles: `Car`, `Crown` (luxury), `Truck` (SUV)
- Status: `MapPin`, `Clock`, `Calendar`

---

## Layout Patterns

### Screen Structure
```
SafeAreaView
└── KeyboardAvoidingView
    └── ScrollView (contentContainerStyle: flexGrow: 1)
        ├── Back Button (if applicable)
        ├── Title Section
        │   ├── Heading
        │   └── Subtitle
        ├── Content Sections
        │   └── ... (with FadeInDown animations)
        ├── Spacer (flex: 1)
        └── Bottom Actions
            ├── Primary Button
            ├── Secondary Action (optional)
            └── Progress Dots (optional)
```

### Progress Dots
```javascript
// Active/Completed
{ width: 24, height: 6, borderRadius: 3, backgroundColor: Colors.primary }
// Inactive
{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary }
```

---

## Responsive Considerations

### Platform Differences
```javascript
Platform.OS === 'ios' ? 'padding' : 'height'  // KeyboardAvoidingView
Platform.OS === 'ios' ? 'System' : 'Roboto'   // Font family
Platform.OS === 'ios' ? 'Menlo' : 'monospace' // Monospace font
```

### Safe Areas
Always wrap screens in `SafeAreaView` from `react-native-safe-area-context`

---

## Toast Notifications

### Library
Using `react-native-toast-message`

### Usage
```javascript
Toast.show({
  type: 'success', // or 'error'
  text1: 'Title',
  text2: 'Description',
});
```

---

## Best Practices

1. **Consistency**: Always use the defined color variables, never hardcode hex values
2. **Gradients**: Use LinearGradient for primary actions, solid colors for secondary
3. **Spacing**: Follow the 4px base unit system
4. **Animations**: Use staggered delays for list/form items
5. **Accessibility**: Maintain contrast ratios, use proper touch targets (min 44px)
6. **RTL Support**: Prepare for Arabic (right-to-left) layout support
