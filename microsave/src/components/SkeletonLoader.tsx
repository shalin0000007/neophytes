/**
 * SkeletonLoader Component
 * 
 * Shimmer placeholder animation while data is loading.
 * Prevents blank screens per frontend.md spec.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing } from '../theme';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonLoader({
    width = '100%',
    height = 20,
    borderRadius = BorderRadius.md,
    style,
}: SkeletonLoaderProps) {
    const { colors } = useTheme();
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            -1, // infinite
            true // reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
    }));

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: colors.cardBg,
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

// Pre-built skeleton layouts

export function SkeletonCard({ style }: { style?: ViewStyle }) {
    return (
        <View style={[skeletonStyles.card, style]}>
            <SkeletonLoader width="40%" height={14} />
            <SkeletonLoader width="60%" height={32} style={{ marginTop: Spacing.sm }} />
        </View>
    );
}

export function SkeletonTransaction({ style }: { style?: ViewStyle }) {
    return (
        <View style={[skeletonStyles.transaction, style]}>
            <View style={skeletonStyles.transLeft}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <View style={{ marginLeft: Spacing.sm }}>
                    <SkeletonLoader width={120} height={14} />
                    <SkeletonLoader width={60} height={10} style={{ marginTop: 4 }} />
                </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <SkeletonLoader width={70} height={14} />
                <SkeletonLoader width={50} height={10} style={{ marginTop: 4 }} />
            </View>
        </View>
    );
}

const skeletonStyles = StyleSheet.create({
    card: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xxl,
        marginBottom: Spacing.md,
    },
    transaction: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    transLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
