/**
 * SMS Reader Service
 * 
 * Reads Android SMS inbox using a custom native module (SmsReaderModule),
 * parses ALL bank transactions (debit + credit), and processes them.
 * Only debit transactions trigger savings.
 * 
 * Deduplication: Uses SMS _id stored in a persistent Set to prevent
 * the same SMS from being processed multiple times.
 */

import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSms } from './smsParser';
import { processTransaction } from './savingsEngine';

// Track processed SMS IDs to avoid double-processing (persisted)
let processedSmsIds = new Set<string>();
let pollingInterval: ReturnType<typeof setInterval> | null = null;
const STORAGE_KEY = '@microsave_processed_sms_ids';

// ─── Persistence for processed IDs ───

async function loadProcessedIds() {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            const arr = JSON.parse(stored);
            processedSmsIds = new Set(arr);
        }
    } catch { }
}

async function saveProcessedIds() {
    try {
        // Keep only last 500 IDs to prevent unbounded growth
        const arr = Array.from(processedSmsIds).slice(-500);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch { }
}

/** Reset processed IDs so a re-scan processes all SMS again */
export async function resetProcessedIds() {
    processedSmsIds.clear();
    await AsyncStorage.removeItem(STORAGE_KEY);
}

// ─── Native module check ───

function isNativeModuleAvailable(): boolean {
    return !!(NativeModules.SmsReaderModule);
}

// ─── Permission ───

export async function requestSmsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
                title: 'SMS Permission',
                message: 'MicroSave needs to read your SMS to auto-detect UPI payments and save spare change.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn('SMS permission error:', err);
        return false;
    }
}

// ─── Read SMS inbox ───

async function readSmsInbox(minDate?: number): Promise<Array<{ _id: string; body: string; date: number }>> {
    if (Platform.OS !== 'android') return [];
    if (!isNativeModuleAvailable()) return [];

    try {
        const options: any = { maxCount: 100 };
        if (minDate) {
            options.minDate = minDate;
        }
        const messages = await NativeModules.SmsReaderModule.readSms(options);
        return messages || [];
    } catch (error) {
        console.warn('SMS read error:', error);
        return [];
    }
}

// ─── Scan & process ───

export async function scanRecentSms(
    userId: string,
    onNewTransaction?: (merchant: string, amount: number, saved: number) => void
): Promise<number> {
    if (!isNativeModuleAvailable()) {
        Alert.alert(
            'Native Build Required',
            'SMS reading requires a native Android build.\n\nRun: npx expo run:android\n\nUse the "Simulate SMS" button for demo mode.',
        );
        return -1;
    }

    const hasPermission = await requestSmsPermission();
    if (!hasPermission) {
        Alert.alert('Permission Required', 'SMS permission is needed to auto-detect UPI payments.');
        return -1;
    }

    // Load previously processed IDs
    await loadProcessedIds();

    // Read messages from last 7 days
    const sinceTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const messages = await readSmsInbox(sinceTime);
    console.log(`[SMS Scan] Read ${messages.length} messages from inbox`);
    let newCount = 0;

    for (const sms of messages) {
        const smsId = sms._id?.toString();

        // STRICT deduplication: skip if already processed
        if (!smsId || processedSmsIds.has(smsId)) continue;

        const parsed = parseSms(sms.body);
        if (!parsed) {
            // Mark non-transaction SMS as processed too (so we don't re-check)
            processedSmsIds.add(smsId);
            continue;
        }

        console.log(`[SMS Scan] ${parsed.type.toUpperCase()}: ₹${parsed.amount} → ${parsed.merchant}`);

        // Mark as processed BEFORE inserting (prevents duplicates even if insert fails)
        processedSmsIds.add(smsId);

        // Use the real SMS date
        const smsDate = sms.date ? new Date(sms.date) : undefined;
        console.log(`[SMS Scan] Date: ${smsDate?.toISOString() || 'no date'} | ${parsed.type.toUpperCase()}: ₹${parsed.amount} → ${parsed.merchant}`);

        // Process: savings only for debits, but record all transactions
        const result = await processTransaction(
            userId,
            parsed.amount,
            parsed.merchant, // merchant
            parsed.merchant, // description
            smsDate,         // smsDate
            parsed.type      // txnType
        );

        if (!result.error) {
            newCount++;
            if (parsed.type === 'debit') {
                onNewTransaction?.(parsed.merchant, parsed.amount, result.savedAmount);
            }
        }
    }

    // Save processed IDs to persist across app restarts
    await saveProcessedIds();

    return newCount;
}

// ─── Polling ───

let isScanning = false; // Lock to prevent overlapping scans

export function startSmsPolling(
    userId: string,
    onNewTransaction?: (merchant: string, amount: number, saved: number) => void
) {
    if (pollingInterval) return;
    if (!isNativeModuleAvailable()) {
        console.log('SMS polling skipped — native module not available (Expo Go)');
        return;
    }

    // Do an initial scan on mount
    if (!isScanning) {
        isScanning = true;
        scanRecentSms(userId, onNewTransaction).finally(() => { isScanning = false; });
    }

    // Then poll every 60 seconds
    pollingInterval = setInterval(() => {
        if (isScanning) return; // Skip if previous scan still running
        isScanning = true;
        scanRecentSms(userId, onNewTransaction).finally(() => { isScanning = false; });
    }, 60_000);
}

export function stopSmsPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}
