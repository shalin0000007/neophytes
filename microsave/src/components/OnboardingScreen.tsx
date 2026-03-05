/**
 * Onboarding Screen — 3-slide intro for first-time users
 * 
 * Shows only once (persisted via AsyncStorage).
 * Explains: Auto Round-Ups → Smart Insights → Savings Goals
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_KEY = '@microsave_onboarded';

const SLIDES = [
    {
        emoji: '💰',
        title: 'Auto Round-Up Savings',
        subtitle: 'Every UPI payment saves you money',
        description: 'Spend ₹47 on coffee? We automatically save ₹3 by rounding up to ₹50. It adds up fast — no effort needed!',
        gradient: ['#8A4FFF', '#6C63FF'] as [string, string],
    },
    {
        emoji: '📊',
        title: 'Smart Spending Insights',
        subtitle: 'Know where your money goes',
        description: 'AI-powered analysis categorizes your spending into Food, Shopping, Transport & more. Get personalized suggestions to save even more.',
        gradient: ['#00D4FF', '#6C63FF'] as [string, string],
    },
    {
        emoji: '🎯',
        title: 'Savings Goals',
        subtitle: 'Save for what matters to you',
        description: 'Create goals like "PS5 Fund" or "Trip to Goa" with deadlines, progress tracking, and celebrations when you hit your target! 🎉',
        gradient: ['#FF3CAC', '#8A4FFF'] as [string, string],
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            onComplete();
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        onComplete();
    };

    const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
        <LinearGradient
            colors={item.gradient}
            style={styles.slide}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Glass card */}
            <View style={styles.glassCard}>
                <Text style={styles.emoji}>{item.emoji}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            <View style={styles.descCard}>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </LinearGradient>
    );

    const isLast = currentIndex === SLIDES.length - 1;

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(idx);
                }}
                scrollEventThrottle={16}
            />

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
                {/* Skip */}
                <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                    <Text style={styles.skipText}>{isLast ? '' : 'Skip'}</Text>
                </TouchableOpacity>

                {/* Dots */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i}
                                style={[styles.dot, { width: dotWidth, opacity }]}
                            />
                        );
                    })}
                </View>

                {/* Next / Get Started */}
                <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                    <LinearGradient
                        colors={['#8A4FFF', '#6C63FF']}
                        style={styles.nextBtnGradient}
                    >
                        <Text style={styles.nextBtnText}>
                            {isLast ? 'Get Started' : 'Next'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0B1A',
    },
    slide: {
        width,
        height,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 120,
    },
    glassCard: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    emoji: {
        fontSize: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 24,
    },
    descCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    description: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    skipBtn: {
        width: 80,
    },
    skipText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    nextBtn: {
        width: 120,
    },
    nextBtnGradient: {
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    nextBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
