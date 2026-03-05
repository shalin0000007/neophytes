# 🐷 MicroSave — Auto Round-Up Savings App

> *Every rupee counts. MicroSave automatically detects your UPI payments via SMS and rounds up the change into your savings — so you save without even thinking about it.*

Built for **HackArena 2026** by Team Neophytes.

---

## 📱 What It Does

1. **Auto-Detects UPI Payments** — Reads bank SMS messages in real-time using a native Kotlin module
2. **Round-Up Savings** — If you spend ₹47, MicroSave saves ₹3 (rounds up to ₹50)
3. **Auto-Investment** — When savings hit ₹100, it auto-invests for you
4. **Savings Goals / Pots** — Create named goals like "PS5 Fund" or "Trip to Goa" with deadlines, progress tracking, and confetti celebrations
5. **AI Insights** — Categorizes your spending (Food, Shopping, Transport) and gives smart suggestions
6. **Quick Pay** — Launch PhonePe, Google Pay, or Paytm directly from the app

---

## 🛠 Technology Stack

### Frontend (Mobile App)

| Technology | Purpose |
|---|---|
| **React Native** | Cross-platform mobile framework |
| **Expo SDK 52** | Build tooling, dev server, native modules |
| **Expo Router** | File-based navigation (tabs, stacks, modals) |
| **TypeScript** | Type-safe JavaScript |
| **React Native SVG** | Donut charts on Insights screen |
| **Expo Linear Gradient** | Gradient buttons, cards, banners |
| **Expo Haptics** | Vibration feedback on payments & saves |
| **Expo Notifications** | Push notifications for transaction alerts |
| **Expo Local Authentication** | Biometric auth (fingerprint/face) |
| **AsyncStorage** | Local persistence (goals, settings, avatar) |

### Native Modules (Android)

| Technology | Purpose |
|---|---|
| **Kotlin** | Native SMS Reader module (`SmsReaderModule.kt`) |
| **Android SMS API** | Reading SMS inbox for UPI transaction detection |
| **Android Deep Links** | Opening PhonePe, GPay, Paytm via `phonepe://`, `tez://` |
| **AndroidManifest queries** | Android 11+ package visibility for UPI apps |

### Backend & Database

| Technology | Purpose |
|---|---|
| **Supabase** | Backend-as-a-Service (auth, database, API) |
| **Supabase Auth** | Email/password signup & login |
| **PostgreSQL** (via Supabase) | `profiles`, `transactions`, `investments` tables |
| **Row-Level Security (RLS)** | Per-user data isolation |
| **Supabase RPC** | Server-side functions for safe total updates |

### Core Logic (Custom Modules)

| Module | Purpose |
|---|---|
| `smsParser.ts` | Regex-based UPI debit/credit detection from bank SMS |
| `savingsEngine.ts` | Round-up calculation, auto-invest at ₹100 threshold |
| `smsReader.ts` | Background SMS polling every 30 seconds |
| `avatarService.ts` | 10 animated character avatars for profiles |
| `notificationService.ts` | Push notification triggers |

### Dev & Build Tools

| Technology | Purpose |
|---|---|
| **Node.js / npm** | Package management |
| **Metro Bundler** | JavaScript bundler for React Native |
| **Gradle** | Android native build system |
| **Git / GitHub** | Version control |
| **Android SDK / ADB** | Device deployment & debugging |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Android Studio with SDK
- An Android device with USB debugging enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/shalin0000007/neophytes.git
cd neophytes/microsave

# Install dependencies
npm install

# Create .env file with your Supabase credentials
echo "EXPO_PUBLIC_SUPABASE_URL=your_url" > .env
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key" >> .env

# Build and run on Android device
npx expo run:android
```

---

## 📂 Project Structure

```
microsave/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard (savings card, quick actions, SMS scan)
│   │   ├── insights.tsx       # Spending analysis with donut chart & AI suggestions
│   │   ├── pay.tsx            # Quick Pay (PhonePe, GPay, Paytm launcher)
│   │   ├── vault.tsx          # Savings Goals / Pots with progress tracking
│   │   └── profile.tsx        # Profile with avatar, settings navigation
│   ├── auth/
│   │   ├── login.tsx          # Login screen
│   │   └── signup.tsx         # Signup screen
│   ├── notifications.tsx      # Notification preferences
│   ├── personal-info.tsx      # Avatar picker & display name
│   ├── security-settings.tsx  # Security toggles
│   ├── transactions.tsx       # Full transaction history
│   ├── receive.tsx            # QR code for receiving money
│   ├── stats.tsx              # 4 chart types for spending stats
│   └── _layout.tsx            # Root layout with splash screen
├── src/
│   ├── services/
│   │   ├── savingsEngine.ts   # Core savings logic
│   │   ├── smsParser.ts       # SMS parsing with regex
│   │   ├── smsReader.ts       # Native SMS bridge + polling
│   │   ├── AuthContext.tsx     # Auth state management
│   │   ├── avatarService.ts   # Avatar system
│   │   └── notificationService.ts
│   ├── theme/
│   │   ├── ThemeContext.tsx    # Dark/Light theme provider
│   │   └── index.ts           # Design tokens
│   └── components/
│       ├── AnimatedCounter.tsx # Animated number counter
│       ├── GlassCard.tsx      # Glassmorphism card
│       └── TransactionItem.tsx
├── android/                   # Native Android project (Kotlin SMS module)
└── assets/                    # Splash GIF, icons
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔍 SMS Auto-Detection | Native Kotlin module reads bank SMS in real-time |
| 💰 Round-Up Savings | Automatically saves spare change from every UPI payment |
| 📊 AI Insights | Categorizes spending and gives personalized suggestions |
| 🎯 Goals / Pots | Named savings goals with deadlines, progress bars, confetti |
| 👤 Avatar System | 10 animated character avatars |
| 🌗 Dark/Light Theme | Toggle between dark and light mode |
| 🔔 Push Notifications | Alerts for transactions, savings milestones |
| 📈 Stats Dashboard | 4 chart types for spending analysis |
| 🔐 Security Settings | App lock, biometric, 2FA toggles |

---

## 👥 Team Neophytes

Built with ❤️ at HackArena 2026.

---

## 📄 License

MIT License
