/**
 * Vault Screen — Savings Goals / Pots (Enhanced)
 * 
 * Premium features:
 * - Named goals with emoji/color picker
 * - Target deadline with countdown and daily savings suggestion
 * - Activity log per goal
 * - Celebration animation on goal completion
 * - Quick-add amounts
 * - Auto-allocate toggle for round-up savings
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/src/theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

const GOALS_KEY = '@microsave_goals';

interface Activity {
    amount: number;
    date: string;
}

interface SavingsGoal {
    id: string;
    name: string;
    emoji: string;
    target: number;
    saved: number;
    color: string;
    createdAt: string;
    deadline?: string;
    activities: Activity[];
    autoAllocate: boolean;
}

const GOAL_EMOJIS = ['🎮', '✈️', '📱', '🎓', '🏠', '🚗', '💍', '🎸', '💻', '🏖️', '👟', '🎧'];
const GOAL_COLORS = ['#8A4FFF', '#FF3CAC', '#00D4FF', '#00E38C', '#FF6B6B', '#FFB347'];

async function loadGoals(): Promise<SavingsGoal[]> {
    try {
        const val = await AsyncStorage.getItem(GOALS_KEY);
        return val ? JSON.parse(val) : [];
    } catch { return []; }
}

async function saveGoals(goals: SavingsGoal[]) {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

function getDaysLeft(deadline?: string): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
}

function getDailySavings(remaining: number, daysLeft: number | null): string | null {
    if (!daysLeft || daysLeft <= 0 || remaining <= 0) return null;
    return (remaining / daysLeft).toFixed(0);
}

// ─── Confetti Particle ──────────────────────────────────────────────────────

function ConfettiBurst() {
    const particles = useRef(
        Array.from({ length: 12 }, () => ({
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            opacity: new Animated.Value(1),
            color: ['#FF3CAC', '#8A4FFF', '#00D4FF', '#FFB347', '#00E38C', '#FF6B6B'][Math.floor(Math.random() * 6)],
            angle: Math.random() * 360,
            distance: 60 + Math.random() * 80,
        }))
    ).current;

    useEffect(() => {
        particles.forEach(p => {
            const rad = (p.angle * Math.PI) / 180;
            Animated.parallel([
                Animated.timing(p.x, { toValue: Math.cos(rad) * p.distance, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(p.y, { toValue: Math.sin(rad) * p.distance - 30, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(p.opacity, { toValue: 0, duration: 800, delay: 400, useNativeDriver: true }),
            ]).start();
        });
    }, []);

    return (
        <View style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }}>
            {particles.map((p, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: p.color,
                        transform: [{ translateX: p.x }, { translateY: p.y }],
                        opacity: p.opacity,
                    }}
                />
            ))}
        </View>
    );
}

// ─── Goal Card ──────────────────────────────────────────────────────────────

function GoalCard({ goal, colors, onAddMoney, onDelete, onToggleAuto }: {
    goal: SavingsGoal; colors: any;
    onAddMoney: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleAuto: (id: string) => void;
}) {
    const activities = goal.activities || [];
    const progress = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
    const remaining = Math.max(goal.target - goal.saved, 0);
    const daysLeft = getDaysLeft(goal.deadline);
    const dailySave = getDailySavings(remaining, daysLeft);
    const isComplete = progress >= 1;
    const [showLog, setShowLog] = useState(false);

    // Animated progress
    const progressAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['2%', '100%'],
    });

    return (
        <View style={[cardStyles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            {isComplete && <ConfettiBurst />}

            {/* Header */}
            <View style={cardStyles.header}>
                <View style={[cardStyles.emojiCircle, { backgroundColor: goal.color + '20' }]}>
                    <Text style={{ fontSize: 24 }}>{goal.emoji}</Text>
                </View>
                <View style={cardStyles.info}>
                    <Text style={[cardStyles.name, { color: colors.textPrimary }]}>{goal.name}</Text>
                    <Text style={[cardStyles.remaining, { color: isComplete ? '#00E38C' : colors.textSecondary }]}>
                        {isComplete ? '🎉 Goal reached!' : `₹${remaining.toLocaleString('en-IN')} to go`}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => onDelete(goal.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={[cardStyles.progressBg, { backgroundColor: colors.cardBorder }]}>
                <Animated.View style={[cardStyles.progressFillAnimated, { width: progressWidth, backgroundColor: goal.color }]} />
            </View>

            {/* Amount + Percentage */}
            <View style={cardStyles.amountRow}>
                <Text style={[cardStyles.saved, { color: goal.color }]}>
                    ₹{goal.saved.toLocaleString('en-IN')}
                </Text>
                <Text style={[cardStyles.target, { color: colors.textMuted }]}>
                    of ₹{goal.target.toLocaleString('en-IN')}
                </Text>
                <View style={[cardStyles.percentBadge, { backgroundColor: goal.color + '20' }]}>
                    <Text style={[cardStyles.percentText, { color: goal.color }]}>{Math.round(progress * 100)}%</Text>
                </View>
            </View>

            {/* Deadline + Daily Savings Tip */}
            {daysLeft !== null && (
                <View style={[cardStyles.tipRow, { backgroundColor: colors.background }]}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[cardStyles.tipText, { color: colors.textSecondary }]}>
                        {daysLeft === 0
                            ? 'Deadline is today!'
                            : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                        {dailySave ? `  •  Save ₹${dailySave}/day` : ''}
                    </Text>
                </View>
            )}

            {/* Auto-allocate toggle */}
            <TouchableOpacity
                style={[cardStyles.autoRow, { backgroundColor: goal.autoAllocate ? goal.color + '15' : colors.background }]}
                onPress={() => onToggleAuto(goal.id)}
            >
                <Ionicons
                    name={goal.autoAllocate ? 'flash' : 'flash-outline'}
                    size={16}
                    color={goal.autoAllocate ? goal.color : colors.textMuted}
                />
                <Text style={[cardStyles.autoText, { color: goal.autoAllocate ? goal.color : colors.textMuted }]}>
                    {goal.autoAllocate ? 'Auto-allocating round-ups' : 'Auto-allocate round-ups'}
                </Text>
            </TouchableOpacity>

            {/* Action row */}
            <View style={cardStyles.actionRow}>
                {!isComplete && (
                    <TouchableOpacity
                        style={[cardStyles.addBtn, { backgroundColor: goal.color }]}
                        onPress={() => onAddMoney(goal.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={cardStyles.addBtnText}>Add Money</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[cardStyles.logBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => setShowLog(!showLog)}
                >
                    <Ionicons name={showLog ? 'chevron-up' : 'list-outline'} size={16} color={colors.textSecondary} />
                    <Text style={[cardStyles.logBtnText, { color: colors.textSecondary }]}>
                        {showLog ? 'Hide' : `${activities.length} entries`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Activity Log */}
            {showLog && activities.length > 0 && (
                <View style={[cardStyles.logContainer, { borderTopColor: colors.cardBorder }]}>
                    {activities.slice(-5).reverse().map((a, i) => (
                        <View key={i} style={cardStyles.logItem}>
                            <Text style={[cardStyles.logAmount, { color: '#00E38C' }]}>+₹{a.amount}</Text>
                            <Text style={[cardStyles.logDate, { color: colors.textMuted }]}>
                                {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const cardStyles = StyleSheet.create({
    card: { borderRadius: BorderRadius.xxl, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    emojiCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    info: { flex: 1 },
    name: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    remaining: { fontSize: FontSize.sm, marginTop: 2 },
    progressBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: Spacing.sm },
    progressFillAnimated: { height: '100%', borderRadius: 5 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: Spacing.sm },
    saved: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    target: { fontSize: FontSize.sm },
    percentBadge: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    percentText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
    tipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
    tipText: { fontSize: FontSize.sm },
    autoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
    autoText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
    actionRow: { flexDirection: 'row', gap: 10 },
    addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: BorderRadius.lg, gap: 6 },
    addBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
    logBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: BorderRadius.lg, borderWidth: 1 },
    logBtnText: { fontSize: FontSize.sm },
    logContainer: { borderTopWidth: 1, marginTop: Spacing.md, paddingTop: Spacing.sm },
    logItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    logAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    logDate: { fontSize: FontSize.sm },
});

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function VaultScreen() {
    const { colors } = useTheme();
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [addMoneyGoalId, setAddMoneyGoalId] = useState<string | null>(null);
    const [addAmount, setAddAmount] = useState('');

    // New goal form
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadGoals().then(setGoals);
        }, [])
    );

    const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const overallProgress = totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0;

    const handleCreateGoal = async () => {
        const target = parseFloat(newTarget);
        if (!newName.trim()) { Alert.alert('Error', 'Enter a goal name'); return; }
        if (!target || target <= 0) { Alert.alert('Error', 'Enter a valid target'); return; }

        // Parse deadline
        let deadline: string | undefined;
        if (newDeadline.trim()) {
            const days = parseInt(newDeadline);
            if (days > 0) {
                const d = new Date();
                d.setDate(d.getDate() + days);
                deadline = d.toISOString();
            }
        }

        const newGoal: SavingsGoal = {
            id: Date.now().toString(),
            name: newName.trim(),
            emoji: GOAL_EMOJIS[selectedEmoji],
            target,
            saved: 0,
            color: GOAL_COLORS[selectedColor],
            createdAt: new Date().toISOString(),
            deadline,
            activities: [],
            autoAllocate: false,
        };

        const updated = [...goals, newGoal];
        setGoals(updated);
        await saveGoals(updated);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowCreate(false);
        setNewName(''); setNewTarget(''); setNewDeadline('');
        setSelectedEmoji(0); setSelectedColor(0);
    };

    const handleAddMoney = async () => {
        const amt = parseFloat(addAmount);
        if (!amt || amt <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }

        const updated = goals.map(g => {
            if (g.id === addMoneyGoalId) {
                const newSaved = Math.min(g.saved + amt, g.target);
                return {
                    ...g,
                    saved: newSaved,
                    activities: [...g.activities, { amount: amt, date: new Date().toISOString() }],
                };
            }
            return g;
        });

        setGoals(updated);
        await saveGoals(updated);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAddMoneyGoalId(null);
        setAddAmount('');
    };

    const handleToggleAuto = async (id: string) => {
        const updated = goals.map(g => g.id === id ? { ...g, autoAllocate: !g.autoAllocate } : g);
        setGoals(updated);
        await saveGoals(updated);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleDeleteGoal = (id: string) => {
        Alert.alert('Delete Goal', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const updated = goals.filter(g => g.id !== id);
                    setGoals(updated);
                    await saveGoals(updated);
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Vault</Text>
                <TouchableOpacity
                    style={[styles.createBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setShowCreate(true)}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createBtnText}>New Goal</Text>
                </TouchableOpacity>
            </View>

            {/* Total Saved Banner */}
            <LinearGradient
                colors={['#8A4FFF', '#6C63FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.totalCard}
            >
                <Text style={styles.totalLabel}>TOTAL IN VAULT</Text>
                <Text style={styles.totalAmount}>₹{totalSaved.toLocaleString('en-IN')}</Text>
                <View style={styles.totalMeta}>
                    <Text style={styles.totalSub}>{goals.length} goal{goals.length !== 1 ? 's' : ''}</Text>
                    <Text style={styles.totalSub}>•</Text>
                    <Text style={styles.totalSub}>{Math.round(overallProgress * 100)}% overall</Text>
                </View>
                {/* Mini overall progress bar */}
                <View style={styles.totalProgressBg}>
                    <View style={[styles.totalProgressFill, { width: `${Math.max(overallProgress * 100, 2)}%` }]} />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {goals.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>🎯</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No goals yet</Text>
                        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                            Create a savings goal like "PS5 Fund"{'\n'}or "Trip to Goa" to get started!
                        </Text>
                    </View>
                ) : (
                    goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            colors={colors}
                            onAddMoney={setAddMoneyGoalId}
                            onDelete={handleDeleteGoal}
                            onToggleAuto={handleToggleAuto}
                        />
                    ))
                )}
            </ScrollView>

            {/* ─── Create Goal Modal ─── */}
            <Modal visible={showCreate} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Savings Goal</Text>
                            <TouchableOpacity onPress={() => setShowCreate(false)}>
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Goal name (e.g. PS5 Fund)"
                            placeholderTextColor={colors.textMuted}
                        />

                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.modalInput, styles.halfInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                value={newTarget}
                                onChangeText={setNewTarget}
                                placeholder="Target (₹)"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.modalInput, styles.halfInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                                value={newDeadline}
                                onChangeText={setNewDeadline}
                                placeholder="Days (e.g. 30)"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Emoji Picker */}
                        <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Choose Icon</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                            {GOAL_EMOJIS.map((e, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.emojiOption, selectedEmoji === i && { borderColor: colors.primary, borderWidth: 2 }]}
                                    onPress={() => setSelectedEmoji(i)}
                                >
                                    <Text style={{ fontSize: 24 }}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Color Picker */}
                        <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Choose Color</Text>
                        <View style={styles.colorRow}>
                            {GOAL_COLORS.map((c, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.colorOption, { backgroundColor: c }, selectedColor === i && styles.colorSelected]}
                                    onPress={() => setSelectedColor(i)}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                            onPress={handleCreateGoal}
                        >
                            <Text style={styles.modalBtnText}>Create Goal 🎯</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ─── Add Money Modal ─── */}
            <Modal visible={!!addMoneyGoalId} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Money</Text>
                            <TouchableOpacity onPress={() => { setAddMoneyGoalId(null); setAddAmount(''); }}>
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.addGoalName, { color: colors.textSecondary }]}>
                            {goals.find(g => g.id === addMoneyGoalId)?.emoji}{' '}
                            {goals.find(g => g.id === addMoneyGoalId)?.name}
                        </Text>

                        <TextInput
                            style={[styles.modalInput, { color: colors.textPrimary, borderColor: colors.cardBorder }]}
                            value={addAmount}
                            onChangeText={setAddAmount}
                            placeholder="Amount to add (₹)"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            autoFocus
                        />

                        {/* Quick amount buttons */}
                        <View style={styles.quickAmounts}>
                            {[50, 100, 200, 500, 1000].map(amt => (
                                <TouchableOpacity
                                    key={amt}
                                    style={[styles.quickBtn, { borderColor: colors.primary }]}
                                    onPress={() => setAddAmount(amt.toString())}
                                >
                                    <Text style={[styles.quickBtnText, { color: colors.primary }]}>₹{amt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                            onPress={handleAddMoney}
                        >
                            <Text style={styles.modalBtnText}>Add to Goal 💰</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: BorderRadius.lg,
        gap: 4,
    },
    createBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
    totalCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xxl,
        padding: Spacing.lg,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1 },
    totalAmount: { color: '#fff', fontSize: 36, fontWeight: FontWeight.heavy, marginVertical: 4 },
    totalMeta: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
    totalSub: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
    totalProgressBg: { width: '80%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
    totalProgressFill: { height: '100%', borderRadius: 3, backgroundColor: '#fff' },
    scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
    empty: { alignItems: 'center', paddingTop: Spacing.xxl },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
    emptySub: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },

    // Modals
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
    modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    modalInput: { borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: FontSize.md, marginBottom: Spacing.md },
    inputRow: { flexDirection: 'row', gap: 10 },
    halfInput: { flex: 1 },
    pickerLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: Spacing.sm, marginTop: Spacing.xs },
    pickerRow: { marginBottom: Spacing.md },
    emojiOption: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8, backgroundColor: 'rgba(138,79,255,0.08)' },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
    colorOption: { width: 36, height: 36, borderRadius: 18 },
    colorSelected: { borderWidth: 3, borderColor: '#fff', transform: [{ scale: 1.15 }] },
    modalBtn: { height: 52, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
    modalBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
    addGoalName: { fontSize: FontSize.lg, marginBottom: Spacing.md, textAlign: 'center' },
    quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg, justifyContent: 'center', flexWrap: 'wrap' },
    quickBtn: { borderWidth: 1.5, borderRadius: BorderRadius.md, paddingVertical: 8, paddingHorizontal: 14 },
    quickBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
