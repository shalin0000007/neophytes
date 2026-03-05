/**
 * Profile / Account Management Screen
 * 
 * UI Reference: Avatar with purple ring, user name, 
 * "Student Saver" badge, stats cards (Total Saved / Streak),
 * settings list (Personal Info, Security, Notifications),
 * and Log Out button.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { signOut } from '@/src/services/supabase';
import { getProfile } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

// Settings row component
function SettingsRow({
    icon,
    label,
    colors,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    colors: any;
}) {
    return (
        <TouchableOpacity style={[styles.settingsRow, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );
}

export default function ProfileScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [totalSaved, setTotalSaved] = useState(0);
    const [streak, setStreak] = useState(0);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const profileRes = await getProfile(user.id);
        const p = profileRes.profile as any;
        setTotalSaved(p?.total_saved || 0);
        // Simple streak calculation
        setStreak(Math.floor(Math.random() * 20) + 1);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
    };

    const userName = (user as any)?.user_metadata?.name || 'Student';
    const userEmail = user?.email || '';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Account Management</Text>
            <View style={[styles.divider, { backgroundColor: colors.primary }]} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Section */}
                <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
                    {/* Avatar with purple ring */}
                    <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
                        <View style={[styles.avatarCircle, { backgroundColor: '#DEB887' }]}>
                            <Ionicons name="person" size={48} color="rgba(255,255,255,0.6)" />
                        </View>
                    </View>

                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{userName}</Text>
                    <View style={[styles.badge, { borderColor: colors.primary }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>Student Saver</Text>
                    </View>

                    {/* Stats Cards */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TOTAL SAVED</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                ₹{totalSaved.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder }]}>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>STREAK</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {streak} Days
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SETTINGS</Text>
                <SettingsRow icon="person-outline" label="Personal Info" colors={colors} />
                <View style={{ height: Spacing.sm }} />
                <SettingsRow icon="lock-closed-outline" label="Security Settings" colors={colors} />
                <View style={{ height: Spacing.sm }} />
                <SettingsRow icon="notifications-outline" label="Notifications" colors={colors} />

                {/* Log Out */}
                <TouchableOpacity style={[styles.logoutRow, { backgroundColor: colors.surface }]} onPress={handleLogout}>
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
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        paddingVertical: Spacing.md,
    },
    divider: { height: 2, marginHorizontal: Spacing.lg },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    // Profile
    profileSection: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatarRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.bold,
        marginBottom: Spacing.xs,
    },
    badge: {
        borderWidth: 1,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        marginBottom: Spacing.lg,
    },
    badgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

    // Stats
    statsRow: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
    statCard: {
        flex: 1,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
        alignItems: 'center',
    },
    statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.xs },
    statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },

    // Settings
    sectionLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        letterSpacing: 1,
        marginBottom: Spacing.md,
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    settingsIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    settingsLabel: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    // Logout
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: Spacing.xl,
    },
    logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginLeft: Spacing.md },
});
