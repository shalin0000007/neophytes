/**
 * Personal Info Screen
 * - Edit display name
 * - Pick from 10 animated avatars (persisted via AsyncStorage)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Animated, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/src/theme/ThemeContext';
import { useAuth } from '@/src/services/AuthContext';
import {
    AVATARS, AvatarOption,
    getSavedAvatarId, setSavedAvatarId,
    getSavedDisplayName, setSavedDisplayName,
    getAvatarById,
} from '@/src/services/avatarService';
import { FontSize, FontWeight, Spacing, BorderRadius } from '@/src/theme';

// ─── Animated Avatar Card ───────────────────────────────────────────────────
function AvatarCard({
    avatar, isSelected, onPress,
}: {
    avatar: AvatarOption;
    isSelected: boolean;
    onPress: (id: string) => void;
}) {
    const anim = useRef(new Animated.Value(1)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        if (isSelected) {
            loopRef.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
                ])
            );
            loopRef.current.start();
        } else {
            loopRef.current?.stop();
            anim.setValue(1);
        }
        return () => { loopRef.current?.stop(); };
    }, [isSelected]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.spring(anim, { toValue: 0.82, useNativeDriver: true }),
            Animated.spring(anim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        onPress(avatar.id);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.avatarCard}>
            <Animated.View style={{ transform: [{ scale: anim }] }}>
                <View style={[
                    styles.avatarCircle,
                    { backgroundColor: avatar.bg },
                    isSelected && styles.avatarSelected,
                ]}>
                    <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                </View>
                {isSelected && (
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                )}
            </Animated.View>
            <Text style={[styles.avatarLabel, { color: isSelected ? '#8A4FFF' : '#6B7280' }]}>
                {avatar.label}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function PersonalInfoScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();

    const [selectedId, setSelectedId] = useState('1');
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const [id, name] = await Promise.all([
                getSavedAvatarId(),
                getSavedDisplayName(),
            ]);
            setSelectedId(id);
            setDisplayName(name ?? (user as any)?.user_metadata?.name ?? '');
        })();
    }, []);

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Name required', 'Please enter a display name.');
            return;
        }
        setSaving(true);
        await Promise.all([
            setSavedAvatarId(selectedId),
            setSavedDisplayName(displayName.trim()),
        ]);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaving(false);
        Alert.alert('Saved!', 'Your profile has been updated.', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    };

    const preview = getAvatarById(selectedId);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Personal Info</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Name */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DISPLAY NAME</Text>
                    <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <Ionicons name="person-outline" size={20} color={colors.primary} style={{ marginRight: Spacing.sm }} />
                        <TextInput
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.nameInput, { color: colors.textPrimary }]}
                            autoCorrect={false}
                        />
                    </View>

                    {/* Avatar grid */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>
                        CHOOSE YOUR AVATAR
                    </Text>
                    <Text style={[styles.hint, { color: colors.textMuted }]}>
                        Tap an avatar — it will appear in your dashboard &amp; profile
                    </Text>

                    <View style={[styles.avatarGrid, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        {AVATARS.map(av => (
                            <AvatarCard
                                key={av.id}
                                avatar={av}
                                isSelected={selectedId === av.id}
                                onPress={setSelectedId}
                            />
                        ))}
                    </View>

                    {/* Preview */}
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>PREVIEW</Text>
                    <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                        <View style={[styles.previewAvatar, { backgroundColor: preview.bg, borderColor: colors.primary }]}>
                            <Text style={styles.previewEmoji}>{preview.emoji}</Text>
                        </View>
                        <View style={{ marginLeft: Spacing.md }}>
                            <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                                {displayName || 'Your Name'}
                            </Text>
                            <Text style={[styles.previewBadge, { color: colors.primary }]}>
                                Student Saver · {preview.label}
                            </Text>
                        </View>
                    </View>

                    {/* Save */}
                    <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={{ marginTop: Spacing.xl }}>
                        <LinearGradient colors={['#8A4FFF', '#6C63FF']} style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center' },
    scrollContent: { padding: Spacing.lg, paddingBottom: 120 },

    sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, marginBottom: Spacing.sm },
    hint: { fontSize: FontSize.xs, marginBottom: Spacing.md, marginTop: -4 },

    inputCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md,
    },
    nameInput: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semibold },

    avatarGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        borderRadius: BorderRadius.xl, borderWidth: 1,
        padding: Spacing.md, gap: Spacing.sm, justifyContent: 'space-around',
    },
    avatarCard: { alignItems: 'center', width: '18%', marginBottom: Spacing.sm },
    avatarCircle: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'transparent',
    },
    avatarSelected: { borderColor: '#8A4FFF', borderWidth: 3 },
    avatarEmoji: { fontSize: 26 },
    avatarLabel: { fontSize: 10, marginTop: 4, fontWeight: '600' },
    checkBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: '#8A4FFF', justifyContent: 'center', alignItems: 'center',
    },

    previewCard: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.lg,
    },
    previewAvatar: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center', borderWidth: 3,
    },
    previewEmoji: { fontSize: 32 },
    previewName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    previewBadge: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: 2 },

    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.sm,
    },
    saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
});
