/**
 * Receive Money Screen
 * 
 * Shows user's UPI ID and a QR code for receiving payments.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Share,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function ReceiveScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [upiId, setUpiId] = useState('');

    // Generate a placeholder UPI ID from user email
    const displayUpiId = upiId || (user?.email?.split('@')[0] + '@microsave') || 'user@microsave';

    const copyUpiId = async () => {
        await Clipboard.setStringAsync(displayUpiId);
        Alert.alert('Copied!', 'UPI ID copied to clipboard');
    };

    const shareUpiId = async () => {
        await Share.share({
            message: `Pay me via UPI: ${displayUpiId}`,
        });
    };

    // Simple QR-like visual (since we can't generate real QR without a library)
    const renderQRPlaceholder = () => {
        const size = 200;
        const cells = 11;
        const cellSize = size / cells;

        // Generate a pseudo-random QR pattern based on UPI ID
        const pattern: boolean[][] = [];
        const seed = displayUpiId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        for (let row = 0; row < cells; row++) {
            pattern[row] = [];
            for (let col = 0; col < cells; col++) {
                // Corner squares (QR finder patterns)
                const isCorner = (
                    (row < 3 && col < 3) || (row < 3 && col >= cells - 3) ||
                    (row >= cells - 3 && col < 3)
                );
                const isBorder = (
                    (row === 0 || row === 2 || row === cells - 1 || row === cells - 3) &&
                    (col < 3 || col >= cells - 3)
                ) || (
                        (col === 0 || col === 2 || col === cells - 1 || col === cells - 3) &&
                        (row < 3 || row >= cells - 3)
                    );
                const isCenter = (row === 1 && (col === 1 || col === cells - 2)) ||
                    (row === cells - 2 && col === 1);

                if (isCorner || isBorder || isCenter) {
                    pattern[row][col] = true;
                } else {
                    pattern[row][col] = ((seed * (row + 1) * (col + 1)) % 7) < 3;
                }
            }
        }

        return (
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}>
                {pattern.map((row, rowIdx) => (
                    <View key={rowIdx} style={{ flexDirection: 'row' }}>
                        {row.map((filled, colIdx) => (
                            <View
                                key={colIdx}
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    backgroundColor: filled ? '#1A1730' : '#FFFFFF',
                                }}
                            />
                        ))}
                    </View>
                ))}
            </View>
        );
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

            {/* QR Code Card */}
            <LinearGradient
                colors={['#8A4FFF', '#6C63FF']}
                style={styles.qrCard}
            >
                <Text style={styles.qrLabel}>Scan to Pay Me</Text>
                {renderQRPlaceholder()}
                <Text style={styles.qrName}>
                    {(user as any)?.user_metadata?.name || 'Student'}
                </Text>
            </LinearGradient>

            {/* UPI ID Card */}
            <View style={[styles.upiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.upiLabel, { color: colors.textSecondary }]}>Your UPI ID</Text>
                <View style={styles.upiRow}>
                    <Text style={[styles.upiId, { color: colors.textPrimary }]}>{displayUpiId}</Text>
                    <TouchableOpacity onPress={copyUpiId} style={[styles.copyBtn, { backgroundColor: colors.primaryLight }]}>
                        <Ionicons name="copy-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom UPI ID */}
            <View style={[styles.upiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.upiLabel, { color: colors.textSecondary }]}>Set Custom UPI ID</Text>
                <TextInput
                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                    placeholder="e.g. yourname@upi"
                    placeholderTextColor={colors.textMuted}
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                />
            </View>

            {/* Share Button */}
            <TouchableOpacity onPress={shareUpiId} activeOpacity={0.85} style={{ marginHorizontal: Spacing.lg }}>
                <LinearGradient
                    colors={['#8A4FFF', '#6C63FF']}
                    style={styles.shareBtn}
                >
                    <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.shareBtnText}>Share UPI ID</Text>
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },

    // QR Card
    qrCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    qrLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.md },
    qrContainer: { borderRadius: BorderRadius.lg, padding: 10, marginBottom: Spacing.md },
    qrName: { fontSize: FontSize.lg, color: '#FFFFFF', fontWeight: FontWeight.bold },

    // UPI Card
    upiCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
    },
    upiLabel: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
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

    // Share
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    shareBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFFFFF' },
});
