/**
 * Root Layout
 * 
 * Shows animated GIF splash screen on launch, then
 * wraps the app with ThemeProvider and AuthProvider.
 * Redirects to auth screens or main tabs based on session state.
 */

import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/src/theme/ThemeContext';
import { AuthProvider, useAuth } from '@/src/services/AuthContext';

const { width, height } = Dimensions.get('window');

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

// ─── Navigation Guard ───────────────────────────────────────────────────────

function RootLayoutNav() {
  const { session, initialized } = useAuth();
  const { mode } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments]);

  if (!initialized) return null;

  return (
    <>
      <Slot />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

// ─── Root Layout ────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
