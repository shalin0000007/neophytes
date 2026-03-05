/**
 * Profile Screen
 * 
 * User info, theme toggle, goal amount setting, and logout.
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { signOut, supabase } from '@/src/services/supabase';
import { getProfile } from '@/src/services/savingsEngine';
import { GlassCard } from '@/src/components/GlassCard';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

export default function ProfileScreen() {
    const { colors, mode, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [goalAmount, setGoalAmount] = useState('10000');
    const [editingGoal, setEditingGoal] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            getProfile(user.id).then(({ profile }) => {
                if (profile) {
                    setName((profile as any).name || '');
                    setGoalAmount(String((profile as any).goal_amount || 10000));
                }
            });
        }
    }, [user]);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
    };

    const handleSaveGoal = async () => {
        const goal = parseFloat(goalAmount);
        if (!goal || goal <= 0) {
            Alert.alert('Error', 'Please enter a valid goal amount');
            return;
        }
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ goal_amount: goal })
            .eq('id', user.id);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', `Goal updated to ₹${goal.toLocaleString('en-IN')}`);
            setEditingGoal(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>

                {/* User Info */}
                <GlassCard style={styles.section}>
                    <View style={styles.avatarRow}>
                        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {name ? name.charAt(0).toUpperCase() : '?'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: colors.textPrimary }]}>{name || 'User'}</Text>
                            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{email}</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Settings */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SETTINGS</Text>

                <GlassCard style={styles.section}>
                    {/* Theme Toggle */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons
                                name={mode === 'dark' ? 'moon' : 'sunny'}
                                size={20}
                                color={colors.primary}
                            />
                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={mode === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.inputBg, true: colors.primaryLight }}
                            thumbColor={mode === 'dark' ? colors.primary : colors.textSecondary}
                        />
                    </View>

                    {/* Goal Amount */}
                    <View style={[styles.settingRow, { borderTopColor: colors.cardBorder, borderTopWidth: 1 }]}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="flag-outline" size={20} color={colors.primary} />
                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Savings Goal</Text>
                        </View>
                        {editingGoal ? (
                            <View style={styles.goalEdit}>
                                <TextInput
                                    style={[styles.goalInput, { color: colors.textPrimary, borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                                    value={goalAmount}
                                    onChangeText={setGoalAmount}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity onPress={handleSaveGoal}>
                                    <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingGoal(true)} style={styles.goalDisplay}>
                                <Text style={[styles.goalText, { color: colors.textPrimary }]}>
                                    ₹{parseFloat(goalAmount).toLocaleString('en-IN')}
                                </Text>
                                <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </GlassCard>

                {/* About */}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>

                <GlassCard style={styles.section}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Version</Text>
                        </View>
                        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
                    </View>
                </GlassCard>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: 'rgba(255,107,107,0.1)', borderColor: colors.danger }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
    title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.lg },
    section: { marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginBottom: Spacing.sm, marginLeft: Spacing.xs, letterSpacing: 1 },
    avatarRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    userInfo: { marginLeft: Spacing.md },
    userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    userEmail: { fontSize: FontSize.sm, marginTop: 2 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    settingLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
    settingValue: { fontSize: FontSize.md },
    goalEdit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    goalInput: {
        width: 100,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        fontSize: FontSize.md,
        textAlign: 'right',
    },
    goalDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    goalText: { fontSize: FontSize.md, fontWeight: FontWeight.medium },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginTop: Spacing.lg,
    },
    logoutText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
