/**
 * AnimatedCounter Component
 * 
 * Smoothly animates numbers from current value to target value.
 * Uses react-native-reanimated for 60fps performance.
 * Duration ~500ms.
 */

import React, { useEffect } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    useDerivedValue,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { FontSize, FontWeight } from '../theme';

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
    style?: TextStyle;
    size?: 'sm' | 'md' | 'lg' | 'hero';
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function AnimatedCounter({
    value,
    prefix = '₹',
    suffix = '',
    duration = 500,
    style,
    size = 'hero',
}: AnimatedCounterProps) {
    const { colors } = useTheme();
    const animatedValue = useSharedValue(0);
    const [displayText, setDisplayText] = React.useState(`${prefix}0${suffix}`);

    useEffect(() => {
        animatedValue.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value]);

    useAnimatedReaction(
        () => animatedValue.value,
        (current) => {
            const formatted = Math.round(current).toLocaleString('en-IN');
            runOnJS(setDisplayText)(`${prefix}${formatted}${suffix}`);
        },
        [prefix, suffix]
    );

    const sizeStyles: Record<string, TextStyle> = {
        sm: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
        md: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
        lg: { fontSize: FontSize.hero, fontWeight: FontWeight.bold },
        hero: { fontSize: FontSize.mega, fontWeight: FontWeight.heavy },
    };

    return (
        <Text style={[sizeStyles[size], { color: colors.textPrimary }, style]}>
            {displayText}
        </Text>
    );
}
