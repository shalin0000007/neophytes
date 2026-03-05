/**
 * Root Layout
 * 
 * Shows animated GIF splash screen on launch, then
 * wraps the app with ThemeProvider and AuthProvider.
 * Enforces biometric lock when app comes to foreground (if enabled).
 * Redirects to auth screens or main tabs based on session state.
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from '@/src/theme/ThemeContext';
import { AuthProvider, useAuth } from '@/src/services/AuthContext';
import { requestNotificationPermissions } from '@/src/services/notificationService';

const { width, height } = Dimensions.get('window');
const SEC_KEY = '@microsave_security';

// ─── Splash Screen ──────────────────────────────────────────────────────────

function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4050); // Show for 4.05 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={splashStyles.container}>
      <Image
        source={require('../assets/splash.gif')}
        style={splashStyles.gif}
        resizeMode="cover"
      />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: width,
    height: height,
  },
});

// ─── Lock Screen ────────────────────────────────────────────────────────────

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock MicroSave',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      onUnlock();
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <View style={lockStyles.container}>
      <Ionicons name="lock-closed" size={64} color="#8A4FFF" />
      <Text style={lockStyles.title}>MicroSave Locked</Text>
      <Text style={lockStyles.subtitle}>Tap to unlock with biometrics</Text>
      <View style={lockStyles.btn}>
        <Ionicons name="finger-print" size={48} color="#fff" onPress={authenticate} />
      </View>
    </View>
  );
}

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0B1A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 16 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  btn: {
    marginTop: 32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(138,79,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ─── Navigation Guard ───────────────────────────────────────────────────────

function RootLayoutNav() {
  const { session, initialized } = useAuth();
  const { mode } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  // Check app lock on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App came to foreground — check if lock is enabled
        try {
          const val = await AsyncStorage.getItem(SEC_KEY);
          if (val) {
            const settings = JSON.parse(val);
            if (settings.appLock) {
              setLocked(true);
            }
          }
        } catch { }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
      requestNotificationPermissions();
    } else if (session && !inAuthGroup) {
      requestNotificationPermissions();
    }
  }, [session, initialized, segments]);

  if (!initialized) return null;

  if (locked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

// ─── Root Layout ────────────────────────────────────────────────────────────

import OnboardingScreen, { ONBOARDING_KEY } from '@/src/components/OnboardingScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  const handleSplashFinish = async () => {
    // Check if user has seen onboarding
    const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
    setShowSplash(false);
    if (!seen) {
      setShowOnboarding(true);
    }
    setCheckingOnboarding(false);
  };

  if (showSplash) {
    return <AnimatedSplash onFinish={handleSplashFinish} />;
  }

  if (checkingOnboarding) return null;

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
