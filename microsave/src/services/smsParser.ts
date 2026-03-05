/**
 * SMS Transaction Parser
 * 
 * Parses Indian banking SMS messages to extract:
 * - Transaction amount
 * - Transaction type (debit/credit)
 * - Merchant name (if available)
 * 
 * Also handles duplicate detection via a 60-second window.
 */

// ─── Types ───

export interface ParsedTransaction {
    amount: number;
    type: 'debit' | 'credit' | 'unknown';
    merchant: string;
    raw: string;
}

// ─── Debit keywords ───

const DEBIT_KEYWORDS = [
    'debited',
    'debit',
    'spent',
    'paid',
    'payment',
    'purchase',
    'withdrawn',
    'transfer to',
    'sent to',
];

// ─── Credit keywords (to ignore) ───

const CREDIT_KEYWORDS = [
    'credited',
    'credit',
    'received',
    'refund',
    'cashback',
    'deposit',
];

// ─── OTP keywords (to ignore) ───

const OTP_KEYWORDS = ['otp', 'one time password', 'verification code', 'pin'];

// ─── Amount extraction regex ───
// Matches: Rs. 287.00, INR 1,500.50, ₹87, Rs 1234
const AMOUNT_REGEX = /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i;

// ─── Merchant extraction regex ───
// Matches: "to Swiggy", "at Amazon", "via UPI to PhonePe"
const MERCHANT_REGEX = /(?:to|at|from|via\s+UPI\s+to)\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i;

// ─── Duplicate detection ───

interface RecentEntry {
    amount: number;
    timestamp: number;
}

const recentTransactions: RecentEntry[] = [];
const DUPLICATE_WINDOW_MS = 60_000; // 60 seconds

function isDuplicate(amount: number): boolean {
    const now = Date.now();
    // Clean old entries
    while (recentTransactions.length > 0 && now - recentTransactions[0].timestamp > DUPLICATE_WINDOW_MS) {
        recentTransactions.shift();
    }
    // Check for duplicate
    const found = recentTransactions.some(
        (entry) => entry.amount === amount && now - entry.timestamp < DUPLICATE_WINDOW_MS
    );
    if (!found) {
        recentTransactions.push({ amount, timestamp: now });
    }
    return found;
}

// ─── Main parser ───

export function parseSms(smsBody: string): ParsedTransaction | null {
    const lower = smsBody.toLowerCase();

    // Ignore OTP messages
    if (OTP_KEYWORDS.some((kw) => lower.includes(kw))) {
        return null;
    }

    // Ignore credit messages
    if (CREDIT_KEYWORDS.some((kw) => lower.includes(kw)) && !DEBIT_KEYWORDS.some((kw) => lower.includes(kw))) {
        return null;
    }

    // Must contain a debit keyword
    const isDebit = DEBIT_KEYWORDS.some((kw) => lower.includes(kw));
    if (!isDebit) return null;

    // Extract amount
    const amountMatch = smsBody.match(AMOUNT_REGEX);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) return null;

    // Duplicate check
    if (isDuplicate(amount)) return null;

    // Extract merchant
    let merchant = 'Unknown';
    const merchantMatch = smsBody.match(MERCHANT_REGEX);
    if (merchantMatch) {
        merchant = merchantMatch[1].trim();
    }

    return {
        amount,
        type: 'debit',
        merchant,
        raw: smsBody,
    };
}

// ─── Check if SMS looks like a banking transaction SMS ───

export function isBankingSms(smsBody: string): boolean {
    const lower = smsBody.toLowerCase();
    if (OTP_KEYWORDS.some((kw) => lower.includes(kw))) return false;
    return AMOUNT_REGEX.test(smsBody) && DEBIT_KEYWORDS.some((kw) => lower.includes(kw));
}
