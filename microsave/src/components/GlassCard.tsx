/**
 * GlassCard Component
 * 
 * Glassmorphism-style card with semi-transparent background,
 * rounded corners (24px), and soft shadow.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'accent' | 'elevated';
}

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
    const { colors } = useTheme();

    const variantStyles: Record<string, ViewStyle> = {
        default: {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
        },
        accent: {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
        },
        elevated: {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            ...Shadows.md,
        },
    };

    return (
        <View style={[styles.card, variantStyles[variant], style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.xxl,
        borderWidth: 1,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
});
