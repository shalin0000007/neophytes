/**
 * MicroSave Student — Theme System
 * 
 * Dark-first fintech design language with glassmorphism,
 * large bold numbers, and accent green (#00E38C).
 */

export const Colors = {
    dark: {
        background: '#0E1117',
        surface: '#161B22',
        cardBg: 'rgba(255,255,255,0.05)',
        cardBorder: 'rgba(255,255,255,0.08)',
        primary: '#00E38C',
        primaryDark: '#00B870',
        primaryLight: 'rgba(0,227,140,0.15)',
        danger: '#FF6B6B',
        warning: '#FFB347',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textMuted: '#6B7280',
        inputBg: 'rgba(255,255,255,0.06)',
        inputBorder: 'rgba(255,255,255,0.12)',
        tabBarBg: '#0E1117',
        tabBarBorder: 'rgba(255,255,255,0.06)',
    },
    light: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        cardBg: 'rgba(255,255,255,0.9)',
        cardBorder: 'rgba(0,0,0,0.06)',
        primary: '#00C47D',
        primaryDark: '#00A066',
        primaryLight: 'rgba(0,196,125,0.12)',
        danger: '#E53E3E',
        warning: '#ED8936',
        textPrimary: '#1A202C',
        textSecondary: '#718096',
        textMuted: '#A0AEC0',
        inputBg: 'rgba(0,0,0,0.03)',
        inputBorder: 'rgba(0,0,0,0.1)',
        tabBarBg: '#FFFFFF',
        tabBarBorder: 'rgba(0,0,0,0.06)',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
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
