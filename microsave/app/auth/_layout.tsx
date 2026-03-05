/**
 * Auth Layout
 * 
 * Stack navigator for Login ↔ Signup screens.
 * No headers — custom UI handles everything.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
