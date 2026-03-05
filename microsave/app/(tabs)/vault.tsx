/**
 * Pay / Vault Screen
 * 
 * UI Reference: Large amount display centered,
 * "To: Merchant" subtitle, Micro-Save Active card with
 * round-up info, and purple "Pay Now" button at bottom.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { calculateSavings, processTransaction } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/src/theme';

export default function PayScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const numAmount = parseFloat(amount) || 0;
    const savedAmount = calculateSavings(numAmount);

    const handlePay = async () => {
        if (!user || numAmount <= 0) {
            Alert.alert('Error', 'Enter a valid amount');
            return;
        }
        setLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const { error } = await processTransaction(
                user.id,
                numAmount,
                description || 'Payment'
            );
            if (error) {
                Alert.alert('Error', error.message || 'Payment failed');
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setAmount('');
                    setDescription('');
                }, 2500);
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong');
        }
        setLoading(false);
    };

    if (success) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.successContainer}>
                    <Text style={styles.successEmoji}>🎉</Text>
                    <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Payment Complete!</Text>
                    <Text style={[styles.successSub, { color: colors.primary }]}>
                        Saved ₹{savedAmount.toFixed(2)} from this transaction
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 24 }} />
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Pay</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Amount Display */}
                    <View style={styles.amountSection}>
                        <View style={styles.amountRow}>
                            <Text style={[styles.currency, { color: colors.textPrimary }]}>₹</Text>
                            <TextInput
                                style={[styles.amountInput, { color: colors.textPrimary }]}
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                                maxLength={10}
                            />
                        </View>
                        {/* Description Input */}
                        <TextInput
                            style={[styles.descriptionInput, { color: colors.textSecondary }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="To: Merchant Name"
                            placeholderTextColor={colors.textMuted}
                            textAlign="center"
                        />
                    </View>

                    {/* Micro-Save Active Card */}
                    {numAmount > 0 && (
                        <LinearGradient
                            colors={['#8A4FFF', '#6C63FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.microSaveCard}
                        >
                            <View style={styles.microSaveHeader}>
                                <View style={styles.microSaveLeft}>
                                    <Text style={styles.piggyIcon}>🐷</Text>
                                    <Text style={styles.microSaveTitle}>Micro-Save Active</Text>
                                </View>
                                <Ionicons name="flash" size={24} color="rgba(255,255,255,0.4)" />
                            </View>
                            <Text style={styles.microSaveDesc}>
                                Rounding up and automatically saving{'\n'}
                                <Text style={styles.microSaveAmount}>₹{savedAmount.toFixed(2)}</Text>
                                {' '}for this transaction.
                            </Text>
                        </LinearGradient>
                    )}
                </ScrollView>

                {/* Pay Now Button */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={[styles.payButton, { opacity: numAmount <= 0 || loading ? 0.5 : 1 }]}
                        onPress={handlePay}
                        disabled={numAmount <= 0 || loading}
                    >
                        <LinearGradient
                            colors={['#6C63FF', '#5A52D5']}
                            style={styles.payButtonGradient}
                        >
                            <Ionicons name="card-outline" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                            <Text style={styles.payButtonText}>
                                {loading ? 'Processing...' : 'Pay Now'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, padding: Spacing.lg },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },

    // Amount
    amountSection: { alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl },
    amountRow: { flexDirection: 'row', alignItems: 'center' },
    currency: { fontSize: FontSize.mega, fontWeight: FontWeight.heavy },
    amountInput: {
        fontSize: FontSize.mega,
        fontWeight: FontWeight.heavy,
        minWidth: 100,
        textAlign: 'center',
    },
    descriptionInput: {
        fontSize: FontSize.md,
        marginTop: Spacing.sm,
        minWidth: 200,
    },

    // Micro-Save Card
    microSaveCard: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        marginHorizontal: Spacing.sm,
        ...Shadows.lg,
    },
    microSaveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    microSaveLeft: { flexDirection: 'row', alignItems: 'center' },
    piggyIcon: { fontSize: 22, marginRight: Spacing.sm },
    microSaveTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#FFFFFF' },
    microSaveDesc: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
    microSaveAmount: {
        color: '#FFFFFF',
        fontWeight: FontWeight.bold,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        borderRadius: 4,
        overflow: 'hidden',
    },

    // Bottom
    bottomSection: { padding: Spacing.lg, paddingBottom: Spacing.xl },
    payButton: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    payButtonGradient: {
        flexDirection: 'row',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
    },
    payButtonText: { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold },

    // Success
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
    successEmoji: { fontSize: 72, marginBottom: Spacing.lg },
    successTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
    successSub: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
});
