/**
 * Pay Screen (Center Tab)
 * 
 * This screen is linked to the center "+" button.
 * When opened, it immediately tries to open a UPI payment app.
 * Also shows a manual trigger button as fallback.
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

async function openUPIApp() {
    const upiUrl = 'upi://pay';
    try {
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
            await Linking.openURL(upiUrl);
            return;
        }
        const apps = [
            { name: 'Google Pay', url: 'tez://upi/pay' },
            { name: 'PhonePe', url: 'phonepe://upi' },
            { name: 'Paytm', url: 'paytmmp://upi' },
        ];
        for (const app of apps) {
            const can = await Linking.canOpenURL(app.url);
            if (can) { await Linking.openURL(app.url); return; }
        }
        Alert.alert('No UPI App Found', 'Please install a UPI payment app like Google Pay, PhonePe, or Paytm.');
    } catch (error) {
        Alert.alert('Error', 'Could not open payment app');
    }
}

export default function PayScreen() {
    const { colors } = useTheme();

    useEffect(() => {
        // Auto-open UPI when this screen is focused
        openUPIApp();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="flash" size={48} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Quick Pay</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Pay using your favorite UPI app.{'\n'}
                    MicroSave will auto-detect and round up your savings!
                </Text>

                <TouchableOpacity onPress={openUPIApp} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#8A4FFF', '#6C63FF']}
                        style={styles.payButton}
                    >
                        <Ionicons name="open-outline" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                        <Text style={styles.payButtonText}>Open UPI App</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
    subtitle: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
    payButton: {
        flexDirection: 'row',
        height: 56,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payButtonText: { color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
