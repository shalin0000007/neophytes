<div align="center">
  <img src="assets/splash.gif" width="120" />
  <h1>MicroSave 🦊</h1>
  <p><b>Transform everyday spending into automated micro-investments using AI and SMS parsing.</b></p>
</div>

---

## 💡 The Problem

Millions of students and young professionals struggle with saving money. It requires discipline, constant budget tracking, and manual transfers. When you're buying a ₹18 chai or a ₹140 Zomato order, saving feels impossible.

## 🚀 The Solution: MicroSave

MicroSave makes saving invisible. Every time you make a UPI payment, the app natively reads the bank SMS, rounds up your purchase to the nearest ₹10, and quietly funnels that spare change into a digital vault. 

Once your vault hits ₹100, the money is automatically invested to generate returns. You don't have to lift a finger.

## ✨ Key Features

*   **🤖 Native SMS Parsing Engine**: Automatically detects bank debits on Android locally—no manual input required and no privacy concerns pulling banking APIs.
*   **💸 Automated Round-Ups**: Bought coffee for ₹63? We round it to ₹70 and save ₹7 for you.
*   **📈 Auto-Investments**: Once your spare change hits the ₹100 threshold, it’s automatically moved to an investment pool.
*   **📊 AI-Powered Insights**: Beautiful charts breaking down your savings vs. expenses and predictive AI suggestions on how to maximize your savings.
*   **🔔 Intelligent Push Notifications**: Get notified only on savings milestones and auto-investments.
*   **🦊 Gamified Profiles**: Pick from 10 distinct animated avatars, level up as you save, and secure your app with biometrics.

## 🛠️ Tech Stack

*   **Frontend**: React Native, Expo Router, Reanimated
*   **Backend & DB**: Supabase (PostgreSQL), Row Level Security (RLS)
*   **Native Modules**: Kotlin (Android `BroadcastReceiver` for real-time background SMS reading)
*   **Storage**: `@react-native-async-storage` for offline preferences

## 📱 Screenshots

| Dashboard | Profile & Avatars | SMS Engine Log | AI Insights |
|:---:|:---:|:---:|:---:|
| *(Add screenshot here)* | *(Add screenshot here)* | *(Add screenshot here)* | *(Add screenshot here)* |

## 🚀 Getting Started

Since this app uses custom native Android code for SMS detection (`SmsReaderModule`), it **cannot** be run in Expo Go. It must be built natively.

### Prerequisites
*   Node.js (v18+)
*   Android Studio / Android SDK
*   Supabase Account (for backend)

### 1. Clone & Install
```bash
git clone https://github.com/shalin0000007/neophytes.git
cd neophytes/microsave
npm install
```

### 2. Environment Variables
Create a `.env` file in the root `microsave` directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the SQL script located in `execution/setup_supabase.sql` in your Supabase SQL Editor. This sets up the `profiles`, `transactions`, and `investments` tables with proper RLS policies.

### 4. Run Locally on Android Device
Connect your Android phone via USB (with USB Debugging enabled).
```bash
# This will compile the Kotlin code and install the APK
npx expo run:android
```

## 🧪 Testing the SMS Engine (Phase 5)

If you don't want to wait for a real bank SMS, you can use the built-in simulator on the Dashboard:
1. Tap any of the **Phase 5 Testing Engine** buttons (e.g., Zomato, Amazon, Chai tapri).
2. The app will inject a simulated debit SMS into the native parser.
3. Watch your savings ring animate and fill up!

## 🔐 Privacy by Design
MicroSave never sends your raw SMS data to the cloud. SMS parsing happens **100% locally** on the Android device using standard Regex. Only the extracted amounts (spent/saved) are synced to your secure Supabase profile.

---
*Built with ❤️ for the Hackathon*
