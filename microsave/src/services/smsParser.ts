/**
 * SMS Transaction Parser + Demo Simulator
 * 
 * Parses Indian banking SMS messages to extract:
 * - Transaction amount
 * - Transaction type (debit/credit)
 * - Merchant name (if available)
 * 
 * Returns ALL bank transactions (debit + credit).
 * Savings are only calculated on DEBITS.
 */

import { NativeEventEmitter, NativeModules } from 'react-native';

// ─── Types ───

export interface ParsedTransaction {
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    raw: string;
}

// ─── Debit keywords ───

const DEBIT_KEYWORDS = [
    'debited', 'debit', 'spent', 'paid', 'payment',
    'purchase', 'withdrawn', 'transfer to', 'sent to',
    'transferred', 'txn', 'dr ',
    'a/c debited', 'ac debited', 'account debited',
    'neft', 'imps', 'rtgs', 'bill pay',
];

// ─── Credit keywords ───

const CREDIT_KEYWORDS = [
    'credited', 'credit', 'received', 'refund', 'cashback',
    'deposit', 'cr ', 'added to', 'transferred to your',
];

// ─── OTP keywords (to ignore entirely) ───

const OTP_KEYWORDS = ['otp', 'one time password', 'verification code', 'your pin is'];

// ─── Amount extraction regex ───
// Matches: Rs. 287.00, INR 1,500.50, ₹87, Rs 1234, Rupees 500
const AMOUNT_REGEX = /(?:Rs\.?|INR|₹|Rupees?)\s*([\d,]+(?:\.\d{1,2})?)/i;

// ─── Merchant extraction regex ───
// Matches: "to Swiggy", "at Amazon", "via UPI to PhonePe"
const MERCHANT_REGEX = /(?:to|at|from|via\s+UPI\s+to)\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i;

// Bank signature at end of SMS: "-CBoI", "-HDFC", "- SBI", "-ICICI"
const BANK_REGEX = /[-–]\s*([A-Za-z]{2,10})(?:\s*$)/;

// ─── Main parser ───

export function parseSms(smsBody: string): ParsedTransaction | null {
    const lower = smsBody.toLowerCase();

    // Skip OTP messages
    if (OTP_KEYWORDS.some((kw) => lower.includes(kw))) return null;

    // Determine type: debit or credit
    const isDebit = DEBIT_KEYWORDS.some((kw) => lower.includes(kw));
    const isCredit = CREDIT_KEYWORDS.some((kw) => lower.includes(kw));

    // If both debit and credit keywords found, prioritize debit
    // If neither found, skip this SMS (not a transaction)
    let type: 'debit' | 'credit';
    if (isDebit && !isCredit) {
        type = 'debit';
    } else if (isCredit && !isDebit) {
        type = 'credit';
    } else if (isDebit && isCredit) {
        // e.g., "Rs. 100 debited... Total Bal: Rs. 219.84 CR"
        // The "CR" after balance is a credit keyword but this is a debit SMS
        type = 'debit';
    } else {
        return null; // Not a transaction SMS
    }

    // Extract amount
    const amountMatch = smsBody.match(AMOUNT_REGEX);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) return null;

    // Extract merchant (try merchant name first, then bank signature)
    let merchant = type === 'debit' ? 'UPI Payment' : 'Received';
    const merchantMatch = smsBody.match(MERCHANT_REGEX);
    if (merchantMatch) {
        merchant = merchantMatch[1].trim();
    } else {
        const bankMatch = smsBody.match(BANK_REGEX);
        if (bankMatch) {
            merchant = `${bankMatch[1]} ${type === 'debit' ? 'Payment' : 'Credit'}`;
        }
    }

    return { amount, type, merchant, raw: smsBody };
}

// ─── Check if SMS looks like a banking transaction SMS ───

export function isBankingSms(smsBody: string): boolean {
    const lower = smsBody.toLowerCase();
    if (OTP_KEYWORDS.some((kw) => lower.includes(kw))) return false;
    const hasAmount = AMOUNT_REGEX.test(smsBody);
    const hasTxnKeyword = DEBIT_KEYWORDS.some((kw) => lower.includes(kw)) ||
        CREDIT_KEYWORDS.some((kw) => lower.includes(kw));
    return hasAmount && hasTxnKeyword;
}

// ─── Demo SMS Templates ───

const DEMO_SMS_TEMPLATES = [
    'Rs. 87.00 debited from A/c XX1234 via UPI to Swiggy Instamart. Ref No 123456789.',
    'INR 245.00 paid to Zomato via UPI. A/c balance: Rs. 8,234.50',
    'Rs. 45.50 debited via UPI to Starbucks. UPI Ref: 987654321',
    'Rs. 1,200.00 transferred to PhonePe Merchant via UPI. A/c XX5678.',
    'INR 350.00 spent at Amazon.in via UPI. Balance: Rs. 12,450.00',
    'Rs. 63.00 paid to Ola via UPI. Ref: 456789123. Balance: Rs. 5,678.00',
];

let demoIndex = 0;

/**
 * Simulate a UPI banking SMS for demo/hackathon purposes.
 */
export function simulateSms(): ParsedTransaction | null {
    const sms = DEMO_SMS_TEMPLATES[demoIndex % DEMO_SMS_TEMPLATES.length];
    demoIndex++;
    return parseSms(sms);
}
