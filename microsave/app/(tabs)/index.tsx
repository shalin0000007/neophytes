/**
 * Dashboard / Home Screen
 * 
 * UI Reference: Purple gradient savings card with progress bar,
 * Quick Actions grid (Send/Receive/Save/Stats), 
 * Recent Activity list with colored icons.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getProfile, getRecentTransactions } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/src/theme';

interface Transaction {
    id: string;
    amount: number;
    saved_amount: number;
    description: string;
    created_at: string;
}

export default function DashboardScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [totalSaved, setTotalSaved] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [goalAmount, setGoalAmount] = useState(10000);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [profileRes, txnRes] = await Promise.all([
            getProfile(user.id),
            getRecentTransactions(user.id),
        ]);
        const p = profileRes.profile as any;
        setTotalSaved(p?.total_saved || 0);
        setTotalSpent(p?.total_spent || 0);
        setGoalAmount(p?.goal_amount || 10000);
        setTransactions((txnRes.transactions || []) as Transaction[]);
        setLoading(false);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const progress = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
    const userName = (user as any)?.user_metadata?.name || 'Student';

    // Quick action items
    const quickActions = [
        { icon: 'arrow-up' as const, label: 'Send', color: colors.primary },
        { icon: 'arrow-down' as const, label: 'Receive', color: colors.primary },
        { icon: 'add' as const, label: 'Save', color: colors.primary },
        { icon: 'bar-chart' as const, label: 'Stats', color: colors.primary },
    ];

    // Transaction icon based on description
    const getTxnIcon = (desc: string) => {
        const d = desc.toLowerCase();
        if (d.includes('coffee') || d.includes('starbucks') || d.includes('cafe')) return { icon: '☕', bg: 'rgba(0,212,255,0.15)' };
        if (d.includes('food') || d.includes('restaurant') || d.includes('pizza')) return { icon: '🍔', bg: 'rgba(255,107,157,0.15)' };
        if (d.includes('netflix') || d.includes('subscription') || d.includes('spotify')) return { icon: '🎬', bg: 'rgba(255,60,172,0.15)' };
        if (d.includes('allowance') || d.includes('salary') || d.includes('receive')) return { icon: '💰', bg: 'rgba(0,227,140,0.15)' };
        if (d.includes('transport') || d.includes('uber') || d.includes('bus')) return { icon: '🚌', bg: 'rgba(255,179,71,0.15)' };
        return { icon: '💳', bg: 'rgba(138,79,255,0.15)' };
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatar, { backgroundColor: '#DEB887' }]}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dashboard</Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Savings Card */}
                <LinearGradient
                    colors={['#8A4FFF', '#6C63FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.savingsCard}
                >
                    <Text style={styles.savingsLabel}>Total Savings</Text>
                    <Text style={styles.savingsAmount}>₹{totalSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                    <View style={styles.goalRow}>
                        <Text style={styles.goalText}>Goal: ₹{goalAmount.toLocaleString('en-IN')}</Text>
                        <Text style={styles.goalPercent}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={['#00D4FF', '#00E38C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${progress}%` }]}
                        />
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    {quickActions.map((action, i) => (
                        <TouchableOpacity key={i} style={styles.actionItem}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                                <Ionicons name={action.icon} size={24} color={action.color} />
                            </View>
                            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.activityHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Recent Activity</Text>
                    <TouchableOpacity>
                        <Text style={[styles.seeAll, { color: colors.cyan }]}>See All</Text>
                    </TouchableOpacity>
                </View>

                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 42, marginBottom: Spacing.md }}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No activity yet</Text>
                        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                            Make your first payment to start saving!
                        </Text>
                    </View>
                ) : (
                    transactions.slice(0, 5).map((txn) => {
                        const { icon, bg } = getTxnIcon(txn.description || '');
                        const isPositive = txn.saved_amount > txn.amount;
                        return (
                            <View key={txn.id} style={[styles.txnItem, { borderBottomColor: colors.cardBorder }]}>
                                <View style={[styles.txnIcon, { backgroundColor: bg }]}>
                                    <Text style={{ fontSize: 22 }}>{icon}</Text>
                                </View>
                                <View style={styles.txnInfo}>
                                    <Text style={[styles.txnName, { color: colors.textPrimary }]}>{txn.description || 'Transaction'}</Text>
                                    <Text style={[styles.txnDate, { color: colors.textMuted }]}>
                                        {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </Text>
                                </View>
                                <Text style={[styles.txnAmount, { color: isPositive ? colors.success : colors.textPrimary }]}>
                                    {isPositive ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarEmoji: { fontSize: 20 },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },

    // Savings Card  
    savingsCard: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        ...Shadows.lg,
    },
    savingsLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.medium },
    savingsAmount: { fontSize: FontSize.hero, color: '#FFFFFF', fontWeight: FontWeight.heavy, marginVertical: Spacing.sm },
    goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    goalText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
    goalPercent: { fontSize: FontSize.sm, color: '#FFFFFF', fontWeight: FontWeight.bold },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 4 },

    // Quick Actions
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
    actionItem: { alignItems: 'center', flex: 1 },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

    // Activity
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

    // Transactions
    txnItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 0.5 },
    txnIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    txnInfo: { flex: 1 },
    txnName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    txnDate: { fontSize: FontSize.xs, marginTop: 2 },
    txnAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
    emptySub: { fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
});
