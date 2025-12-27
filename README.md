<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/images/wm.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/images/wm.svg">
  <img alt="Washman Logo" src="./assets/images/wm.svg" width="280">
</picture>

<br><br>

### Premium On-Demand Car Wash & Detailing Services

**Get your car washed anywhere, anytime — at your doorstep.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![NativeWind](https://img.shields.io/badge/NativeWind-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss)](https://nativewind.dev)

[Download iOS](#) • [Download Android](#) • [Web App](https://washman.app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Idea](#-the-idea)
- [Key Features](#-key-features)
- [Service Offerings](#-service-offerings)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [User Flow](#-user-flow)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Demo Mode](#-demo-mode)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Washman** is a mobile-first, on-demand car wash booking platform that connects vehicle owners with professional car wash service providers. Available in **Egypt** and **UAE**, Washman brings the car wash to your location — whether at home, office, or anywhere convenient.

### Why Washman?

- **Convenience** — Book a car wash in under 2 minutes
- **Quality** — Vetted, rated professional washers
- **Transparency** — Clear pricing with no hidden fees
- **Flexibility** — Choose your time, location, and service level
- **Real-time** — Track your washer and order status live

---

## 💡 The Idea

### The Problem

Traditional car wash experiences are broken:

| Pain Point | Impact |
|------------|--------|
| **Long wait times** | 30-60 minutes wasted at car wash stations |
| **Inconvenient locations** | Drive out of your way to find a car wash |
| **Inconsistent quality** | No guarantee of service standards |
| **Opaque pricing** | Hidden fees and upsells at checkout |
| **No flexibility** | Fixed operating hours, no appointments |

### Our Solution

Washman reimagines car care for the modern world:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📱 Open App  →  🅦 Select Car  →  📍 Set Location        │
│                                                             │
│   📅 Pick Time  →  💳 Pay  →  ✨ Car Washed!               │
│                                                             │
│          All in under 2 minutes, at YOUR location          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**On-demand service** — Professional washers come to you
**Rated providers** — See ratings, reviews, and track records
**Transparent pricing** — Know the exact price before booking
**Real-time tracking** — Watch your washer arrive on the map
**Quality guarantee** — Not satisfied? We'll make it right

### Business Model

```
Revenue Streams
├── 💰 Direct Bookings (Pay-per-wash)
│   └── Individual service purchases with vehicle-based pricing
│
├── 🎫 Membership Subscriptions
│   ├── Monthly plans with wash credits
│   ├── Quarterly plans (15% savings)
│   └── Annual plans (30% savings)
│
├── ⭐ Premium Add-ons
│   └── Engine cleaning, ceramic coating, leather treatment
│
└── 🌍 Multi-Market Expansion
    ├── Egypt (MVP) — EGP currency
    └── UAE/Dubai — AED currency, premium services
```

### Target Markets

| Market | Currency | Status | Special Features |
|--------|----------|--------|------------------|
| 🇪🇬 **Egypt** | EGP | Active | Core car wash services |
| 🇦🇪 **UAE/Dubai** | AED | Active | + Boat detailing, yacht services, window tinting |

---

## ✨ Key Features

### 1. Multi-Step Booking Wizard
Intuitive 6-step booking flow that guides users through vehicle selection, service choice, location, timing, and payment.

### 2. Vehicle Management
Save multiple vehicles with details:
- Make, model, year
- Vehicle type (Sedan, SUV, Luxury)
- License plate
- Color
- Set default vehicle

### 3. Smart Location Services
- Interactive map picker
- Save favorite locations (Home, Work, etc.)
- Automatic service zone detection
- Reverse geocoding for address lookup

### 4. Real-Time Order Tracking
- Live order status updates
- Washer location on map
- ETA calculations
- Push notifications

### 5. Membership System
- Pre-paid wash credits
- Tiered subscription plans
- Auto-renewal options
- Usage history & analytics

### 6. Multi-Language Support
- English (LTR)
- Arabic (RTL) with full layout mirroring
- Automatic locale detection

### 7. Multi-Currency Pricing
- Dynamic pricing by country
- EGP for Egypt
- AED for UAE

### 8. Flexible Payment Options
- Cash on delivery
- Paymob (Egyptian payment gateway)
- Instapay (Egyptian banking)
- Apple Pay (coming soon)
- Google Pay (coming soon)
- Membership credits

### 9. Dark Mode
Full dark theme support with system preference detection.

### 10. Offline Demo Mode
Test the complete app without backend connection using demo mode.

---

## 🧼 Service Offerings

### Car Wash Packages

| Package | Duration | Description | Best For |
|---------|----------|-------------|----------|
| **Express Glow** | 25 min | Quick exterior wash + interior refresh | Busy professionals |
| **Premium Shine** | 45 min | Full exterior + detailed interior cleaning | Regular maintenance |
| **Elite Care** | 60+ min | Complete luxury detailing experience | Special occasions |

### Add-On Services

| Add-On | Duration | Description |
|--------|----------|-------------|
| Engine Cleaning | +15 min | Deep clean engine bay |
| Ceramic Coating | +20 min | Premium paint protection |
| Leather Treatment | +15 min | Condition & protect leather surfaces |
| Interior Deep Clean | +20 min | Thorough interior vacuum & sanitization |
| Wheel Detailing | +10 min | Professional wheel & tire cleaning |

### Vehicle-Based Pricing

Pricing scales based on vehicle size and complexity:

| Vehicle Type | Price Modifier | Examples |
|--------------|----------------|----------|
| **Sedan** | Base price | Toyota Camry, BMW 3 Series |
| **SUV** | +25% | BMW X5, Range Rover Sport |
| **Luxury** | +50% | Mercedes S-Class, Bentley |

### Dubai-Exclusive Services

- 🛥️ **Boat Detailing** — Professional boat cleaning
- 🚤 **Yacht Polishing** — Premium yacht care
- 🪟 **Window Tinting** — Professional tint installation

---

## 🛠 Technology Stack

### Frontend

```
React Native (Expo SDK 52)
├── Expo Router ──────── File-based navigation
├── TypeScript ───────── Type safety
├── NativeWind ───────── Tailwind CSS for React Native
├── Reanimated 3 ─────── Smooth animations
└── Gesture Handler ──── Touch interactions
```

### State Management

```
Zustand
├── auth-store ────── User session & profile
├── booking-store ─── Multi-step booking state
├── theme-store ───── Dark/light mode
└── locale-store ──── Language preferences

React Hook Form + Zod ── Form handling & validation
```

### Backend

```
Supabase
├── PostgreSQL ──────── Primary database
├── Auth ────────────── Phone OTP authentication
├── Realtime ────────── Live subscriptions
├── Storage ─────────── Image uploads
└── Row Level Security ─ Data protection
```

### Maps & Location

```
React Native Maps ────── Map visualization
Expo Location ─────────── Device GPS
Nominatim ─────────────── Reverse geocoding (OpenStreetMap)
```

### UI Components

```
Lucide React Native ──── Icon library
Custom SVG Icons ─────── Vehicle type icons (Sedan, SUV, Luxury)
Bottom Sheet ─────────── Modal interactions
Toast Message ─────────── Notifications
```

---

## 🏗 Architecture

### Project Structure

```
washman-mobile/
│
├── 📱 app/                          # Screens (Expo Router)
│   ├── (auth)/                      # Authentication screens
│   │   ├── login.tsx                # Phone number input
│   │   ├── signup.tsx               # Registration
│   │   └── verify.tsx               # OTP verification
│   │
│   ├── (tabs)/                      # Main tab navigation
│   │   ├── index.tsx                # Home dashboard
│   │   ├── orders.tsx               # Order history
│   │   └── profile.tsx              # User profile
│   │
│   ├── booking/                     # Booking flow
│   │   └── index.tsx                # Multi-step wizard
│   │
│   ├── services/                    # Service browsing
│   │   ├── index.tsx                # Categories
│   │   └── car-wash.tsx             # Car wash details
│   │
│   ├── vehicles/                    # Vehicle management
│   │   └── index.tsx                # List & add vehicles
│   │
│   ├── locations/                   # Location management
│   │   └── index.tsx                # Saved addresses
│   │
│   ├── orders/                      # Order details
│   │   └── [id].tsx                 # Single order view
│   │
│   └── _layout.tsx                  # Root layout
│
├── 🧩 components/                   # Reusable components
│   ├── ui/                          # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   │
│   ├── icons/                       # Custom icons
│   │   └── CarIcons.tsx             # Vehicle SVGs
│   │
│   └── maps/                        # Map components
│       └── MapLocationPicker.tsx
│
├── 📚 lib/                          # Business logic
│   ├── api/                         # API layer
│   │   ├── orders.ts
│   │   ├── vehicles.ts
│   │   ├── locations.ts
│   │   ├── services.ts
│   │   └── zones.ts
│   │
│   ├── supabase.ts                  # Database client
│   ├── i18n.ts                      # Translations
│   └── utils.ts                     # Helpers
│
├── 🗄 stores/                       # Zustand stores
│   ├── auth-store.ts
│   ├── booking-store.ts
│   ├── theme-store.ts
│   └── index.ts
│
├── 📝 types/                        # TypeScript types
│   ├── database.types.ts            # Supabase generated
│   └── index.ts                     # App types
│
├── 🎣 hooks/                        # Custom hooks
│   └── useAuth.ts
│
├── 🔌 providers/                    # Context providers
│   └── AuthProvider.tsx
│
├── 📊 constants/                    # App constants
│   └── Colors.ts
│
└── 🎨 assets/                       # Static assets
    ├── fonts/                       # Euclid Circular A
    └── images/
```

### Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│  UI Screen   │────▶│ Zustand Store│────▶│  API Layer   │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                                         │
       │                                         ▼
       │                                 ┌──────────────┐
       │                                 │              │
       └─────────────────────────────────│   Supabase   │
              Real-time Updates          │              │
                                         └──────────────┘
```

---

## 🗄 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User accounts (name, phone, country, preferences) |
| `vehicles` | User vehicles (make, model, type, plate) |
| `locations` | Saved addresses with coordinates |
| `zones` | Service areas with GeoJSON boundaries |
| `services` | Service packages with pricing |
| `addons` | Optional add-on services |
| `orders` | Booking records |
| `order_addons` | Add-ons linked to orders |
| `washers` | Service provider profiles |
| `memberships` | User subscriptions |
| `membership_plans` | Available subscription tiers |
| `time_slots` | Booking availability |

### Order Status Flow

```
┌─────────┐    ┌───────────┐    ┌──────────┐    ┌────────────┐
│ PENDING │───▶│ CONFIRMED │───▶│ ASSIGNED │───▶│ ON_THE_WAY │
└─────────┘    └───────────┘    └──────────┘    └────────────┘
                                                      │
     ┌────────────────────────────────────────────────┘
     ▼
┌─────────┐    ┌─────────────┐    ┌───────────┐
│ ARRIVED │───▶│ IN_PROGRESS │───▶│ COMPLETED │
└─────────┘    └─────────────┘    └───────────┘
     │
     └──────────────────────────▶ ┌───────────┐
                                  │ CANCELLED │
                                  └───────────┘
```

### Entity Relationships

```
profiles ─┬─< vehicles
          ├─< locations
          ├─< orders
          └─< memberships

services ─┬─< addons
          └─< orders

orders ───< order_addons >─── addons

zones ────< locations
      ────< time_slots
```

---

## 🚀 User Flow

### Authentication

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  Enter Phone    │───▶│  Receive OTP     │───▶│  Verify Code    │
│  Number         │    │  via SMS         │    │  (6 digits)     │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │  Create/Update  │
                                               │  Profile        │
                                               │                 │
                                               └─────────────────┘
```

### Booking Flow

```
Step 1                Step 2              Step 3
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SELECT       │    │ CHOOSE       │    │ SELECT       │
│ VEHICLE      │───▶│ WASH TYPE    │───▶│ SERVICE &    │
│              │    │              │    │ ADD-ONS      │
│ • My Cars    │    │ • Exterior   │    │              │
│ • Add New    │    │ • Interior   │    │ • Express    │
│              │    │ • Full       │    │ • Premium    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
       ┌───────────────────────────────────────┘
       ▼
Step 4                Step 5              Step 6
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ PICK         │    │ SELECT       │    │ REVIEW &     │
│ LOCATION     │───▶│ DATE & TIME  │───▶│ CONFIRM      │
│              │    │              │    │              │
│ • Saved      │    │ • Calendar   │    │ • Summary    │
│ • Map Pick   │    │ • Time Slots │    │ • Payment    │
│              │    │              │    │ • Book!      │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Supabase** account ([Sign up](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/washman-mobile.git
cd washman-mobile

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Setup

Create a `.env` file with:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
EXPO_PUBLIC_APP_NAME=Washman
EXPO_PUBLIC_DEFAULT_LOCALE=en

# Development
EXPO_PUBLIC_DEMO_MODE=true
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Or with tunnel (for testing on device)
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

### Running on Device

1. Install **Expo Go** on your phone
2. Scan the QR code from terminal
3. App loads on your device

### Running on Simulator

```bash
# iOS Simulator (macOS only)
npx expo run:ios

# Android Emulator
npx expo run:android
```

---

## 🎮 Demo Mode

Test the app without a backend connection:

### Enable Demo Mode

```env
EXPO_PUBLIC_DEMO_MODE=true
```

### Demo Credentials

- **Phone**: Any valid format (e.g., +201234567890)
- **OTP Code**: `123456`

### What Works in Demo Mode

- ✅ Full booking flow
- ✅ Vehicle management (local storage)
- ✅ Location management (local storage)
- ✅ Service browsing
- ✅ Order history (mock data)
- ✅ Theme switching
- ✅ Language switching

---

## 🗺 Roadmap

### Completed

- [x] Core booking flow with 6-step wizard
- [x] Vehicle management (CRUD)
- [x] Location management with map picker
- [x] Multi-language support (AR/EN)
- [x] Dark/Light theme
- [x] Custom car type icons (Sedan, SUV, Luxury)
- [x] Animated floating tab bar
- [x] Supabase integration
- [x] Demo mode for testing

### In Progress

- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Membership subscription system
- [ ] Washer assignment & tracking

### Planned

- [ ] In-app chat with washer
- [ ] Rating & reviews system
- [ ] Referral program
- [ ] Apple Pay integration
- [ ] Google Pay integration
- [ ] Boat services (UAE)
- [ ] Promo codes & discounts
- [ ] Order history export

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **TypeScript** for all new files
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Write meaningful commit messages

### Development Guidelines

- Keep components small and focused
- Use Zustand for global state
- Use NativeWind for styling
- Add TypeScript types for all props
- Test on both iOS and Android

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Credits

### Development Team

Built with ❤️ by the **Washman Team**

### Technologies

- [Expo](https://expo.dev) — React Native framework
- [Supabase](https://supabase.com) — Backend as a Service
- [NativeWind](https://nativewind.dev) — Tailwind CSS for React Native
- [Zustand](https://zustand-demo.pmnd.rs) — State management
- [Lucide](https://lucide.dev) — Icon library

---

<div align="center">

<img src="./assets/images/wm.svg" alt="Washman" width="120">

**Your car deserves the best, wherever you are.**

[Website](https://washman.app) • [Support](mailto:support@washman.app) • [Twitter](https://twitter.com/washmanapp)

</div>
