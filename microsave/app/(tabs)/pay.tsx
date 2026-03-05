/**
 * Pay Screen
 * 
 * Simulates a UPI-style payment:
 * 1. User enters amount + description
 * 2. Calculates micro-saving (round-off)
 * 3. Shows success animation with haptic feedback
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { calculateSavings, processTransaction } from '@/src/services/savingsEngine';
import { GlassCard } from '@/src/components/GlassCard';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function PayScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [savedAmount, setSavedAmount] = useState(0);

    // Animation values
    const successScale = useSharedValue(0);
    const successOpacity = useSharedValue(0);

    const successAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: successScale.value }],
        opacity: successOpacity.value,
    }));

    const handlePay = async () => {
        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        if (!user) {
            Alert.alert('Error', 'Not logged in');
            return;
        }

        setLoading(true);

        const result = await processTransaction(user.id, amountNum, description || 'Payment');

        setLoading(false);

        if (result.error) {
            Alert.alert('Error', result.error);
            return;
        }

        // Success!
        setSavedAmount(result.savedAmount);
        setShowSuccess(true);

        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Animate success
        successOpacity.value = withTiming(1, { duration: 200 });
        successScale.value = withSequence(
            withTiming(1.1, { duration: 300, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 200 })
        );

        // Reset after 3 seconds
        setTimeout(() => {
            successOpacity.value = withTiming(0, { duration: 300 });
            successScale.value = withTiming(0, { duration: 300 });
            setTimeout(() => {
                setShowSuccess(false);
                setAmount('');
                setDescription('');
            }, 300);
        }, 3000);
    };

    const previewSavings = amount ? calculateSavings(parseFloat(amount) || 0) : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Make Payment</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Every payment saves you money automatically
                    </Text>

                    {showSuccess ? (
                        /* Success State */
                        <Animated.View style={[styles.successContainer, successAnimStyle]}>
                            <GlassCard variant="accent" style={styles.successCard}>
                                <Text style={styles.successEmoji}>🎉</Text>
                                <Text style={[styles.successTitle, { color: colors.primary }]}>Payment Successful!</Text>
                                <Text style={[styles.successAmount, { color: colors.textPrimary }]}>
                                    ₹{parseFloat(amount).toLocaleString('en-IN')} paid
                                </Text>
                                <View style={[styles.savedBadge, { backgroundColor: colors.primaryLight }]}>
                                    <Text style={[styles.savedBadgeText, { color: colors.primary }]}>
                                        ₹{savedAmount} saved automatically ✨
                                    </Text>
                                </View>
                            </GlassCard>
                        </Animated.View>
                    ) : (
                        /* Payment Form */
                        <>
                            <GlassCard style={styles.formCard}>
                                {/* Amount Input */}
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount</Text>
                                <View style={styles.amountRow}>
                                    <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>₹</Text>
                                    <TextInput
                                        style={[styles.amountInput, { color: colors.textPrimary }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textMuted}
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="numeric"
                                        maxLength={7}
                                    />
                                </View>

                                {/* Preview savings */}
                                {previewSavings > 0 && (
                                    <View style={[styles.previewRow, { borderTopColor: colors.cardBorder }]}>
                                        <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                                            You'll save
                                        </Text>
                                        <Text style={[styles.previewAmount, { color: colors.primary }]}>
                                            ₹{previewSavings}
                                        </Text>
                                    </View>
                                )}
                            </GlassCard>

                            {/* Description */}
                            <View style={[styles.descInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <TextInput
                                    style={[styles.descText, { color: colors.textPrimary }]}
                                    placeholder="What's this payment for? (optional)"
                                    placeholderTextColor={colors.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            {/* Quick amounts */}
                            <View style={styles.quickRow}>
                                {[50, 100, 200, 500].map((q) => (
                                    <TouchableOpacity
                                        key={q}
                                        style={[styles.quickChip, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                                        onPress={() => setAmount(String(q))}
                                    >
                                        <Text style={[styles.quickText, { color: colors.textPrimary }]}>₹{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Pay Button */}
                            <TouchableOpacity
                                style={[styles.payButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                                onPress={handlePay}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.payButtonText}>Pay ₹{amount || '0'}</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    content: { flex: 1, padding: Spacing.lg },
    title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.md, marginBottom: Spacing.xl },
    formCard: { marginBottom: Spacing.lg },
    inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.sm },
    amountRow: { flexDirection: 'row', alignItems: 'center' },
    currencySymbol: { fontSize: FontSize.hero, fontWeight: FontWeight.bold, marginRight: Spacing.xs },
    amountInput: { fontSize: FontSize.mega, fontWeight: FontWeight.heavy, flex: 1, padding: 0 },
    previewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
    },
    previewLabel: { fontSize: FontSize.md },
    previewAmount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    descInput: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    descText: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md },
    quickRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    quickChip: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    quickText: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
    payButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    payButtonText: { color: '#000', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    successCard: { alignItems: 'center', width: '100%' },
    successEmoji: { fontSize: 64, marginBottom: Spacing.md },
    successTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
    successAmount: { fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, marginBottom: Spacing.lg },
    savedBadge: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    savedBadgeText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
