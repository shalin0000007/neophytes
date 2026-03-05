/**
 * TransactionItem Component
 * 
 * Displays a single transaction in a list:
 * - Amount (bold)
 * - Saved amount (green accent)
 * - Description
 * - Timestamp
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FontSize, FontWeight, Spacing, BorderRadius } from '../theme';

interface TransactionItemProps {
    amount: number;
    savedAmount: number;
    description: string;
    createdAt: string;
}

export function TransactionItem({ amount, savedAmount, description, createdAt }: TransactionItemProps) {
    const { colors } = useTheme();

    const timeAgo = formatTimeAgo(createdAt);

    return (
        <View style={[styles.container, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.left}>
                <View style={[styles.iconDot, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.iconText, { color: colors.primary }]}>₹</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.description, { color: colors.textPrimary }]} numberOfLines={1}>
                        {description || 'Payment'}
                    </Text>
                    <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo}</Text>
                </View>
            </View>
            <View style={styles.right}>
                <Text style={[styles.amount, { color: colors.textPrimary }]}>
                    -₹{amount.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.saved, { color: colors.primary }]}>
                    +₹{savedAmount} saved
                </Text>
            </View>
        </View>
    );
}

function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconDot: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    iconText: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.bold,
    },
    info: {
        flex: 1,
    },
    description: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
    },
    time: {
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
    },
    saved: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
        marginTop: 2,
    },
});
