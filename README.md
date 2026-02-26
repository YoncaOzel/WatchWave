# WatchWave

A cross-platform movie and TV show tracking application built with React Native and Expo. WatchWave lets users discover trending content, manage personal watchlists, rate what they've seen, and pick up TV series right where they left off — all backed by Firebase authentication and Firestore cloud sync.

## Features

- **Discover** — Browse popular, now playing, and top-rated movies & TV shows powered by the TMDB API.
- **Search & Filter** — Debounced full-text search with genre, media type, and minimum rating filters. Toggle between grid and list views.
- **Library Management** — Organize titles into three personal lists: *Watchlist*, *Watched*, and *Favorites*. Swipe-to-remove support.
- **Detail View** — Rich detail pages with backdrop imagery, genre tags, cast carousel, trailer links, and season/episode browser for TV shows.
- **Personal Ratings & Notes** — Rate content on a 5-star scale and attach notes (up to 500 characters) to any watched title.
- **Episode Progress Tracking** — Mark the last episode you watched per series and jump to the next one with a single tap. A "Continue Watching" row on the home screen surfaces your in-progress shows.
- **Dark / Light Theme** — System-aware theming with a manual toggle. Preference persists across sessions via Zustand.
- **Cloud Sync** — Firebase Auth (email/password) with Firestore persistence. Lists and watch progress sync across devices.
- **Offline Resilience** — A network banner warns when connectivity drops. Local Zustand state keeps the app usable offline; Firestore syncs when the connection returns.
- **Skeleton Loading** — Content placeholders provide visual feedback while data is being fetched.
- **Error Boundary** — A top-level error boundary catches unhandled exceptions and displays a recovery screen.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.76 (New Architecture) via Expo SDK 52 |
| Navigation | React Navigation 6 (native stack + bottom tabs) |
| State | Zustand 5 |
| Networking | Axios |
| Backend | Firebase 12 (Auth, Firestore) |
| Image Handling | expo-image |
| Animations | react-native-reanimated 3, react-native-gesture-handler |
| Testing | Jest 29 |
| Language | TypeScript 5 |

## Project Structure

```
├── App.tsx                     # Entry point, error boundary, theme provider
├── src/
│   ├── api/                    # TMDB API modules (movies, TV, search, seasons, detail)
│   ├── components/             # Reusable UI (MovieCard, SearchBar, CastScroll, etc.)
│   ├── config/                 # Firebase initialization (native + web)
│   ├── hooks/                  # Custom hooks (useMovies)
│   ├── mocks/                  # Static mock data for offline development
│   ├── navigation/             # AppNavigator, AuthStack, MainTabs, route types
│   ├── screens/                # Home, Search, Library, Detail, Profile, Login, Register
│   ├── services/               # AuthService, FirestoreService, MovieService, ProgressService
│   ├── store/                  # Zustand stores (auth, library, progress, theme)
│   ├── theme/                  # Colors, typography, spacing tokens
│   ├── types/                  # Shared TypeScript interfaces
│   └── utils/                  # Formatters, image helpers, error handler, API cache
├── __tests__/                  # Unit tests
├── firestore.rules             # Firestore security rules
└── eas.json                    # EAS Build profiles
```

## Prerequisites

- **Node.js** >= 18
- **npm** (ships with Node) or **yarn**
- **Expo CLI** — installed globally or via `npx`
- **TMDB API key** — obtain a free Bearer token at [developer.themoviedb.org](https://developer.themoviedb.org/)
- **Firebase project** — create one at [console.firebase.google.com](https://console.firebase.google.com/) with Email/Password auth enabled and a Firestore database provisioned

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YoncaOzel/WatchWave.git
cd WatchWave
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values:

```
EXPO_PUBLIC_TMDB_API_KEY=<your_tmdb_bearer_token>
EXPO_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
EXPO_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500

EXPO_PUBLIC_FIREBASE_API_KEY=<your_firebase_api_key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_project>.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<app_id>
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=<measurement_id>
```

### 4. (Android only) Add Firebase config

Place your `google-services.json` file in the project root. The Expo build process picks it up automatically via the path configured in `app.json`.

### 5. Deploy Firestore security rules

```bash
firebase deploy --only firestore:rules
```

### 6. Start the development server

```bash
npx expo start
```

From here you can:

- Press **`a`** to open on a connected Android device/emulator
- Press **`i`** to open on an iOS simulator (macOS only)
- Press **`w`** to open in a web browser
- Scan the QR code with **Expo Go** on a physical device

## Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Launch on Android |
| `npm run ios` | Launch on iOS |
| `npm run web` | Launch in the browser |
| `npm test` | Run the Jest test suite |
| `npm run lint` | Run ESLint |
| `npm run build:android` | Create an Android preview build via EAS |
| `npm run build:ios` | Create an iOS preview build via EAS |
| `npm run build:all` | Create production builds for both platforms |

## Running Tests

```bash
npm test
```

Tests live in `__tests__/` and cover utility modules (formatters, error handler, image helper, API cache).

## Building for Production

WatchWave uses [EAS Build](https://docs.expo.dev/build/introduction/) for native binaries:

```bash
# Preview APK (internal distribution)
eas build --platform android --profile preview

# Production AAB
eas build --platform android --profile production

# Both platforms
eas build --platform all --profile production
```

## License

This project is provided for educational and portfolio purposes.
