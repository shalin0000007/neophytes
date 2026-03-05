/**
 * Home Screen (Dashboard)
 * 
 * Main dashboard showing:
 * - Greeting with user name
 * - Summary cards (Total Saved, Total Spent, Total Invested)
 * - Recent transactions list
 * - "Make Payment" quick action
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getProfile, getRecentTransactions } from '@/src/services/savingsEngine';
import { GlassCard } from '@/src/components/GlassCard';
import { AnimatedCounter } from '@/src/components/AnimatedCounter';
import { TransactionItem } from '@/src/components/TransactionItem';
import { SkeletonCard, SkeletonTransaction } from '@/src/components/SkeletonLoader';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

interface Profile {
    name: string;
    total_spent: number;
    total_saved: number;
    total_invested: number;
    goal_amount: number;
}

interface Transaction {
    id: string;
    amount: number;
    saved_amount: number;
    description: string;
    created_at: string;
}

export default function HomeScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [profileRes, txRes] = await Promise.all([
            getProfile(user.id),
            getRecentTransactions(user.id, 5),
        ]);
        if (profileRes.profile) setProfile(profileRes.profile as any);
        setTransactions(txRes.transactions as Transaction[]);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const greeting = getGreeting();
    const userName = profile?.name || user?.user_metadata?.name || 'Student';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
                        <Text style={[styles.userName, { color: colors.textPrimary }]}>{userName} 👋</Text>
                    </View>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Summary Cards */}
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* Total Saved — Hero card */}
                        <GlassCard variant="accent" style={styles.heroCard}>
                            <Text style={[styles.cardLabel, { color: colors.primary }]}>Total Saved</Text>
                            <AnimatedCounter value={profile?.total_saved || 0} size="hero" style={{ color: colors.primary }} />
                            {profile && profile.goal_amount > 0 && (
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { backgroundColor: 'rgba(0,227,140,0.2)' }]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    backgroundColor: colors.primary,
                                                    width: `${Math.min(((profile.total_saved || 0) / profile.goal_amount) * 100, 100)}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                                        Goal: ₹{profile.goal_amount.toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            )}
                        </GlassCard>

                        {/* Spent & Invested row */}
                        <View style={styles.cardRow}>
                            <GlassCard style={styles.halfCard}>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Total Spent</Text>
                                <AnimatedCounter value={profile?.total_spent || 0} size="md" />
                            </GlassCard>
                            <GlassCard style={styles.halfCard}>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Invested</Text>
                                <AnimatedCounter value={profile?.total_invested || 0} size="md" style={{ color: colors.primary }} />
                            </GlassCard>
                        </View>
                    </>
                )}

                {/* Quick Action */}
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/(tabs)/pay')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="send" size={20} color="#000" />
                    <Text style={styles.payButtonText}>Make Payment</Text>
                </TouchableOpacity>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
                </View>

                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonTransaction key={i} />)
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>💰</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No transactions yet</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            Start your first payment to begin saving.
                        </Text>
                    </View>
                ) : (
                    transactions.map((tx) => (
                        <TransactionItem
                            key={tx.id}
                            amount={tx.amount}
                            savedAmount={tx.saved_amount}
                            description={tx.description}
                            createdAt={tx.created_at}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greeting: { fontSize: FontSize.md },
    userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: 2 },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    heroCard: { marginBottom: Spacing.md },
    cardLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.xs },
    cardRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
    halfCard: { flex: 1 },
    progressContainer: { marginTop: Spacing.md },
    progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: FontSize.xs, marginTop: Spacing.xs },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
    },
    payButtonText: { color: '#000', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    sectionHeader: { marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
    emptySubtitle: { fontSize: FontSize.md, marginTop: Spacing.xs, textAlign: 'center' },
});
