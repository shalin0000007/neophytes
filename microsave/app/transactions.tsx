/**
 * Full Transaction History Screen
 * 
 * Shows all transactions with proper dates, amounts, and savings.
 * Accessible via "See All" on Dashboard.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getRecentTransactions } from '@/src/services/savingsEngine';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

interface Transaction {
    id: string;
    amount: number;
    saved_amount: number;
    description: string;
    created_at: string;
}

export default function TransactionHistoryScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const { transactions: txns } = await getRecentTransactions(user.id, 100);
        setTransactions((txns || []) as Transaction[]);
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const getTxnIcon = (desc: string) => {
        const d = desc.toLowerCase();
        if (d.includes('coffee') || d.includes('starbucks') || d.includes('cafe')) return { icon: '☕', bg: 'rgba(0,212,255,0.15)' };
        if (d.includes('food') || d.includes('restaurant') || d.includes('swiggy') || d.includes('zomato')) return { icon: '🍔', bg: 'rgba(255,107,157,0.15)' };
        if (d.includes('amazon') || d.includes('flipkart') || d.includes('shopping')) return { icon: '🛍️', bg: 'rgba(138,79,255,0.15)' };
        if (d.includes('ola') || d.includes('uber') || d.includes('transport')) return { icon: '🚌', bg: 'rgba(255,179,71,0.15)' };
        if (d.includes('netflix') || d.includes('spotify') || d.includes('subscription')) return { icon: '🎬', bg: 'rgba(255,60,172,0.15)' };
        if (d.includes('cboi') || d.includes('sbi') || d.includes('hdfc') || d.includes('icici')) return { icon: '🏦', bg: 'rgba(0,227,140,0.15)' };
        return { icon: '💳', bg: 'rgba(138,79,255,0.15)' };
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const { icon, bg } = getTxnIcon(item.description || '');
        const date = new Date(item.created_at);
        const savings = item.saved_amount || 0;

        return (
            <View style={[styles.txnItem, { borderBottomColor: colors.cardBorder }]}>
                <View style={[styles.txnIcon, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 22 }}>{icon}</Text>
                </View>
                <View style={styles.txnInfo}>
                    <Text style={[styles.txnName, { color: colors.textPrimary }]}>
                        {item.description || 'UPI Payment'}
                    </Text>
                    <Text style={[styles.txnDate, { color: colors.textMuted }]}>
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {'  •  '}
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={styles.txnAmounts}>
                    <Text style={[styles.txnAmount, {
                        color: item.description?.startsWith('[CR]') ? colors.success : colors.textPrimary
                    }]}>
                        {item.description?.startsWith('[CR]') ? '+' : '-'}₹{item.amount.toFixed(2)}
                    </Text>
                    {!item.description?.startsWith('[CR]') && (
                        <Text style={[styles.txnSaved, { color: colors.success }]}>
                            +₹{savings.toFixed(2)} saved
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Transaction History
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Transactions</Text>
                    <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{transactions.length}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Spent</Text>
                    <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                        ₹{transactions.filter(t => !t.description?.startsWith('[CR]')).reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')}
                    </Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Saved</Text>
                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                        ₹{transactions.reduce((s, t) => s + (t.saved_amount || 0), 0).toLocaleString('en-IN')}
                    </Text>
                </View>
            </View>

            {/* Transaction List */}
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 42, marginBottom: Spacing.md }}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No transactions yet</Text>
                        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                            Scan SMS or make a payment to get started!
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: FontSize.xs, marginBottom: 4 },
    summaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    summaryDivider: { width: 1, marginVertical: 4 },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    txnItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 0.5 },
    txnIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    txnInfo: { flex: 1 },
    txnName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
    txnDate: { fontSize: FontSize.xs, marginTop: 2 },
    txnAmounts: { alignItems: 'flex-end' },
    txnAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    txnSaved: { fontSize: FontSize.xs, marginTop: 2 },
    empty: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
    emptySub: { fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
});
