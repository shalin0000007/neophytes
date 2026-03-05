/**
 * Security Settings Screen
 * - App Lock, Biometric Auth
 * - Hide Balance, Transaction Alerts
 * - Two-Factor Authentication
 * - Change Password (triggers alert flow)
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const SEC_KEY = '@microsave_security';

interface SecSettings {
    appLock: boolean;
    biometric: boolean;
    hideBalance: boolean;
    transactionAlerts: boolean;
    twoFactor: boolean;
}

const DEFAULTS: SecSettings = {
    appLock: false,
    biometric: false,
    hideBalance: false,
    transactionAlerts: true,
    twoFactor: false,
};

// ─── Toggle Row ─────────────────────────────────────────────────────────────
function ToggleRow({ icon, iconBg, iconColor, label, sublabel, value, onToggle, colors, isLast }: {
    icon: any; iconBg: string; iconColor: string;
    label: string; sublabel: string;
    value: boolean; onToggle: () => void;
    colors: any; isLast: boolean;
}) {
    return (
        <View style={[
            styles.row,
            !isLast && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
        ]}>
            <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
                <Text style={[styles.rowSub, { color: colors.textMuted }]}>{sublabel}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: colors.cardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.cardBorder}
            />
        </View>
    );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function SecuritySettingsScreen() {
    const { colors } = useTheme();
    const [settings, setSettings] = useState<SecSettings>(DEFAULTS);

    useEffect(() => {
        AsyncStorage.getItem(SEC_KEY).then(val => {
            if (val) setSettings({ ...DEFAULTS, ...JSON.parse(val) });
        });
    }, []);

    const toggle = (key: keyof SecSettings) => {
        setSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            AsyncStorage.setItem(SEC_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleChangePassword = () => {
        Alert.alert(
            'Change Password',
            'A password reset link will be sent to your registered email.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send Email', onPress: () => Alert.alert('Email Sent ✉️', 'Check your inbox for the reset link.') },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Security Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* App Security */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APP SECURITY</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <ToggleRow
                        icon="lock-closed" iconBg="rgba(138,79,255,0.15)" iconColor={colors.primary}
                        label="App Lock" sublabel="Require PIN to open MicroSave"
                        value={settings.appLock} onToggle={() => toggle('appLock')}
                        colors={colors} isLast={false}
                    />
                    <ToggleRow
                        icon="finger-print" iconBg="rgba(0,212,255,0.15)" iconColor={colors.cyan}
                        label="Biometric Authentication" sublabel="Use fingerprint or Face ID"
                        value={settings.biometric} onToggle={() => toggle('biometric')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* Privacy */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIVACY</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <ToggleRow
                        icon="eye-off" iconBg="rgba(255,107,157,0.15)" iconColor={colors.pink}
                        label="Hide Balance" sublabel="Blur savings balance on home screen"
                        value={settings.hideBalance} onToggle={() => toggle('hideBalance')}
                        colors={colors} isLast={false}
                    />
                    <ToggleRow
                        icon="shield-checkmark" iconBg="rgba(0,227,140,0.15)" iconColor={colors.success}
                        label="Transaction Alerts" sublabel="Instant alert for every debit"
                        value={settings.transactionAlerts} onToggle={() => toggle('transactionAlerts')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* Account Security */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCOUNT</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <ToggleRow
                        icon="key" iconBg="rgba(255,179,71,0.15)" iconColor={colors.warning}
                        label="Two-Factor Authentication" sublabel="OTP on every login for extra safety"
                        value={settings.twoFactor} onToggle={() => toggle('twoFactor')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* Change Password */}
                <TouchableOpacity
                    style={[styles.dangerBtn, { backgroundColor: 'rgba(255,68,68,0.08)', borderColor: 'rgba(255,68,68,0.3)' }]}
                    onPress={handleChangePassword}
                    activeOpacity={0.8}
                >
                    <Ionicons name="key-outline" size={20} color={colors.danger} />
                    <Text style={[styles.dangerText, { color: colors.danger }]}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.danger} />
                </TouchableOpacity>

                {/* Info Banner */}
                <View style={[styles.infoBanner, { backgroundColor: 'rgba(138,79,255,0.08)', borderColor: 'rgba(138,79,255,0.2)' }]}>
                    <Ionicons name="shield-half" size={22} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Your data is protected with AES-256 encryption. MicroSave never stores your UPI PIN or banking passwords.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    sectionLabel: {
        fontSize: FontSize.xs, fontWeight: FontWeight.bold,
        letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg,
    },
    card: { borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden' },

    row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
    rowIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    rowSub: { fontSize: FontSize.xs, marginTop: 2 },

    dangerBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        borderRadius: BorderRadius.lg, borderWidth: 1,
        padding: Spacing.md, marginTop: Spacing.lg,
    },
    dangerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    infoBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        borderRadius: BorderRadius.lg, borderWidth: 1,
        padding: Spacing.md, marginTop: Spacing.lg,
    },
    infoText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18 },
});
