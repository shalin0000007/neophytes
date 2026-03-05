/**
 * Login Screen
 * 
 * Email + password authentication with Supabase.
 * Premium fintech styling with glassmorphism.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signIn } from '@/src/services/supabase';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function LoginScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email.trim(), password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        }
        // Auth listener in _layout.tsx will handle redirect
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.logoText, { color: colors.primary }]}>₹</Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>MicroSave</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Save smart. Grow daily.
                    </Text>
                </View>

                {/* Form */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Welcome back</Text>

                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Email address"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Signup link */}
                <TouchableOpacity
                    style={styles.linkContainer}
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                        Don't have an account?{' '}
                        <Text style={{ color: colors.primary, fontWeight: FontWeight.semibold }}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoText: {
        fontSize: 64,
        fontWeight: FontWeight.heavy,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.hero,
        fontWeight: FontWeight.bold,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: FontSize.md,
        marginTop: Spacing.xs,
    },
    card: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 1,
        padding: Spacing.lg,
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.lg,
    },
    inputContainer: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: FontSize.md,
    },
    button: {
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.sm,
        height: 52,
    },
    buttonText: {
        color: '#000',
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    linkContainer: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    linkText: {
        fontSize: FontSize.md,
    },
});
