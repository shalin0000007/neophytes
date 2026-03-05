/**
 * Signup Screen
 * 
 * Creates a new user with name, email, and password.
 * Name is passed as user metadata for profile trigger.
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
import { signUp } from '@/src/services/supabase';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function SignupScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const { error } = await signUp(email.trim(), password, name.trim());
        setLoading(false);

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success', 'Account created! You can now sign in.', [
                { text: 'OK', onPress: () => router.replace('/auth/login') },
            ]);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
                        <Text style={styles.logoEmoji}>🐷</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>MicroSave</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Start your micro-saving journey
                    </Text>
                </View>

                {/* Form */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Sign Up</Text>

                    <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: colors.textPrimary }]}
                            placeholder="Full name"
                            placeholderTextColor={colors.textMuted}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

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
                            placeholder="Password (min 6 characters)"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleSignup}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Login link */}
                <TouchableOpacity
                    style={styles.linkContainer}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                        Already have an account?{' '}
                        <Text style={{ color: colors.primary, fontWeight: FontWeight.semibold }}>Sign In</Text>
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
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoEmoji: { fontSize: 36 },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        letterSpacing: 1,
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
        color: '#FFFFFF',
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
