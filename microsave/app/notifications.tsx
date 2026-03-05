/**
 * Notifications Screen
 * - Grouped toggles: Transactions, Reports, System, Alert Style
 * - All settings persisted via AsyncStorage
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const NOTIF_KEY = '@microsave_notifications';

interface NotifSettings {
    transactionAlerts: boolean;
    savingsMilestones: boolean;
    weeklySummary: boolean;
    investmentUpdates: boolean;
    securityAlerts: boolean;
    appUpdates: boolean;
    sound: boolean;
    vibration: boolean;
}

const DEFAULTS: NotifSettings = {
    transactionAlerts: true,
    savingsMilestones: true,
    weeklySummary: true,
    investmentUpdates: false,
    securityAlerts: true,
    appUpdates: false,
    sound: true,
    vibration: true,
};

// ─── Row Component ───────────────────────────────────────────────────────────
function NotifRow({ icon, iconBg, iconColor, label, sublabel, value, onToggle, colors, isLast }: {
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
export default function NotificationsScreen() {
    const { colors } = useTheme();
    const [settings, setSettings] = useState<NotifSettings>(DEFAULTS);

    useEffect(() => {
        AsyncStorage.getItem(NOTIF_KEY).then(val => {
            if (val) setSettings({ ...DEFAULTS, ...JSON.parse(val) });
        });
    }, []);

    const toggle = (key: keyof NotifSettings) => {
        setSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(next));
            return next;
        });
    };

    const enabledCount = Object.values(settings).filter(Boolean).length;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Status Banner */}
                <View style={[styles.banner, { backgroundColor: 'rgba(138,79,255,0.1)', borderColor: 'rgba(138,79,255,0.25)' }]}>
                    <Ionicons name="notifications" size={20} color={colors.primary} />
                    <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
                        <Text style={{ color: colors.primary, fontWeight: FontWeight.bold }}>{enabledCount} of 8</Text>
                        {' '}notifications enabled
                    </Text>
                </View>

                {/* Transactions */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TRANSACTIONS</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <NotifRow
                        icon="flash" iconBg="rgba(0,227,140,0.15)" iconColor={colors.success}
                        label="Transaction Alerts" sublabel="Notify on every UPI debit"
                        value={settings.transactionAlerts} onToggle={() => toggle('transactionAlerts')}
                        colors={colors} isLast={false}
                    />
                    <NotifRow
                        icon="trophy" iconBg="rgba(255,179,71,0.15)" iconColor={colors.warning}
                        label="Savings Milestones" sublabel="Celebrate when you hit your goals"
                        value={settings.savingsMilestones} onToggle={() => toggle('savingsMilestones')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* Reports */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>REPORTS & INSIGHTS</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <NotifRow
                        icon="bar-chart" iconBg="rgba(138,79,255,0.15)" iconColor={colors.primary}
                        label="Weekly Summary" sublabel="Savings report every Sunday morning"
                        value={settings.weeklySummary} onToggle={() => toggle('weeklySummary')}
                        colors={colors} isLast={false}
                    />
                    <NotifRow
                        icon="trending-up" iconBg="rgba(0,212,255,0.15)" iconColor={colors.cyan}
                        label="Investment Updates" sublabel="Notify when ₹100 is auto-invested"
                        value={settings.investmentUpdates} onToggle={() => toggle('investmentUpdates')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* System */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEM</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <NotifRow
                        icon="shield-checkmark" iconBg="rgba(255,68,68,0.15)" iconColor={colors.danger}
                        label="Security Alerts" sublabel="Alerts for suspicious activity"
                        value={settings.securityAlerts} onToggle={() => toggle('securityAlerts')}
                        colors={colors} isLast={false}
                    />
                    <NotifRow
                        icon="download" iconBg="rgba(138,79,255,0.15)" iconColor={colors.accent}
                        label="App Updates" sublabel="Know when new features arrive"
                        value={settings.appUpdates} onToggle={() => toggle('appUpdates')}
                        colors={colors} isLast={true}
                    />
                </View>

                {/* Alert Style */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ALERT STYLE</Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <NotifRow
                        icon="volume-high" iconBg="rgba(255,107,157,0.15)" iconColor={colors.pink}
                        label="Sound" sublabel="Play sound for notifications"
                        value={settings.sound} onToggle={() => toggle('sound')}
                        colors={colors} isLast={false}
                    />
                    <NotifRow
                        icon="phone-portrait" iconBg="rgba(138,79,255,0.15)" iconColor={colors.primary}
                        label="Vibration" sublabel="Haptic feedback on alerts"
                        value={settings.vibration} onToggle={() => toggle('vibration')}
                        colors={colors} isLast={true}
                    />
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

    banner: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        padding: Spacing.md, borderRadius: BorderRadius.lg,
        borderWidth: 1, marginBottom: Spacing.sm,
    },
    bannerText: { fontSize: FontSize.sm },

    sectionLabel: {
        fontSize: FontSize.xs, fontWeight: FontWeight.bold,
        letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg,
    },
    card: { borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden' },

    row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
    rowIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rowLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    rowSub: { fontSize: FontSize.xs, marginTop: 2 },
});
