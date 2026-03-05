/**
 * Stats Screen
 * 
 * Shows 4 types of visual analytics:
 * 1. Savings vs Expenses bar chart
 * 2. Category breakdown (donut-style)
 * 3. Daily spending trend
 * 4. Savings growth over time
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getRecentTransactions, getProfile } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Transaction {
    id: string;
    amount: number;
    saved_amount: number;
    description: string;
    created_at: string;
}

// Categorize a transaction by description
function categorize(desc: string): string {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('swiggy') || d.includes('zomato') || d.includes('restaurant')) return 'Food & Dining';
    if (d.includes('amazon') || d.includes('flipkart') || d.includes('shopping') || d.includes('myntra')) return 'Shopping';
    if (d.includes('ola') || d.includes('uber') || d.includes('transport') || d.includes('metro')) return 'Transport';
    if (d.includes('netflix') || d.includes('spotify') || d.includes('subscription') || d.includes('hotstar')) return 'Entertainment';
    if (d.includes('recharge') || d.includes('jio') || d.includes('airtel') || d.includes('bill')) return 'Bills & Recharge';
    if (d.includes('coffee') || d.includes('starbucks') || d.includes('cafe')) return 'Cafe & Drinks';
    return 'General';
}

const CATEGORY_COLORS: Record<string, string> = {
    'Food & Dining': '#FF6B9D',
    'Shopping': '#8A4FFF',
    'Transport': '#FFB347',
    'Entertainment': '#FF3CAC',
    'Bills & Recharge': '#00D4FF',
    'Cafe & Drinks': '#00E38C',
    'General': '#6C63FF',
};

export default function StatsScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalSaved, setTotalSaved] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [{ transactions: txns }, { profile }] = await Promise.all([
            getRecentTransactions(user.id, 100),
            getProfile(user.id),
        ]);
        setTransactions((txns || []) as Transaction[]);
        const p = profile as any;
        setTotalSaved(p?.total_saved || 0);
        setTotalSpent(p?.total_spent || 0);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // ─── Chart Data Calculations ───

    // 1. Category breakdown
    const categoryData = transactions.reduce((acc, txn) => {
        const cat = categorize(txn.description || '');
        acc[cat] = (acc[cat] || 0) + txn.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => b - a);

    const totalCategorySpend = sortedCategories.reduce((s, [, v]) => s + v, 0);

    // 2. Daily spending (last 7 days)
    const dailySpending: Record<string, number> = {};
    const dailySaving: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        dailySpending[key] = 0;
        dailySaving[key] = 0;
    }

    transactions.forEach((txn) => {
        const d = new Date(txn.created_at);
        const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (dailySpending[key] !== undefined) {
            dailySpending[key] += txn.amount;
            dailySaving[key] += (txn.saved_amount || 0);
        }
    });

    const maxDailySpend = Math.max(...Object.values(dailySpending), 1);
    const maxDailySave = Math.max(...Object.values(dailySaving), 1);

    // 3. Savings rate
    const savingsRate = totalSpent > 0 ? ((totalSaved / totalSpent) * 100).toFixed(1) : '0';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stats & Analytics</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* ═══ Chart 1: Savings vs Expense Overview ═══ */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>💰 Savings vs Expenses</Text>
                    <View style={styles.barChartRow}>
                        {/* Savings Bar */}
                        <View style={styles.barContainer}>
                            <Text style={[styles.barValue, { color: colors.success }]}>₹{totalSaved.toLocaleString('en-IN')}</Text>
                            <View style={[styles.barTrack, { backgroundColor: colors.cardBorder }]}>
                                <LinearGradient
                                    colors={['#00E38C', '#00D4FF']}
                                    style={[styles.barFill, {
                                        height: `${Math.min((totalSaved / Math.max(totalSpent, totalSaved, 1)) * 100, 100)}%`
                                    }]}
                                />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Saved</Text>
                        </View>
                        {/* Expense Bar */}
                        <View style={styles.barContainer}>
                            <Text style={[styles.barValue, { color: '#FF6B9D' }]}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                            <View style={[styles.barTrack, { backgroundColor: colors.cardBorder }]}>
                                <LinearGradient
                                    colors={['#FF6B9D', '#FF3CAC']}
                                    style={[styles.barFill, {
                                        height: `${Math.min((totalSpent / Math.max(totalSpent, totalSaved, 1)) * 100, 100)}%`
                                    }]}
                                />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Spent</Text>
                        </View>
                        {/* Savings Rate */}
                        <View style={[styles.barContainer, { justifyContent: 'center' }]}>
                            <Text style={[styles.rateValue, { color: colors.primary }]}>{savingsRate}%</Text>
                            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Savings Rate</Text>
                        </View>
                    </View>
                </View>

                {/* ═══ Chart 2: Category Breakdown ═══ */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>📊 Spending by Category</Text>
                    {sortedCategories.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions to analyze yet</Text>
                    ) : (
                        sortedCategories.map(([cat, amount]) => {
                            const pct = totalCategorySpend > 0 ? (amount / totalCategorySpend) * 100 : 0;
                            const color = CATEGORY_COLORS[cat] || colors.primary;
                            return (
                                <View key={cat} style={styles.categoryRow}>
                                    <View style={styles.categoryInfo}>
                                        <View style={[styles.categoryDot, { backgroundColor: color }]} />
                                        <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{cat}</Text>
                                    </View>
                                    <View style={styles.categoryBarWrap}>
                                        <View style={[styles.categoryBarTrack, { backgroundColor: colors.cardBorder }]}>
                                            <View style={[styles.categoryBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                                        </View>
                                        <Text style={[styles.categoryAmount, { color: colors.textSecondary }]}>
                                            ₹{amount.toLocaleString('en-IN')} ({Math.round(pct)}%)
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* ═══ Chart 3: Daily Spending Trend (7 days) ═══ */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>📈 Daily Spending (7 Days)</Text>
                    <View style={styles.dailyChart}>
                        {Object.entries(dailySpending).map(([day, amount]) => (
                            <View key={day} style={styles.dailyCol}>
                                <Text style={[styles.dailyValue, { color: colors.textMuted }]}>
                                    {amount > 0 ? `₹${amount}` : ''}
                                </Text>
                                <View style={[styles.dailyBarTrack, { backgroundColor: colors.cardBorder }]}>
                                    <LinearGradient
                                        colors={['#FF6B9D', '#FF3CAC']}
                                        style={[styles.dailyBarFill, {
                                            height: `${(amount / maxDailySpend) * 100}%`
                                        }]}
                                    />
                                </View>
                                <Text style={[styles.dailyLabel, { color: colors.textMuted }]}>{day.split(' ')[0]}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══ Chart 4: Savings Growth (7 days) ═══ */}
                <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>🌱 Daily Savings (7 Days)</Text>
                    <View style={styles.dailyChart}>
                        {Object.entries(dailySaving).map(([day, amount]) => (
                            <View key={day} style={styles.dailyCol}>
                                <Text style={[styles.dailyValue, { color: colors.textMuted }]}>
                                    {amount > 0 ? `₹${amount}` : ''}
                                </Text>
                                <View style={[styles.dailyBarTrack, { backgroundColor: colors.cardBorder }]}>
                                    <LinearGradient
                                        colors={['#00E38C', '#00D4FF']}
                                        style={[styles.dailyBarFill, {
                                            height: `${(amount / maxDailySave) * 100}%`
                                        }]}
                                    />
                                </View>
                                <Text style={[styles.dailyLabel, { color: colors.textMuted }]}>{day.split(' ')[0]}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg, paddingBottom: 100 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },

    // Cards
    card: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
    emptyText: { fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.lg },

    // Bar Chart (Savings vs Expenses)
    barChartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 180 },
    barContainer: { alignItems: 'center', flex: 1 },
    barValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
    barTrack: { width: 40, height: 120, borderRadius: 20, overflow: 'hidden', justifyContent: 'flex-end' },
    barFill: { width: '100%', borderRadius: 20 },
    barLabel: { fontSize: FontSize.xs, marginTop: Spacing.xs },
    rateValue: { fontSize: FontSize.hero, fontWeight: FontWeight.heavy },

    // Category Breakdown
    categoryRow: { marginBottom: Spacing.md },
    categoryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.xs },
    categoryName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    categoryBarWrap: { flexDirection: 'row', alignItems: 'center' },
    categoryBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginRight: Spacing.sm },
    categoryBarFill: { height: '100%', borderRadius: 4 },
    categoryAmount: { fontSize: FontSize.xs, width: 100, textAlign: 'right' },

    // Daily Chart
    dailyChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
    dailyCol: { alignItems: 'center', flex: 1 },
    dailyValue: { fontSize: 9, marginBottom: 4 },
    dailyBarTrack: { width: 24, height: 100, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
    dailyBarFill: { width: '100%', borderRadius: 12 },
    dailyLabel: { fontSize: 10, marginTop: 4 },
});
