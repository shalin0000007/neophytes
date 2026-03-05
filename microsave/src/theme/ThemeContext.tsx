/**
 * Theme Context Provider
 * 
 * Provides dark/light theme toggle across the entire app.
 * Persists preference in AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, type ThemeMode, type ThemeColors } from './index';

interface ThemeContextType {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'dark',
    colors: Colors.dark,
    toggleTheme: () => { },
    setThemeMode: () => { },
});

const THEME_KEY = '@microsave_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>('dark');

    useEffect(() => {
        AsyncStorage.getItem(THEME_KEY).then((saved) => {
            if (saved === 'light' || saved === 'dark') {
                setMode(saved);
            }
        });
    }, []);

    const toggleTheme = useCallback(() => {
        setMode((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            AsyncStorage.setItem(THEME_KEY, next);
            return next;
        });
    }, []);

    const setThemeMode = useCallback((newMode: ThemeMode) => {
        setMode(newMode);
        AsyncStorage.setItem(THEME_KEY, newMode);
    }, []);

    const colors = Colors[mode];

    return (
        <ThemeContext.Provider value={{ mode, colors, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
