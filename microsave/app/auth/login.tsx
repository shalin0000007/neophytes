/**
 * Login Screen
 * 
 * Matches UI reference: purple theme, piggy bank icon,
 * glass card with email/password fields, biometrics option.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/src/theme/ThemeContext';
import { signIn } from '@/src/services/supabase';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function LoginScreen() {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) Alert.alert('Login Failed', error.message);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
                            <Text style={styles.logoEmoji}>🐷</Text>
                        </View>
                        <Text style={[styles.appName, { color: colors.textPrimary }]}>MicroSave</Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.formCard, {
                        backgroundColor: colors.surface,
                        borderColor: colors.cardBorder,
                    }]}>
                        <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
                            Log in to manage your micro-savings.
                        </Text>

                        {/* Email */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Student Email</Text>
                        <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="name@university.edu"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
                        <View style={[styles.inputRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.textPrimary }]}
                                placeholder="••••••••"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotRow}>
                            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.loginButtonText}>
                                {loading ? 'Logging in...' : 'Log In'}
                            </Text>
                        </TouchableOpacity>

                        {/* Biometrics Button */}
                        <TouchableOpacity
                            style={[styles.biometricsButton, { borderColor: colors.primary }]}
                        >
                            <Ionicons name="finger-print" size={22} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                            <Text style={[styles.biometricsText, { color: colors.primary }]}>
                                Sign in with Biometrics
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signupRow}>
                        <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },

    // Logo
    logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoEmoji: { fontSize: 36 },
    appName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, letterSpacing: 1 },

    // Form
    formCard: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 1,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    welcomeTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
    welcomeSub: { fontSize: FontSize.md, marginBottom: Spacing.lg },

    label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        height: 52,
        marginBottom: Spacing.md,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: FontSize.md },

    forgotRow: { alignSelf: 'flex-end', marginBottom: Spacing.lg },
    forgotText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

    loginButton: {
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    loginButtonText: { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

    biometricsButton: {
        height: 56,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    biometricsText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    // Bottom
    signupRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.lg },
    signupText: { fontSize: FontSize.md },
    signupLink: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
