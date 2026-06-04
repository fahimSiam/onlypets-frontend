# OnlyPets — Frontend

React Native (Expo) app for iOS and Android. A pet-only social media platform.

---

## What this app does

- **Feed** — Instagram-style post feed (images + videos) from followed users
- **Shorts** — TikTok-style vertical video feed (swipe up)
- **Discovery** — Trending posts grid + hashtag/user search
- **Nearby** — Tinder-like swipe cards to find and befriend pet owners near you
- **Profile** — Personal profile + linked pet pages with points and badges
- **DMs + Streaks** — Direct messages with Snapchat-style daily streak tracking
- **Stories** — 24-hour disappearing photo/video stories
- **Subscriptions** — 6 months free trial, then $1/month via Stripe

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 22+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | bundled with Node |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI (for builds) | latest | `npm install -g eas-cli` |
| Expo Go app | latest | [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) |

You need the **Expo Go** app on your phone to run the app on a real device during development, or you can use an iOS Simulator (Mac only) / Android Emulator.

---

## Quick start

### 1. Install dependencies

```bash
cd onlypets-frontend
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and set the API URL:

```env
# Point this to the running backend
EXPO_PUBLIC_API_URL=http://localhost:3000

# Get from Stripe Dashboard → Developers → API keys (use the publishable key)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudflare R2 public base URL (leave as-is for now if media not configured)
EXPO_PUBLIC_MEDIA_BASE_URL=https://media.onlypets.app
```

> **Note:** All environment variables in Expo must be prefixed with `EXPO_PUBLIC_` to be accessible in client code.

### 3. Start the backend first

The app needs the backend running. Follow the instructions in `../onlypets-backend/README.md` to start it, then come back here.

### 4. Start the Expo dev server

```bash
npm start
```

This opens the Expo Developer Tools in your terminal. Then:

- **On a real device** — Scan the QR code with the Expo Go app
- **iOS Simulator** (Mac only) — Press `i` in the terminal
- **Android Emulator** — Press `a` in the terminal

---

## Running on a physical device

If your phone and computer are on the same Wi-Fi, the default LAN connection works. If you're behind a corporate network or VPN:

```bash
# Use tunnel mode (slower but works on any network)
npm start -- --tunnel
```

To test on a device with a local backend, replace `localhost` in `.env` with your machine's local IP:

```bash
# Find your local IP
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

Then set:
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

---

## All available commands

```bash
# Start Expo dev server (interactive terminal)
npm start

# Start directly on Android emulator
npm run android

# Start directly on iOS simulator
npm run ios

# TypeScript type check (no emit)
npm run type-check

# Lint source files
npm run lint
```

---

## Building for distribution (EAS)

EAS Build compiles the native app in the cloud — no Xcode or Android Studio required.

### First-time setup

```bash
# Log in to your Expo account (create one free at expo.dev)
eas login

# Configure the project (run once)
eas build:configure
```

### Build commands

```bash
# Internal preview build — APK for Android, IPA for iOS (ad-hoc)
eas build --profile preview --platform all

# Production build — App Bundle for Android, IPA for iOS App Store
eas build --profile production --platform all

# Android only
eas build --profile production --platform android

# iOS only
eas build --profile production --platform ios
```

### Submit to stores

```bash
# Submit to Google Play Store (requires Google Play service account JSON)
eas submit --platform android

# Submit to Apple App Store (requires Apple credentials)
eas submit --platform ios
```

### OTA updates (without a new store submission)

```bash
# Push a JS-only update to all production users
eas update --branch production --message "Fix feed loading"
```

---

## Project structure

```
app/                        # Expo Router file-based navigation
├── _layout.tsx             # Root layout: QueryClient, Stripe, auth init
├── auth/
│   ├── _layout.tsx         # Redirects to tabs if already logged in
│   ├── login.tsx           # Email/password login
│   └── register.tsx        # Registration (6-month trial starts here)
├── tabs/
│   ├── _layout.tsx         # Bottom tab bar definition
│   ├── feed/index.tsx      # Home feed (follows + algorithm)
│   ├── shorts/index.tsx    # Vertical short video feed
│   ├── discovery/index.tsx # Trending grid + search
│   ├── swipe/index.tsx     # Nearby users — Tinder swipe
│   └── profile/index.tsx   # Own profile, pet pages, badges
└── modals/
    ├── create-post.tsx     # New post flow (image picker → R2 upload)
    └── settings.tsx        # Account settings + subscription status

src/
├── constants/
│   ├── colors.ts           # Brand color palette
│   ├── config.ts           # API URL, Stripe key (from env)
│   └── queryKeys.ts        # All TanStack Query cache keys in one place
├── types/
│   ├── api.types.ts        # ApiResponse<T> wrapper shape
│   ├── user.types.ts       # User, Pet, Badge, UserBadge
│   ├── post.types.ts       # Post, Story, Short
│   └── message.types.ts    # Message, Conversation
├── services/               # One file per backend module
│   ├── api.client.ts       # Axios instance with JWT + auto-refresh interceptor
│   ├── auth.service.ts     # login, register, logout, token storage
│   ├── users.service.ts    # Profile CRUD, follow, location
│   ├── feed.service.ts     # Home feed, trending
│   ├── posts.service.ts    # Create, like, view, delete
│   ├── media.service.ts    # Get R2 upload URL, upload file, init video
│   ├── discovery.service.ts # Nearby users, swipe, matches
│   └── payments.service.ts # Stripe subscribe, cancel, status
├── stores/
│   ├── auth.store.ts       # Global auth state (user, isAuthenticated)
│   └── notification.store.ts # Unread notification count
└── lib/
    └── socket.ts           # Socket.io client factory (lazy connect)
```

---

## Environment variables reference

```env
# Backend API base URL — no trailing slash
EXPO_PUBLIC_API_URL=http://localhost:3000
#   Local dev: http://localhost:3000
#   Staging:   https://api-staging.onlypets.app
#   Prod:      https://api.onlypets.app

# Stripe publishable key — safe to expose in client code (starts with pk_)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
#   Get from: Stripe Dashboard → Developers → API keys → Publishable key

# Cloudflare R2 public base URL for media
EXPO_PUBLIC_MEDIA_BASE_URL=https://media.onlypets.app
#   This is the public URL prefix for all R2-hosted images
#   Used to construct thumbnail and avatar URLs
```

---

## Authentication flow

1. User opens app → `_layout.tsx` calls `GET /users/me` with stored token
2. If token valid → user set in Zustand store → routed to `/(tabs)/feed`
3. If token expired → `api.client.ts` interceptor auto-calls `POST /auth/refresh`
4. If refresh fails → tokens cleared → routed to `/auth/login`
5. Tokens are stored in the device's **Secure Enclave** via `expo-secure-store` (not AsyncStorage)

---

## Media upload flow

### Image post
1. User picks image from gallery (`expo-image-picker`)
2. App calls `POST /media/upload/image` → gets `{ uploadUrl, publicUrl }`
3. App `PUT`s the image blob directly to `uploadUrl` (Cloudflare R2 signed URL)
4. App calls `POST /posts` with `{ mediaUrls: [publicUrl] }`

### Video / Short
1. User records or picks video
2. App calls `POST /media/upload/video/init` → gets `{ uploadUrl, videoId }`
3. App uploads video directly to Cloudflare Stream via `uploadUrl`
4. App calls `POST /shorts` with `{ cloudflareVideoId: videoId }`

---

## Navigation map

```
/auth/login           → Login screen
/auth/register        → Registration screen
/(tabs)/feed          → Home feed tab
/(tabs)/shorts        → Shorts tab (vertical scroll)
/(tabs)/discovery     → Explore / trending tab
/(tabs)/swipe         → Nearby swipe tab
/(tabs)/profile       → Own profile tab
/(modals)/create-post → New post sheet (modal)
/(modals)/settings    → Settings + subscription sheet (modal)
```

---

## Key libraries

| Library | Used for |
|---|---|
| `expo-router` | File-based navigation |
| `@tanstack/react-query` | Server state, caching, pagination |
| `zustand` | Client-only global state (auth, notifications) |
| `axios` | HTTP client with interceptors |
| `socket.io-client` | Real-time DMs |
| `react-hook-form` + `zod` | Form validation |
| `nativewind` | Tailwind CSS class names in React Native |
| `@shopify/flash-list` | High-performance scrolling lists |
| `expo-image` | Optimised image loading with caching |
| `expo-secure-store` | Encrypted token storage |
| `expo-location` | Geolocation for nearby swipe feature |
| `expo-notifications` | Push notification registration and handling |
| `@stripe/stripe-react-native` | In-app subscription payment |
| `react-native-reanimated` | Smooth animations |
| `moti` | Animation presets built on Reanimated |

---

## Common issues

**App can't connect to backend on device**
- Make sure your phone is on the same Wi-Fi as your computer
- Use your machine's LAN IP in `.env`, not `localhost`
- Or run `npm start -- --tunnel`

**Expo Go crashes on startup**
- Run `npm start -- --clear` to clear Metro cache

**TypeScript errors after `npm install`**
- Run `npm run type-check` to see all errors
- Common cause: mismatched `expo` SDK version vs a package — check `expo doctor`

**`npm install` fails on Apple Silicon Mac**
- Some native packages need Rosetta: `arch -x86_64 npm install`

---

## Deployment checklist (before going live)

- [ ] Set `EXPO_PUBLIC_API_URL` to production backend URL
- [ ] Replace `pk_test_` Stripe key with `pk_live_` key
- [ ] Set app version and build number in `app.json`
- [ ] Run `eas build --profile production --platform all`
- [ ] Test the production build on a real device before submitting
- [ ] Submit via `eas submit` or upload manually to App Store Connect / Google Play Console
