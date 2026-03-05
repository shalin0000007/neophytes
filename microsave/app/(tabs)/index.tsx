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
    Alert,
    Linking,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import { getProfile, getRecentTransactions, processTransaction, clearAllTransactions } from '@/src/services/savingsEngine';
import { simulateSms } from '@/src/services/smsParser';
import { scanRecentSms, startSmsPolling, stopSmsPolling, resetProcessedIds } from '@/src/services/smsReader';
import { getSavedAvatarId, getAvatarById } from '@/src/services/avatarService';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '@/src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
    id: string;
    amount: number;
    saved_amount: number;
    description: string;
    created_at: string;
}

// ─── Skeleton Shimmer ────────────────────────────────────────────────────────
function SkeletonPulse({ width: w, height: h, style }: { width: number | string; height: number; style?: any }) {
    const pulse = React.useRef(new Animated.Value(0.3)).current;
    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return <Animated.View style={[{ width: w as any, height: h, borderRadius: 8, backgroundColor: 'rgba(138,79,255,0.2)', opacity: pulse }, style]} />;
}

// ─── Animated Press Button ───────────────────────────────────────────────────
function PressableScale({ children, onPress, style }: { children: React.ReactNode; onPress: () => void; style?: any }) {
    const scale = React.useRef(new Animated.Value(1)).current;
    const onPressIn = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50 }).start();
    const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3, tension: 100 }).start();
    return (
        <TouchableOpacity activeOpacity={1} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
            <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
        </TouchableOpacity>
    );
}

export default function DashboardScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const [totalSaved, setTotalSaved] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [goalAmount, setGoalAmount] = useState(10000);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [simLoading, setSimLoading] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<{ amount: number; merchant: string } | null>(null);
    const [avatarId, setAvatarId] = useState('1');
    const [hideBalance, setHideBalance] = useState(false);
    const [balanceRevealed, setBalanceRevealed] = useState(false);

    // Animated count-up
    const displaySaved = React.useRef(new Animated.Value(0)).current;
    const [displayAmount, setDisplayAmount] = useState(0);

    // Staggered transaction animations
    const txnAnims = React.useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;

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

    // Reload avatar whenever this tab is focused
    useFocusEffect(
        useCallback(() => {
            getSavedAvatarId().then(setAvatarId);
            // Load hide balance setting
            AsyncStorage.getItem('@microsave_security').then(val => {
                if (val) {
                    const s = JSON.parse(val);
                    setHideBalance(!!s.hideBalance);
                    setBalanceRevealed(false);
                }
            });
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRefreshing(false);
    };

    // Animate savings count-up when totalSaved changes
    React.useEffect(() => {
        if (totalSaved <= 0) { setDisplayAmount(0); return; }
        const duration = 1200;
        const startVal = displayAmount;
        const startTime = Date.now();
        const animate = () => {
            const t = Math.min((Date.now() - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplayAmount(Math.round(startVal + (totalSaved - startVal) * eased));
            if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [totalSaved]);

    // Stagger transaction slide-in
    React.useEffect(() => {
        if (transactions.length > 0) {
            txnAnims.forEach(a => a.setValue(0));
            Animated.stagger(80,
                txnAnims.slice(0, Math.min(transactions.length, 5)).map(a =>
                    Animated.timing(a, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true })
                )
            ).start();
        }
    }, [transactions]);

    const progress = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0;
    const userName = (user as any)?.user_metadata?.name || 'Student';

    // Simulate receiving a UPI SMS (demo mode)
    const handleSimulateSms = useCallback(async () => {
        if (!user || simLoading) return;
        setSimLoading(true);
        const parsed = simulateSms();
        if (!parsed) {
            Alert.alert('Demo', 'Could not parse simulated SMS');
            setSimLoading(false);
            return;
        }
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const { error } = await processTransaction(user.id, parsed.amount, parsed.merchant);
        if (!error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const savings = Math.ceil(parsed.amount / 10) * 10 - parsed.amount || 1;
            setLastSaved({ amount: savings, merchant: parsed.merchant });
            setTimeout(() => setLastSaved(null), 4000);
            await fetchData();
        } else {
            Alert.alert('Error', error);
        }
        setSimLoading(false);
    }, [user, simLoading, fetchData]);

    // Scan real SMS inbox (clears old data first for correct dates)
    const handleScanSms = useCallback(async () => {
        if (!user || scanLoading) return;
        setScanLoading(true);
        const count = await scanRecentSms(user.id, (merchant, amount, saved) => {
            setLastSaved({ amount: saved, merchant });
            setTimeout(() => setLastSaved(null), 4000);
        });
        if (count > 0) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await fetchData();
            Alert.alert('SMS Scan', `Found ${count} new UPI transaction${count > 1 ? 's' : ''}!`);
        } else if (count === 0) {
            Alert.alert('SMS Scan', 'No new UPI transactions found in your recent messages.');
        }
        // count === -1 means scan couldn't run (alert already shown by smsReader)
        setScanLoading(false);
    }, [user, scanLoading, fetchData]);

    // Start SMS polling on mount (production mode)
    useEffect(() => {
        if (!user) return;
        startSmsPolling(user.id, (merchant, _amount, saved) => {
            setLastSaved({ amount: saved, merchant });
            setTimeout(() => setLastSaved(null), 4000);
            fetchData();
        });
        return () => stopSmsPolling();
    }, [user]);

    // Quick action handlers
    const openUPIAppPicker = async () => {
        const upiApps = [
            { name: 'PhonePe', url: 'phonepe://pay' },
            { name: 'Google Pay', url: 'tez://upi/pay' },
            { name: 'Paytm', url: 'paytmmp://pay' },
        ];

        // Find which apps are installed
        const available: { name: string; url: string }[] = [];
        for (const app of upiApps) {
            try {
                const can = await Linking.canOpenURL(app.url);
                if (can) available.push(app);
            } catch { /* ignore */ }
        }

        if (available.length === 0) {
            Alert.alert('No UPI App Found', 'Please install PhonePe, Google Pay, or Paytm to make payments.');
            return;
        }

        if (available.length === 1) {
            Linking.openURL(available[0].url);
            return;
        }

        Alert.alert(
            'Pay with',
            'Select a UPI app to open',
            [
                ...available.map(app => ({
                    text: app.name,
                    onPress: () => Linking.openURL(app.url),
                })),
                { text: 'Cancel', style: 'cancel' as const },
            ]
        );
    };

    const handleQuickAction = (label: string) => {
        switch (label) {
            case 'Send':
                openUPIAppPicker();
                break;
            case 'Receive':
                router.push('/receive');
                break;
            case 'Save':
                router.push('/(tabs)/vault');
                break;
            case 'Stats':
                router.push('/stats');
                break;
        }
    };

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
                    <TouchableOpacity
                        style={[styles.avatar, { backgroundColor: getAvatarById(avatarId).bg }]}
                        onPress={() => router.navigate('/(tabs)/profile')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.avatarEmoji}>{getAvatarById(avatarId).emoji}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dashboard</Text>
                    <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    /* Skeleton Loading State */
                    <View style={[styles.savingsCard, { backgroundColor: 'rgba(138,79,255,0.15)' }]}>
                        <SkeletonPulse width={100} height={14} style={{ marginBottom: 12 }} />
                        <SkeletonPulse width={180} height={36} style={{ marginBottom: 16 }} />
                        <SkeletonPulse width="100%" height={8} />
                    </View>
                ) : (
                    /* Savings Card — Glassmorphism */
                    <LinearGradient
                        colors={['rgba(138,79,255,0.85)', 'rgba(108,99,255,0.85)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.savingsCard}
                    >
                        {/* Glass overlay */}
                        <View style={styles.glassOverlay} />
                        <Text style={styles.savingsLabel}>Total Savings</Text>
                        <TouchableOpacity onPress={() => hideBalance && setBalanceRevealed(!balanceRevealed)} activeOpacity={hideBalance ? 0.6 : 1}>
                            <Text style={styles.savingsAmount}>
                                {hideBalance && !balanceRevealed ? '●●●●●●' : `₹${displayAmount.toLocaleString('en-IN')}`}
                            </Text>
                        </TouchableOpacity>
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
                )}

                {/* Simulate SMS Demo Button */}
                <TouchableOpacity
                    onPress={handleSimulateSms}
                    disabled={simLoading}
                    activeOpacity={0.85}
                    style={{ marginBottom: Spacing.lg }}
                >
                    <LinearGradient
                        colors={['#1A1730', '#251D40']}
                        style={[styles.demoCard, { borderColor: colors.primary, opacity: simLoading ? 0.6 : 1 }]}
                    >
                        <View style={[styles.demoIconWrap, { backgroundColor: colors.primaryLight }]}>
                            <Text style={{ fontSize: 22 }}>📩</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.demoTitle, { color: colors.textPrimary }]}>
                                {simLoading ? 'Processing...' : '🚀 Simulate UPI SMS'}
                            </Text>
                            <Text style={[styles.demoSub, { color: colors.textSecondary }]}>
                                {lastSaved
                                    ? `✅ Saved ₹${lastSaved.amount.toFixed(2)} from ${lastSaved.merchant}!`
                                    : 'Tap to auto-detect a fake bank SMS'}
                            </Text>
                        </View>
                        <Ionicons name="flash" size={20} color={colors.primary} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Scan Real SMS Button (long-press = clear & rescan) */}
                <TouchableOpacity
                    onPress={handleScanSms}
                    onLongPress={async () => {
                        if (!user) return;
                        Alert.alert('Clear & Rescan', 'This will delete all old transactions and re-scan your SMS with correct dates.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Clear & Rescan', style: 'destructive', onPress: async () => {
                                    setScanLoading(true);
                                    await clearAllTransactions(user.id);
                                    await resetProcessedIds();
                                    const count = await scanRecentSms(user.id);
                                    await fetchData();
                                    setScanLoading(false);
                                    Alert.alert('Done', `Rescanned: found ${count} transactions with correct dates!`);
                                }
                            },
                        ]);
                    }}
                    disabled={scanLoading}
                    activeOpacity={0.85}
                    style={{ marginBottom: Spacing.lg }}
                >
                    <LinearGradient
                        colors={['#1A1730', '#251D40']}
                        style={[styles.demoCard, { borderColor: colors.cyan, opacity: scanLoading ? 0.6 : 1 }]}
                    >
                        <View style={[styles.demoIconWrap, { backgroundColor: 'rgba(0,212,255,0.15)' }]}>
                            <Text style={{ fontSize: 22 }}>📨</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.demoTitle, { color: colors.textPrimary }]}>
                                {scanLoading ? 'Scanning...' : '📱 Scan Real SMS'}
                            </Text>
                            <Text style={[styles.demoSub, { color: colors.textSecondary }]}>
                                Read your inbox for UPI transaction messages
                            </Text>
                        </View>
                        <Ionicons name="scan" size={20} color={colors.cyan} />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Quick Actions — with press animation */}
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
                {loading ? (
                    <View style={styles.actionsRow}>
                        {[0, 1, 2, 3].map(i => <SkeletonPulse key={i} width={56} height={56} style={{ borderRadius: 28 }} />)}
                    </View>
                ) : (
                    <View style={styles.actionsRow}>
                        {quickActions.map((action, i) => (
                            <PressableScale key={i} style={styles.actionItem} onPress={() => handleQuickAction(action.label)}>
                                <View style={[styles.actionIcon, styles.glassAction, { backgroundColor: 'rgba(138,79,255,0.12)', borderColor: 'rgba(138,79,255,0.25)' }]}>
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
                            </PressableScale>
                        ))}
                    </View>
                )}

                {/* Recent Activity — with staggered slide-in */}
                <View style={styles.activityHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => router.push('/transactions')}>
                        <Text style={[styles.seeAll, { color: colors.cyan }]}>See All</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={{ gap: 12 }}>
                        {[0, 1, 2].map(i => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <SkeletonPulse width={46} height={46} style={{ borderRadius: 14 }} />
                                <View style={{ flex: 1, gap: 6 }}>
                                    <SkeletonPulse width="70%" height={14} />
                                    <SkeletonPulse width="40%" height={10} />
                                </View>
                                <SkeletonPulse width={60} height={14} />
                            </View>
                        ))}
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 42, marginBottom: Spacing.md }}>📊</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No activity yet</Text>
                        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                            Make your first payment to start saving!
                        </Text>
                    </View>
                ) : (
                    transactions.slice(0, 5).map((txn, idx) => {
                        const { icon, bg } = getTxnIcon(txn.description || '');
                        const isPositive = txn.saved_amount > txn.amount;
                        const anim = txnAnims[idx];
                        return (
                            <Animated.View
                                key={txn.id}
                                style={[styles.txnItem, {
                                    borderBottomColor: colors.cardBorder,
                                    backgroundColor: 'rgba(138,79,255,0.04)',
                                    borderRadius: 12,
                                    marginBottom: 4,
                                    paddingHorizontal: 12,
                                    opacity: anim,
                                    transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
                                }]}
                            >
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
                            </Animated.View>
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

    // Savings Card — Glassmorphism
    savingsCard: {
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
        ...Shadows.lg,
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: BorderRadius.xxl,
    },
    savingsLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.medium },
    savingsAmount: { fontSize: FontSize.hero, color: '#FFFFFF', fontWeight: FontWeight.heavy, marginVertical: Spacing.sm },
    goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    goalText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
    goalPercent: { fontSize: FontSize.sm, color: '#FFFFFF', fontWeight: FontWeight.bold },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
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
    glassAction: {
        borderWidth: 1,
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

    // Demo SMS button
    demoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.md,
        gap: Spacing.md,
    },
    demoIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    demoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
    demoSub: { fontSize: FontSize.xs, marginTop: 2 },
});
