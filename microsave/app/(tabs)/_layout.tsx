/**
 * Bottom Tabs Layout
 * 
 * 4 tabs + centered raised "+" button that navigates to Pay screen.
 * Home | Insights | [+] | Vault | Profile
 * 
 * Includes smooth fade transition for tab switches.
 */

import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeContext';

// Custom center button component
function CenterPayButton() {
    return (
        <TouchableOpacity
            style={styles.centerButton}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#8A4FFF', '#6C63FF']}
                style={styles.centerButtonGradient}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function TabsLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBg,
                    borderTopColor: colors.tabBarBorder,
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                animation: 'fade',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pay"
                options={{
                    title: '',
                    tabBarIcon: () => <CenterPayButton />,
                    tabBarLabel: () => null,
                }}
            />
            <Tabs.Screen
                name="vault"
                options={{
                    title: 'Vault',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButton: {
        position: 'absolute',
        top: -24,
        alignSelf: 'center',
    },
    centerButtonGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 8px rgba(138, 79, 255, 0.4)',
        elevation: 8,
    },
});
