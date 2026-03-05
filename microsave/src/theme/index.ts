/**
 * MicroSave Student — Theme System
 * 
 * Deep purple dark theme with violet/magenta accents.
 * Matches the UI reference images.
 */

export const Colors = {
    dark: {
        background: '#0D0B1A',
        surface: '#1A1730',
        cardBg: 'rgba(138,79,255,0.08)',
        cardBorder: 'rgba(138,79,255,0.25)',
        primary: '#8A4FFF',
        primaryDark: '#6B3FCC',
        primaryLight: 'rgba(138,79,255,0.15)',
        accent: '#A855F7',
        accentGradientStart: '#8A4FFF',
        accentGradientEnd: '#6C63FF',
        cyan: '#00D4FF',
        magenta: '#FF3CAC',
        pink: '#FF6B9D',
        success: '#00E38C',
        danger: '#FF4444',
        warning: '#FFB347',
        textPrimary: '#FFFFFF',
        textSecondary: '#9CA3AF',
        textMuted: '#6B7280',
        inputBg: 'rgba(255,255,255,0.04)',
        inputBorder: 'rgba(138,79,255,0.3)',
        tabBarBg: '#0D0B1A',
        tabBarBorder: 'rgba(138,79,255,0.15)',
        // Gradient card colors
        gradientPurple: ['#8A4FFF', '#6C63FF'],
        gradientViolet: ['#A855F7', '#8A4FFF'],
        gradientMagenta: ['#FF3CAC', '#8A4FFF'],
    },
    light: {
        background: '#F5F3FF',
        surface: '#FFFFFF',
        cardBg: 'rgba(138,79,255,0.06)',
        cardBorder: 'rgba(138,79,255,0.15)',
        primary: '#7C3AED',
        primaryDark: '#6D28D9',
        primaryLight: 'rgba(124,58,237,0.1)',
        accent: '#8B5CF6',
        accentGradientStart: '#7C3AED',
        accentGradientEnd: '#6366F1',
        cyan: '#06B6D4',
        magenta: '#EC4899',
        pink: '#F472B6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        textPrimary: '#1F1235',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        inputBg: 'rgba(0,0,0,0.03)',
        inputBorder: 'rgba(124,58,237,0.2)',
        tabBarBg: '#FFFFFF',
        tabBarBorder: 'rgba(124,58,237,0.1)',
        gradientPurple: ['#7C3AED', '#6366F1'],
        gradientViolet: ['#8B5CF6', '#7C3AED'],
        gradientMagenta: ['#EC4899', '#7C3AED'],
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
};

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
    mega: 48,
};

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
};

export const Shadows = {
    sm: {
        shadowColor: '#8A4FFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#8A4FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#8A4FFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    }),
};

export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof Colors.dark;
