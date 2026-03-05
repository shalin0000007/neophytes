/**
 * Profile / Account Management Screen
 *
 * - Shows selected avatar (reloads on focus)
 * - Personal Info → navigates to /personal-info
 * - Security Settings → navigates to /security-settings
 * - Notifications → navigates to /notifications
 * - Dark/Light theme toggle
 * - Log Out
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { signOut } from '@/src/services/supabase';
import { getProfile } from '@/src/services/savingsEngine';
import { getSavedAvatarId, getSavedDisplayName, getAvatarById } from '@/src/services/avatarService';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

// ─── Settings Row ────────────────────────────────────────────────────────────
function SettingsRow({
    icon, label, colors, onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    colors: any;
    onPress?: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.settingsRow, { backgroundColor: colors.surface }]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>{label}</Text>
            {onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
        </TouchableOpacity>
    );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const { colors, mode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [totalSaved, setTotalSaved] = useState(0);
    const [streak, setStreak] = useState(0);
    const [avatarId, setAvatarId] = useState('1');
    const [displayName, setDisplayName] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) return;
        const profileRes = await getProfile(user.id);
        const p = profileRes.profile as any;
        setTotalSaved(p?.total_saved || 0);
        setStreak(Math.floor(Math.random() * 20) + 1);
    }, [user]);

    // Reload avatar & name every time screen is focused
    const loadAvatar = useCallback(async () => {
        const [id, name] = await Promise.all([
            getSavedAvatarId(),
            getSavedDisplayName(),
        ]);
        setAvatarId(id);
        setDisplayName(name ?? (user as any)?.user_metadata?.name ?? '');
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useFocusEffect(
        useCallback(() => { loadAvatar(); }, [loadAvatar])
    );

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => { await signOut(); },
            },
        ]);
    };

    const avatar = getAvatarById(avatarId);
    const userEmail = user?.email || '';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Account Management</Text>
            <View style={[styles.divider, { backgroundColor: colors.primary }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Section */}
                <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
                    {/* Avatar */}
                    <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
                        <View style={[styles.avatarCircle, { backgroundColor: avatar.bg }]}>
                            <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                        </View>
                    </View>

                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                        {displayName || 'Student'}
                    </Text>
                    <Text style={[styles.userEmail, { color: colors.textMuted }]}>{userEmail}</Text>
                    <View style={[styles.badge, { borderColor: colors.primary }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>
                            Student Saver · {avatar.label}
                        </Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TOTAL SAVED</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                ₹{totalSaved.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>STREAK</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{streak} Days</Text>
                        </View>
                    </View>
                </View>

                {/* Settings */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SETTINGS</Text>

                <SettingsRow
                    icon="person-outline"
                    label="Personal Info"
                    colors={colors}
                    onPress={() => router.push('/personal-info')}
                />

                {/* Theme Toggle*/}
                <View style={{ height: Spacing.sm }} />
                <View style={[styles.themeRow, { backgroundColor: colors.surface }]}>
                    <View style={[styles.settingsIcon, {
                        backgroundColor: mode === 'dark' ? 'rgba(138,79,255,0.15)' : 'rgba(255,180,50,0.15)',
                    }]}>
                        <Ionicons
                            name={mode === 'dark' ? 'moon' : 'sunny'}
                            size={20}
                            color={mode === 'dark' ? colors.primary : '#F59E0B'}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Appearance</Text>
                        <Text style={[styles.themeSub, { color: colors.textMuted }]}>
                            {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Switch
                        value={mode === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: 'rgba(0,0,0,0.15)', true: colors.primary }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="rgba(0,0,0,0.1)"
                    />
                </View>

                <View style={{ height: Spacing.sm }} />
                <SettingsRow
                    icon="lock-closed-outline"
                    label="Security Settings"
                    colors={colors}
                    onPress={() => router.push('/security-settings')}
                />
                <View style={{ height: Spacing.sm }} />
                <SettingsRow
                    icon="notifications-outline"
                    label="Notifications"
                    colors={colors}
                    onPress={() => router.push('/notifications')}
                />

                {/* Log Out */}
                <TouchableOpacity
                    style={[styles.logoutRow, { backgroundColor: colors.surface }]}
                    onPress={handleLogout}
                >
                    <View style={[styles.settingsIcon, { backgroundColor: 'rgba(255,68,68,0.15)' }]}>
                        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    </View>
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenTitle: {
        fontSize: FontSize.xl, fontWeight: FontWeight.bold,
        textAlign: 'center', paddingVertical: Spacing.md,
    },
    divider: { height: 2, marginHorizontal: Spacing.lg },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    // Profile
    profileSection: {
        borderRadius: BorderRadius.xxl, padding: Spacing.lg,
        alignItems: 'center', marginBottom: Spacing.xl,
    },
    avatarRing: {
        width: 110, height: 110, borderRadius: 55,
        borderWidth: 3, justifyContent: 'center',
        alignItems: 'center', marginBottom: Spacing.md,
    },
    avatarCircle: {
        width: 100, height: 100, borderRadius: 50,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarEmoji: { fontSize: 48 },
    userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: 2 },
    userEmail: { fontSize: FontSize.sm, marginBottom: Spacing.sm },
    badge: {
        borderWidth: 1, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    badgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

    // Stats
    statsRow: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
    statCard: {
        flex: 1, borderRadius: BorderRadius.lg, borderWidth: 1,
        padding: Spacing.md, alignItems: 'center',
    },
    statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.xs },
    statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

    // Settings
    sectionLabel: {
        fontSize: FontSize.xs, fontWeight: FontWeight.bold,
        letterSpacing: 1, marginBottom: Spacing.md,
    },
    settingsRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BorderRadius.lg, padding: Spacing.md,
    },
    settingsIcon: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
    },
    settingsLabel: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    // Theme toggle row
    themeRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BorderRadius.lg, padding: Spacing.md,
    },
    themeSub: { fontSize: FontSize.xs, marginTop: 2 },

    // Logout
    logoutRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: Spacing.xl,
    },
    logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginLeft: Spacing.md },
});
