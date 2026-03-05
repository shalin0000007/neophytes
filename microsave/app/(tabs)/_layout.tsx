/**
 * Bottom Tabs Layout
 * 
 * 4 tabs + centered raised "+" button that opens UPI payment.
 * Home | Insights | [+] | Vault | Profile
 */

import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme/ThemeContext';

// Open UPI payment intent
async function openUPIApp() {
    // Try to open UPI intent (works on Android with GPay, PhonePe, Paytm, etc.)
    const upiUrl = 'upi://pay';

    try {
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
            await Linking.openURL(upiUrl);
        } else {
            // Fallback: try specific apps
            const apps = [
                { name: 'Google Pay', url: 'tez://upi/pay' },
                { name: 'PhonePe', url: 'phonepe://upi' },
                { name: 'Paytm', url: 'paytmmp://upi' },
            ];

            for (const app of apps) {
                const can = await Linking.canOpenURL(app.url);
                if (can) {
                    await Linking.openURL(app.url);
                    return;
                }
            }

            Alert.alert(
                'No UPI App Found',
                'Please install a UPI payment app like Google Pay, PhonePe, or Paytm.',
                [{ text: 'OK' }]
            );
        }
    } catch (error) {
        Alert.alert('Error', 'Could not open payment app');
    }
}

// Custom center button component
function CenterPayButton() {
    return (
        <TouchableOpacity
            style={styles.centerButton}
            onPress={openUPIApp}
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
