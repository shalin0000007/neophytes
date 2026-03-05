import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Same key used in app/notifications.tsx
const NOTIF_KEY = '@microsave_notifications';

// Tells Expo how to handle notifications when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('microsave-alerts', {
            name: 'Transaction Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#8A4FFF',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

async function getNotificationSettings() {
    const defaults = {
        transactionAlerts: true,
        savingsMilestones: true,
        weeklySummary: true,
        investmentUpdates: false,
        securityAlerts: true,
        appUpdates: false,
        sound: true,
        vibration: true,
    };

    try {
        const val = await AsyncStorage.getItem(NOTIF_KEY);
        if (val) return { ...defaults, ...JSON.parse(val) };
    } catch (e) {
        // Ignore error, return defaults
    }
    return defaults;
}

export async function notifyTransactionCaptured(merchant: string, amountSaved: number) {
    const settings = await getNotificationSettings();
    if (!settings.transactionAlerts) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Savings Captured! 🤑',
            body: `You saved ₹${amountSaved.toFixed(2)} on your ₹${amountSaved > 0 ? merchant.replace(' (Test)', '') : merchant} transaction.`,
            sound: settings.sound,
        },
        trigger: null, // trigger immediately
    });
}

export async function notifyInvestmentTriggered() {
    const settings = await getNotificationSettings();
    if (!settings.investmentUpdates) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Investment Triggered 📈',
            body: 'You hit ₹100 in savings! Your money is now working for you.',
            sound: settings.sound,
        },
        trigger: null,
    });
}

export async function notifySavingsMilestone(totalSaved: number) {
    const settings = await getNotificationSettings();
    if (!settings.savingsMilestones) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Milestone Reached! 🎉',
            body: `Awesome! You've officially saved ₹${totalSaved.toLocaleString('en-IN')}. Keep it up!`,
            sound: settings.sound,
        },
        trigger: null,
    });
}
