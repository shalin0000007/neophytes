/**
 * Pay Screen (Center Tab)
 * 
 * Shows UPI app buttons for PhonePe, Google Pay, Paytm.
 * MicroSave automatically detects the payment via SMS.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const UPI_APPS = [
    { name: 'PhonePe', emoji: '💜', url: 'phonepe://pay', color: '#5F259F' },
    { name: 'Google Pay', emoji: '🔵', url: 'tez://upi/pay', color: '#4285F4' },
    { name: 'Paytm', emoji: '🔷', url: 'paytmmp://pay', color: '#002970' },
];

const openApp = async (name: string, url: string) => {
    try {
        await Linking.openURL(url);
    } catch (e) {
        Alert.alert(
            `${name} not found`,
            `${name} does not appear to be installed on this device.`
        );
    }
};

export default function PayScreen() {
    const { colors } = useTheme();

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

                <View style={styles.appsRow}>
                    {UPI_APPS.map(app => (
                        <TouchableOpacity
                            key={app.name}
                            style={[styles.appBtn, { backgroundColor: app.color }]}
                            onPress={() => openApp(app.name, app.url)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.appEmoji}>{app.emoji}</Text>
                            <Text style={styles.appName}>{app.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        After you pay, MicroSave reads the bank SMS and saves your spare change automatically.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    appsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    appBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 96,
        height: 96,
        borderRadius: BorderRadius.xl,
        gap: 6,
    },
    appEmoji: { fontSize: 30 },
    appName: {
        color: '#fff',
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginHorizontal: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
});
