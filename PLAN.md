# OnlyPets — Frontend Plan (React Native + Expo)
## Stack Overview

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 52 |
| Language | TypeScript |
| Navigation | Expo Router v3 (file-based, tab + stack) |
| State | Zustand (global) + TanStack Query (server state) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| Animations | React Native Reanimated v3 + Moti |
| Video | Expo AV + expo-video |
| Camera | react-native-vision-camera |
| Gestures | React Native Gesture Handler |
| Real-time | Socket.io client |
| Payments | Stripe React Native SDK |
| Push | Expo Notifications |
| Maps/Location | expo-location |
| Image | expo-image (cached, fast) |
| Forms | React Hook Form + Zod |
| Build | Expo EAS Build (iOS + Android) |
| Updates | Expo EAS Update (OTA) |
| Analytics | Expo + PostHog (optional) |

---

## Architecture Principle

**File-based routing with Expo Router.** The app is structured around 5 bottom tabs. Shared components live in `components/`. Feature-specific components live alongside their screens. All API calls go through `services/` — never called directly in components. Global auth state + user state live in Zustand stores.

---

## Directory Structure

```
onlypets-frontend/
├── app/                          # Expo Router pages (file = route)
│   ├── _layout.tsx               # Root layout (auth check, fonts)
│   ├── auth/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── feed/
│   │   │   ├── index.tsx         # Home feed
│   │   │   └── [postId].tsx      # Post detail
│   │   ├── shorts/
│   │   │   └── index.tsx         # Vertical shorts feed
│   │   ├── discovery/
│   │   │   ├── index.tsx         # Explore grid
│   │   │   └── search.tsx        # Search screen
│   │   ├── swipe/
│   │   │   └── index.tsx         # Nearby / Tinder-like
│   │   └── profile/
│   │       ├── index.tsx         # My profile
│   │       └── [userId].tsx      # Other user profile
│   └── (modals)/                 # Full-screen modals
│       ├── create-post.tsx
│       ├── create-story.tsx
│       ├── create-short.tsx
│       ├── camera.tsx
│       ├── messages/
│       │   ├── index.tsx         # Conversation list
│       │   └── [conversationId].tsx
│       ├── notifications.tsx
│       ├── pet-page/
│       │   ├── create.tsx
│       │   └── [petId].tsx
│       └── settings.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── SkeletonLoader.tsx
│   │   ├── feed/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostMedia.tsx
│   │   │   ├── LikeButton.tsx
│   │   │   ├── CommentSheet.tsx
│   │   │   └── StoryRing.tsx
│   │   ├── stories/
│   │   │   ├── StoryBar.tsx      # Horizontal story avatars
│   │   │   └── StoryViewer.tsx   # Full-screen story player
│   │   ├── shorts/
│   │   │   ├── ShortPlayer.tsx
│   │   │   └── ShortActions.tsx
│   │   ├── discovery/
│   │   │   ├── ExploreGrid.tsx
│   │   │   └── SwipeCard.tsx     # Tinder-style card
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileGrid.tsx
│   │   │   ├── BadgeDisplay.tsx
│   │   │   ├── PointsWidget.tsx
│   │   │   └── PetPageCard.tsx
│   │   ├── messages/
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── StreakBadge.tsx
│   │   └── common/
│   │       ├── AppHeader.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useFeed.ts
│   │   ├── useShorts.ts
│   │   ├── useSwipe.ts
│   │   ├── useMessages.ts
│   │   ├── useSocket.ts
│   │   ├── useLocation.ts
│   │   ├── useCamera.ts
│   │   └── useUpload.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts         # User session, JWT tokens
│   │   ├── feed.store.ts         # Cached feed items
│   │   ├── notification.store.ts
│   │   └── app.store.ts          # Theme, locale
│   ├── services/                 # API layer (all fetch calls here)
│   │   ├── api.client.ts         # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── pets.service.ts
│   │   ├── posts.service.ts
│   │   ├── stories.service.ts
│   │   ├── shorts.service.ts
│   │   ├── feed.service.ts
│   │   ├── messages.service.ts
│   │   ├── discovery.service.ts
│   │   ├── payments.service.ts
│   │   └── media.service.ts      # Upload to R2 via signed URLs
│   ├── lib/                      # Pure utilities
│   │   ├── format.ts             # Date, number formatters
│   │   ├── validators.ts         # Zod schemas
│   │   └── socket.ts             # Socket.io client singleton
│   ├── types/                    # Shared TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   ├── post.types.ts
│   │   ├── message.types.ts
│   │   └── navigation.types.ts
│   └── constants/
│       ├── colors.ts             # Design tokens
│       ├── config.ts             # API URL, feature flags
│       └── queryKeys.ts          # TanStack Query keys
├── assets/
│   ├── images/
│   └── fonts/
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── tailwind.config.js            # NativeWind config
├── babel.config.js
├── tsconfig.json
└── PLAN.md
```

---

## Screen Map

### Tab 1 — Feed (Home)
- Story bar (horizontal avatars at top)
- Infinite scroll post feed (images + videos)
- Like, comment, share, bookmark on each post
- Tap story → full-screen story viewer with progress bar

### Tab 2 — Shorts
- Full-screen vertical scroll (like TikTok / Instagram Reels)
- Swipe up/down between shorts
- Like, comment overlay
- Auto-play on focus, pause on blur

### Tab 3 — Discovery (Explore)
- Search bar at top (users, pets, hashtags)
- Grid of trending posts
- Filter by pet species, hashtag, badge

### Tab 4 — Swipe (Nearby Friends)
- Location permission prompt on first open
- Tinder-style card stack of nearby user profiles
- Swipe right = friend request, swipe left = pass
- Match screen when mutual like

### Tab 5 — Profile
- Profile header: avatar, name, bio, stats
- Pet pages section
- Badges display
- Points widget
- Posts grid

### Modals (full-screen, accessible from anywhere)
- **Camera/Create**: Choose image / video / short / story
- **Notifications**: Bell icon in header
- **DMs**: Paper-plane icon in header → conversation list → chat screen
- **Settings**: From profile
- **Subscription**: Upgrade / manage plan

---

## Navigation Structure

```
Root Layout
├── /auth/*           (unauthenticated stack)
│   ├── /auth/login
│   ├── /auth/register
│   └── /auth/forgot-password
└── /(tabs)/*         (authenticated tab navigator)
    ├── /feed
    │   └── /feed/:postId
    ├── /shorts
    ├── /discovery
    ├── /swipe
    └── /profile
        └── /profile/:userId
    (floating over tabs — accessible from tab bar '+' button)
    └── /(modals)/*
        ├── /messages
        │   └── /messages/:conversationId
        ├── /create-post
        ├── /create-story
        ├── /create-short
        ├── /camera
        ├── /notifications
        ├── /pet-page/:petId
        └── /settings
```

---

## State Management Strategy

| State Type | Tool | Why |
|---|---|---|
| Server state (posts, users, feed) | TanStack Query | Caching, background refetch, pagination |
| Auth session (token, user) | Zustand + SecureStore | Persistent, reactive |
| Real-time messages | Zustand + Socket.io | Live updates without refetch |
| UI state (modals, loading) | Local `useState` | No need to share |
| Forms | React Hook Form + Zod | Validation + performance |

---

## Upload Flow

```
User selects image/video
  → media.service.ts: POST /media/upload/image (or /video/init)
  → Backend returns signed R2 URL (image) or Cloudflare Stream URL (video)
  → Client uploads directly to Cloudflare (not via our server)
  → Client confirms upload: POST /media/upload/video/confirm
  → Client creates post with returned mediaUrl
```

This keeps our server load minimal — media bytes never touch our ECS instance.

---

## Swipe Feature (Nearby Friends)

```
1. Request location permission (expo-location)
2. PATCH /users/me/location — update lat/lng on backend
3. GET /discovery/nearby — returns paginated user cards
4. Render SwipeCard stack with react-native-deck-swiper
5. POST /discovery/swipe { targetId, action: 'like' | 'pass' }
6. If mutual like → backend returns { matched: true }
7. Show match animation → auto-open DM conversation
```

---

## Streak System (DM Streaks)

```
- Each conversation tracks lastMessageAt
- If both users send messages on consecutive days → streak++
- Streak badge shown next to friend name in DM list
- Streak is shown in chat header with flame icon
- If 24h pass without a message → streak breaks, push notification sent
- Bonus points awarded daily for maintained streaks
```

---

## Points + Badge Display

```
Profile screen shows:
  - Total points counter (animated)
  - Current badges (grid of badge icons, tap to see details)
  - Progress bar toward next badge tier
  - "How to earn more points" info sheet

Badge notification:
  - When badge earned → full-screen celebration animation (Lottie)
  - Push notification
  - Appears in notifications list
```

---

## Subscription & Paywall

```
Trial:
  - Banner in profile: "X days of free trial remaining"
  - No restrictions during trial

After trial expires (if unpaid):
  - API returns 402 on protected endpoints
  - App shows SubscriptionModal (Stripe Payment Sheet)
  - $1/month via Stripe

Influencer bypass:
  - If user has Influencer badge → subscriptionStatus: 'influencer'
  - Paywall never shown, subscription section shows "Free forever 🎉"
```

---

## Design System (NativeWind / Tailwind Tokens)

```
Colors:
  primary:    #FF6B35 (warm orange — pet energy)
  secondary:  #2EC4B6 (teal)
  background: #0A0A0A (dark) / #F9F9F9 (light)
  surface:    #1A1A1A (dark) / #FFFFFF (light)
  text:       #FFFFFF (dark) / #0A0A0A (light)
  muted:      #888888
  danger:     #FF4444
  success:    #44CC88

Typography:
  font-sans: 'Inter' (body)
  font-display: 'Poppins' (headings, username)

Spacing: 4px base unit (p-1 = 4px, etc.)
Border radius: rounded-2xl default, rounded-full for avatars
```

---

## Phase Plan

---

### Phase 1 — Foundation ✅ COMPLETE

**Goal:** Auth flow, profile, feed with image posts, story bar.

**Tasks:**
- [x] Expo project init (TypeScript, NativeWind, Expo Router)
- [x] Placeholder assets (icon, splash, adaptive-icon)
- [x] Auth screens: Login, Register, Forgot password
- [x] JWT token storage with `expo-secure-store`
- [x] Axios client with token injection + refresh interceptor (`api.client.ts`)
- [x] Zustand auth store + notification store
- [x] Tab navigator with 6 tabs (Feed, Shorts, +Create, Discovery, Swipe, Profile)
- [x] Feed screen: infinite scroll `FlashList` with `PostCard`, pull-to-refresh, skeleton loaders
- [x] PostCard component: media, caption, like (optimistic), comments link, hashtags, author tap
- [x] Profile screen: header with stats, Posts/Pets/Badges tabs, posts grid
- [x] StoriesRow + StoryBubble components (horizontal scroll)
- [x] StoryViewer modal (full-screen, progress bars, 5s auto-advance, tap zones)

---

### Phase 2 — Video, DMs, Shorts ✅ COMPLETE

**Goal:** Video posts, full DM experience, shorts feed, streaks UI.

**Tasks:**
- [x] Video shorts playback (expo-av Video, viewability-based autoplay)
- [x] Create post modal (image picker → R2 upload → POST /posts)
- [x] Create story modal (image/video picker → upload → POST /stories)
- [x] Shorts tab: vertical full-screen snap scroll, mute toggle, like (optimistic), view count
- [x] Messages list screen (`/messages/index.tsx`) with ConversationItem + streak badge
- [x] Chat screen (`/messages/[id].tsx`): real-time via Socket.io, MessageBubble, keyboard-avoiding input
- [x] StreakBadge component (flame + count)
- [x] useSocket + useJoinConversation hooks
- [x] Notification screen: paginated list, type-to-emoji mapping, mark read
- [x] Notifications icon in profile tab header
- [ ] Push notification registration (needs real device + Expo account to test)

---

### Phase 3 — Discovery & Swipe ✅ COMPLETE

**Goal:** Explore grid, search, nearby swipe feature.

**Tasks:**
- [x] Discovery screen: trending 3-col grid + species filter chips (All/Dogs/Cats/Birds/Fish/Rabbits)
- [x] Search: 400ms debounced, filters users/pets client-side from nearby results
- [x] Swipe tab: location permission on mount, custom PanResponder card deck
- [x] SwipeCard: two-card stack, LIKE/PASS color overlays, throw animation
- [x] Match modal (both avatars, "It's a Match! 🐾" overlay)
- [x] Nearby users from `GET /discovery/nearby`
- [x] Pet page modal (`/modals/pet-profile.tsx`): species badge, influencer crown, posts grid
- [x] Add pet modal (`/modals/add-pet.tsx`): emoji species picker, avatar, R2 upload
- [x] User profile modal (`/modals/user-profile.tsx`): follow/unfollow, message button, posts/pets/badges tabs

---

### Phase 4 — Gamification & Payments ✅ COMPLETE

**Goal:** Badges, points, subscription paywall, Stripe.

**Tasks:**
- [x] Points display in ProfileHeader (⭐ total + 🔥 streak)
- [x] Badge grid in Profile Badges tab (BadgeChip with tier colours + emoji)
- [x] BadgeChip component (tier-coloured pill with icon)
- [x] Subscription modal (`/modals/subscription.tsx`): trial countdown, benefits list, Stripe Payment Sheet
- [x] Trial countdown (days remaining calculated from trialStartedAt + 6 months)
- [x] Influencer "FREE forever 👑" state in subscription modal
- [x] Settings screen: subscription status display, subscribe/cancel CTA, logout
- [ ] Badge earned celebration animation (Lottie) — Phase 5 polish
- [ ] Progress toward next badge bar — Phase 5 polish

---

### Phase 5 — Polish & App Store (Weeks 27+)

**Goal:** App Store / Play Store submission, performance, UX polish.

**Tasks:**
- [ ] App icon + splash screen final assets
- [ ] Deep linking config
- [ ] Accessibility audit (a11y labels)
- [ ] Performance: FlashList for all lists, image caching
- [ ] Skeleton loaders for all loading states
- [ ] Error boundaries + empty states
- [ ] Dark mode support (NativeWind dark: variant)
- [ ] EAS Build: production iOS + Android builds
- [ ] TestFlight + Play Store internal track
- [ ] App Store review checklist
- [ ] Privacy policy + terms URL in app

---

## EAS Build & OTA Strategy

```
Development:  expo start (Expo Go / dev client)
Preview:      eas build --profile preview (shareable .apk / .ipa)
Production:   eas build --profile production → App Store + Play Store
OTA Updates:  eas update --branch production (JS-only changes, instant)
```

`eas.json` profiles:
- `development`: local dev client build
- `preview`: internal distribution (no store submission)
- `production`: store submission

---

## Environment Variables

```bash
# API
EXPO_PUBLIC_API_URL=https://api.onlypets.app

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Cloudflare
EXPO_PUBLIC_MEDIA_BASE_URL=https://media.onlypets.app

# Feature flags
EXPO_PUBLIC_SWIPE_ENABLED=true
EXPO_PUBLIC_SHORTS_ENABLED=true
```

---

## Coding Standards

- All screens are functional components with explicit TypeScript return types
- No API calls in components — all calls go through `services/`
- Hooks abstract all logic from screens — screens only compose hooks + components
- All lists use `FlashList` (not FlatList) for performance
- Images always use `expo-image` (not `<Image>` from RN)
- Form state managed by React Hook Form — no `useState` for form fields
- Navigation params typed via `navigation.types.ts`
- All colors/spacing reference design tokens, never hardcoded
- Components never know about the store — data passed as props
