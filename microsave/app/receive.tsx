/**
 * Receive Money Screen
 * 
 * - Persists user's real UPI ID via AsyncStorage
 * - Generates real scannable QR code with upi://pay format
 * - Copy, share, and set custom UPI ID
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Share,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import qrcode from 'qrcode-generator';
import Svg, { Rect } from 'react-native-svg';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const UPI_KEY = '@microsave_upi_id';

export default function ReceiveScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [upiId, setUpiId] = useState('');
    const [inputId, setInputId] = useState('');
    const [editing, setEditing] = useState(false);

    // Load saved UPI ID on mount
    useEffect(() => {
        AsyncStorage.getItem(UPI_KEY).then(val => {
            if (val) {
                setUpiId(val);
                setInputId(val);
            }
        });
    }, []);

    const displayUpiId = upiId || '';
    const userName = (user as any)?.user_metadata?.name || 'Student';

    // Build UPI payment URL that payment apps understand
    const upiPayUrl = displayUpiId
        ? `upi://pay?pa=${encodeURIComponent(displayUpiId)}&pn=${encodeURIComponent(userName)}&cu=INR`
        : '';

    const saveUpiId = async () => {
        const trimmed = inputId.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Please enter a valid UPI ID');
            return;
        }
        if (!trimmed.includes('@')) {
            Alert.alert('Invalid UPI ID', 'UPI ID should contain @ (e.g., name@ybl, name@paytm)');
            return;
        }
        await AsyncStorage.setItem(UPI_KEY, trimmed);
        setUpiId(trimmed);
        setEditing(false);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Saved ✅', `Your UPI ID "${trimmed}" has been saved.`);
    };

    const copyUpiId = async () => {
        if (!displayUpiId) {
            Alert.alert('No UPI ID', 'Please set your UPI ID first.');
            return;
        }
        await Clipboard.setStringAsync(displayUpiId);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Copied!', 'UPI ID copied to clipboard');
    };

    const shareUpiId = async () => {
        if (!displayUpiId) {
            Alert.alert('No UPI ID', 'Please set your UPI ID first.');
            return;
        }
        await Share.share({
            message: `Pay me via UPI: ${displayUpiId}`,
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Receive Money</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* QR Code Card */}
                <LinearGradient
                    colors={['#8A4FFF', '#6C63FF']}
                    style={styles.qrCard}
                >
                    <Text style={styles.qrLabel}>Scan to Pay Me</Text>

                    {displayUpiId ? (
                        <View style={styles.qrContainer}>
                            {(() => {
                                const qr = qrcode(0, 'M');
                                qr.addData(upiPayUrl);
                                qr.make();
                                const count = qr.getModuleCount();
                                const cellSize = 200 / count;
                                return (
                                    <Svg width={200} height={200}>
                                        <Rect x={0} y={0} width={200} height={200} fill="#FFFFFF" />
                                        {Array.from({ length: count }, (_, r) =>
                                            Array.from({ length: count }, (_, c) =>
                                                qr.isDark(r, c) ? (
                                                    <Rect
                                                        key={`${r}-${c}`}
                                                        x={c * cellSize}
                                                        y={r * cellSize}
                                                        width={cellSize + 0.5}
                                                        height={cellSize + 0.5}
                                                        fill="#1A1730"
                                                    />
                                                ) : null
                                            )
                                        )}
                                    </Svg>
                                );
                            })()}
                        </View>
                    ) : (
                        <View style={[styles.qrContainer, styles.qrPlaceholder]}>
                            <Ionicons name="qr-code-outline" size={80} color="rgba(0,0,0,0.2)" />
                            <Text style={styles.qrPlaceholderText}>Set your UPI ID below to generate QR</Text>
                        </View>
                    )}

                    <Text style={styles.qrName}>{userName}</Text>
                    {displayUpiId ? (
                        <Text style={styles.qrUpi}>{displayUpiId}</Text>
                    ) : null}
                </LinearGradient>

                {/* UPI ID Display Card */}
                {displayUpiId ? (
                    <View style={[styles.upiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.upiLabel, { color: colors.textSecondary }]}>Your UPI ID</Text>
                        <View style={styles.upiRow}>
                            <Text style={[styles.upiId, { color: colors.textPrimary }]}>{displayUpiId}</Text>
                            <TouchableOpacity onPress={copyUpiId} style={[styles.copyBtn, { backgroundColor: colors.primaryLight }]}>
                                <Ionicons name="copy-outline" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {/* Set / Edit UPI ID */}
                <View style={[styles.upiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.upiLabel, { color: colors.textSecondary }]}>
                        {displayUpiId ? 'Change UPI ID' : 'Set Your UPI ID'}
                    </Text>
                    <Text style={[styles.upiHint, { color: colors.textMuted }]}>
                        Enter your real UPI ID (e.g., name@ybl, name@paytm, number@ibl)
                    </Text>
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                        placeholder="yourname@ybl"
                        placeholderTextColor={colors.textMuted}
                        value={inputId}
                        onChangeText={setInputId}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity onPress={saveUpiId} activeOpacity={0.85} style={{ marginTop: Spacing.sm }}>
                        <LinearGradient
                            colors={['#8A4FFF', '#6C63FF']}
                            style={styles.saveBtn}
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>Save UPI ID</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={copyUpiId} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <Ionicons name="copy-outline" size={22} color={colors.primary} />
                        <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={shareUpiId} style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <Ionicons name="share-outline" size={22} color={colors.primary} />
                        <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Info */}
                <View style={[styles.infoBanner, { backgroundColor: 'rgba(138,79,255,0.08)', borderColor: 'rgba(138,79,255,0.2)' }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        This QR code follows the UPI standard format and can be scanned by any UPI payment app (PhonePe, Google Pay, Paytm, etc.)
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    // QR Card
    qrCard: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    qrLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.md },
    qrContainer: { borderRadius: BorderRadius.lg, padding: 16, marginBottom: Spacing.md, backgroundColor: '#FFFFFF' },
    qrPlaceholder: {
        width: 232,
        height: 232,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrPlaceholderText: { fontSize: FontSize.xs, color: 'rgba(0,0,0,0.4)', textAlign: 'center', marginTop: 8, paddingHorizontal: 16 },
    qrName: { fontSize: FontSize.lg, color: '#FFFFFF', fontWeight: FontWeight.bold },
    qrUpi: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

    // UPI Card
    upiCard: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    upiLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.xs },
    upiHint: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
    upiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    upiId: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, flex: 1 },
    copyBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    // Input
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: FontSize.md,
    },

    // Save Button
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        paddingVertical: 12,
        gap: 8,
    },
    saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFFFFF' },

    // Action Row
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    actionBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    // Info
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
    },
    infoText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18 },
});
