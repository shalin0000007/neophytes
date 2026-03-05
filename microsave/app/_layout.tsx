/**
 * Root Layout
 * 
 * Wraps the entire app with ThemeProvider and AuthProvider.
 * Redirects to auth screens or main tabs based on session state.
 */

import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/src/theme/ThemeContext';
import { AuthProvider, useAuth } from '@/src/services/AuthContext';

function RootLayoutNav() {
  const { session, initialized } = useAuth();
  const { mode } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Not logged in → go to login
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      // Logged in but on auth screen → go to home
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
