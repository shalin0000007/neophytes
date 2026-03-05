/**
 * Insights Screen
 * 
 * UI Reference: Spending analysis card with donut chart,
 * category breakdown (Food, Entertainment, Transport, Other),
 * and AI Suggestions cards with colored borders.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getProfile, getRecentTransactions } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

// Simple donut chart component
function DonutChart({ value, max, categories = [], size = 120 }: { value: number; max: number; categories?: any[]; size?: number }) {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = max > 0 ? Math.min(value / max, 1) : 0;

    // Use dynamic categories mapped to segments with minimum visual representation
    const segments = value > 0 && categories.length > 0
        ? categories.map(c => ({ color: c.color, percent: Math.max(c.percent, 0.05) }))
        : [{ color: '#7A8B99', percent: 1 }];

    let offset = 0;
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(138,79,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {segments.map((seg, i) => {
                    const segLength = circumference * seg.percent * progress;
                    const segOffset = circumference - offset;
                    offset += segLength;
                    return (
                        <Circle
                            key={i}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${segLength} ${circumference - segLength}`}
                            strokeDashoffset={segOffset}
                            strokeLinecap="round"
                            fill="none"
                        />
                    );
                })}
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Ionicons name="pie-chart-outline" size={22} color="#FFFFFF" />
            </View>
        </View>
    );
}

// AI Suggestion card
function SuggestionCard({
    icon,
    iconBg,
    borderColor,
    title,
    description,
    colors,
}: {
    icon: string;
    iconBg: string;
    borderColor: string;
    title: string;
    description: string;
    colors: any;
}) {
    return (
        <View style={[styles.suggestionCard, { backgroundColor: colors.surface, borderColor }]}>
            <View style={[styles.suggestionIcon, { backgroundColor: iconBg }]}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
            </View>
            <View style={styles.suggestionContent}>
                <Text style={[styles.suggestionTitle, { color: colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.suggestionDesc, { color: colors.textSecondary }]}>{description}</Text>
            </View>
        </View>
    );
}

const CATEGORY_COLORS: Record<string, string> = {
    'Food & Dining': '#FF3CAC',
    'Shopping': '#8A4FFF',
    'Transport': '#00D4FF',
    'Entertainment': '#6C63FF',
    'Other': '#7A8B99',
};

function categorizeTransaction(merchant: string, description: string): string {
    const text = (merchant + ' ' + description).toLowerCase();
    if (text.match(/zomato|swiggy|uber eats|mcdonalds|starbucks|cafe|restaurant|food|burger|pizza|chai/)) return 'Food & Dining';
    if (text.match(/amazon|flipkart|myntra|ajio|zara|h&m|mall|store|supermarket/)) return 'Shopping';
    if (text.match(/uber|ola|rapido|metro|irctc|fuel|petrol/)) return 'Transport';
    if (text.match(/netflix|prime|spotify|bookmyshow|pvr|cinema/)) return 'Entertainment';
    return 'Other';
}

function generateSuggestions(transactions: any[], colors: any) {
    const suggestions = [];
    // Suggestion 1: Food spending
    const foodSpent = transactions.filter(t => categorizeTransaction(t.merchant || '', t.description || '') === 'Food & Dining').reduce((sum, t) => sum + t.amount, 0);
    if (foodSpent > 500) {
        suggestions.push({
            icon: '🍔',
            iconBg: 'rgba(255,60,172,0.15)',
            borderColor: colors.primary,
            title: 'High Food Expenses',
            description: `You spent ₹${foodSpent} on food recently. Try cooking to save extra!`,
        });
    }

    // Suggestion 2: Recent Savings
    const savedThisWeek = transactions.reduce((sum, t) => sum + (t.saved_amount || 0), 0);
    if (savedThisWeek > 0) {
        suggestions.push({
            icon: '🐷',
            iconBg: 'rgba(0,212,255,0.2)',
            borderColor: colors.cyan,
            title: 'Great Savings Streak',
            description: `You've auto-saved ₹${savedThisWeek.toFixed(2)} recently. Keep it up!`,
        });
    } else {
        suggestions.push({
            icon: '💡',
            iconBg: 'rgba(138,79,255,0.2)',
            borderColor: colors.primary,
            title: 'Start Auto-Saving',
            description: 'Make some UPI payments to start auto-saving your spare change!',
        });
    }

    // Suggestion 3: Top merchant
    const merchants: Record<string, number> = {};
    transactions.forEach(t => { if (t.merchant) merchants[t.merchant] = (merchants[t.merchant] || 0) + t.amount; });
    const topMerchant = Object.entries(merchants).sort((a, b) => b[1] - a[1])[0];
    if (topMerchant && topMerchant[1] > 1000) {
        suggestions.push({
            icon: '📈',
            iconBg: 'rgba(108,99,255,0.2)',
            borderColor: colors.magenta,
            title: 'Top Spending Alert',
            description: `You spent ₹${topMerchant[1]} at ${topMerchant[0]} recently.`,
        });
    }

    if (suggestions.length < 3) {
        suggestions.push({
            icon: '🚀',
            iconBg: 'rgba(0,227,140,0.2)',
            borderColor: '#00E38C',
            title: 'You are on track!',
            description: 'Your spending is looking good right now. Fantastic job managing your budget!',
        });
    }

    return suggestions.slice(0, 3);
}

export default function InsightsScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [totalSpent, setTotalSpent] = useState(0);
    const [categories, setCategories] = useState<{ label: string, color: string, percent: number }[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const profileRes = await getProfile(user.id);
            const p = profileRes.profile as any;
            setTotalSpent(p?.total_spent || 0);

            const { transactions, error } = await getRecentTransactions(user.id, 100);
            if (error) {
                console.error("Insights fetch error:", error);
                return;
            }

            // Calculate categories
            const catTotals: Record<string, number> = {};
            let sum = 0;
            transactions.forEach(t => {
                const amt = t.amount || 0;
                if (amt > 0 && !(t.description && t.description.indexOf('[CR]') !== -1)) {
                    const cat = categorizeTransaction(t.merchant || '', t.description || '');
                    catTotals[cat] = (catTotals[cat] || 0) + amt;
                    sum += amt;
                }
            });

            const sortedCats = Object.entries(catTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([label, amount]) => ({
                    label,
                    color: CATEGORY_COLORS[label] || '#7A8B99',
                    percent: sum > 0 ? amount / sum : 0
                }));

            setCategories(sortedCats);
            setSuggestions(generateSuggestions(transactions, colors));

        } catch (e) {
            console.error("Insights fetch exception:", e);
        } finally {
            setLoading(false);
        }
    }, [user, colors]);

    useEffect(() => { fetchData(); }, [fetchData]);
    const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textPrimary }}>Loading Insights...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Insights</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Spending Analysis Card */}
                <View style={[styles.analysisCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <View style={styles.analysisTop}>
                        <View>
                            <Text style={[styles.analysisLabel, { color: colors.textSecondary }]}>SPENDING ANALYSIS</Text>
                            <Text style={[styles.analysisAmount, { color: colors.primary }]}>
                                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Text>
                            <View style={styles.trendRow}>
                                <Text style={[styles.trendText, { color: colors.textSecondary }]}>This Month </Text>
                                <View style={[styles.trendBadge, { backgroundColor: 'rgba(0,227,140,0.15)' }]}>
                                    <Ionicons name="trending-down" size={12} color="#00E38C" />
                                    <Text style={styles.trendValue}> 15%</Text>
                                </View>
                            </View>
                        </View>
                        <DonutChart value={totalSpent} max={Math.max(totalSpent, 1000)} categories={categories} />
                    </View>

                    {/* Category Legend */}
                    <View style={styles.categoryGrid}>
                        {categories.map((cat, i) => (
                            <View key={i} style={styles.categoryItem}>
                                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>{cat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* AI Suggestions */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AI Suggestions</Text>
                {suggestions.map((s, i) => (
                    <SuggestionCard key={i} {...s} colors={colors} />
                ))}
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
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

    // Analysis Card
    analysisCard: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 1,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    analysisTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    analysisLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        letterSpacing: 1,
        marginBottom: Spacing.xs,
    },
    analysisAmount: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.heavy,
        marginBottom: Spacing.xs,
    },
    trendRow: { flexDirection: 'row', alignItems: 'center' },
    trendText: { fontSize: FontSize.sm },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    trendValue: { fontSize: FontSize.xs, color: '#00E38C', fontWeight: FontWeight.bold },

    // Categories
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '45%',
        paddingVertical: Spacing.xs,
    },
    categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
    categoryLabel: { fontSize: FontSize.sm },

    // Section
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },

    // Suggestions
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    suggestionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    suggestionContent: { flex: 1 },
    suggestionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 4 },
    suggestionDesc: { fontSize: FontSize.sm, lineHeight: 20 },
});
