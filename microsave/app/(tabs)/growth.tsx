/**
 * Growth Screen
 * 
 * Shows investment progress:
 * - Total invested card
 * - Projected growth card
 * - Animated line chart of savings over time
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

let LineChart: any = null;
try {
    LineChart = require('react-native-chart-kit').LineChart;
} catch (e) {
    // chart library not available - will render fallback
}

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getProfile, getInvestments, projectReturn } from '@/src/services/savingsEngine';
import { GlassCard } from '@/src/components/GlassCard';
import { AnimatedCounter } from '@/src/components/AnimatedCounter';
import { SkeletonCard } from '@/src/components/SkeletonLoader';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const screenWidth = Dimensions.get('window').width - Spacing.lg * 2;

interface Investment {
    id: string;
    invested_amount: number;
    projected_value: number;
    created_at: string;
}

export default function GrowthScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [totalInvested, setTotalInvested] = useState(0);
    const [projectedValue, setProjectedValue] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const [profileRes, invRes] = await Promise.all([
            getProfile(user.id),
            getInvestments(user.id),
        ]);
        const p = profileRes.profile as any;
        setTotalInvested(p?.total_invested || 0);
        setProjectedValue(projectReturn(p?.total_invested || 0, 1));
        setInvestments((invRes.investments || []) as Investment[]);
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

    // Build chart data from investments (cumulative)
    const chartLabels = investments.length > 0
        ? investments.slice(-6).map((inv) => {
            const d = new Date(inv.created_at);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        }).reverse()
        : ['Now', '+1m', '+2m', '+3m', '+4m', '+5m'];

    const chartData = investments.length > 0
        ? (() => {
            const sorted = [...investments].reverse().slice(-6);
            let cumulative = 0;
            return sorted.map((inv) => {
                cumulative += inv.invested_amount;
                return cumulative;
            });
        })()
        : [0, 0, 0, 0, 0, 0];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <Text style={[styles.title, { color: colors.textPrimary }]}>Growth</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your investments grow at 6% annually
                </Text>

                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* Investment Cards */}
                        <View style={styles.cardRow}>
                            <GlassCard variant="accent" style={styles.halfCard}>
                                <Text style={[styles.cardLabel, { color: colors.primary }]}>Total Invested</Text>
                                <AnimatedCounter value={totalInvested} size="md" style={{ color: colors.primary }} />
                            </GlassCard>
                            <GlassCard style={styles.halfCard}>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Projected (1yr)</Text>
                                <AnimatedCounter value={Math.round(projectedValue)} size="md" />
                            </GlassCard>
                        </View>

                        {/* Return info */}
                        {totalInvested > 0 && (
                            <GlassCard style={styles.returnCard}>
                                <View style={styles.returnRow}>
                                    <Text style={[styles.returnLabel, { color: colors.textSecondary }]}>
                                        Estimated Return
                                    </Text>
                                    <Text style={[styles.returnValue, { color: colors.primary }]}>
                                        +₹{Math.round(projectedValue - totalInvested)}
                                    </Text>
                                </View>
                                <View style={styles.returnRow}>
                                    <Text style={[styles.returnLabel, { color: colors.textSecondary }]}>
                                        Annual Rate
                                    </Text>
                                    <Text style={[styles.returnValue, { color: colors.primary }]}>
                                        6.0%
                                    </Text>
                                </View>
                            </GlassCard>
                        )}

                        {/* Chart */}
                        <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                            Savings Growth
                        </Text>

                        {investments.length === 0 || !LineChart ? (
                            <View style={styles.emptyState}>
                                <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>📈</Text>
                                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                                    {investments.length === 0 ? 'No investments yet' : 'Chart loading...'}
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                    Save ₹100 to start your first investment.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.chartContainer}>
                                <LineChart
                                    data={{
                                        labels: chartLabels,
                                        datasets: [{ data: chartData.length > 0 ? chartData : [0] }],
                                    }}
                                    width={screenWidth}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: 'transparent',
                                        backgroundGradientFrom: colors.surface,
                                        backgroundGradientTo: colors.surface,
                                        decimalPlaces: 0,
                                        color: () => colors.primary,
                                        labelColor: () => colors.textSecondary,
                                        propsForDots: {
                                            r: '5',
                                            strokeWidth: '2',
                                            stroke: colors.primary,
                                        },
                                        propsForBackgroundLines: {
                                            stroke: colors.cardBorder,
                                        },
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </View>
                        )}

                        {/* Investment History */}
                        {investments.length > 0 && (
                            <>
                                <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                                    Investment History
                                </Text>
                                {investments.slice(0, 5).map((inv) => (
                                    <View key={inv.id} style={[styles.invItem, { borderBottomColor: colors.cardBorder }]}>
                                        <View>
                                            <Text style={[styles.invAmount, { color: colors.textPrimary }]}>
                                                ₹{inv.invested_amount}
                                            </Text>
                                            <Text style={[styles.invDate, { color: colors.textMuted }]}>
                                                {new Date(inv.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </Text>
                                        </View>
                                        <Text style={[styles.invProjected, { color: colors.primary }]}>
                                            → ₹{Math.round(inv.projected_value)}
                                        </Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
    title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.md, marginBottom: Spacing.xl },
    cardRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    halfCard: { flex: 1 },
    cardLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: Spacing.xs },
    returnCard: { marginBottom: Spacing.xl },
    returnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    returnLabel: { fontSize: FontSize.md },
    returnValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    chartTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
    chartContainer: { marginBottom: Spacing.xl },
    chart: { borderRadius: BorderRadius.lg },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
    emptySubtitle: { fontSize: FontSize.md, marginTop: Spacing.xs, textAlign: 'center' },
    invItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    invAmount: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    invDate: { fontSize: FontSize.xs, marginTop: 2 },
    invProjected: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
