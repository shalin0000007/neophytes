/**
 * Micro-Saving Engine
 * 
 * Core business logic:
 * 1. Round-off savings calculation
 * 2. Transaction processing with Supabase storage
 * 3. Automatic investment when savings ≥ ₹100
 * 4. Projected return calculation (6% annual)
 */

import { supabase } from './supabase';

// ─── Round-Off Calculation ───

/**
 * Calculates savings using round-up-to-nearest-10 model.
 * E.g. ₹87 → rounded to ₹90 → saves ₹3
 * If already multiple of 10, saves ₹0 (minimum ₹1 optional).
 */
export function calculateSavings(amount: number): number {
    if (amount <= 0) return 0;
    const rounded = Math.ceil(amount / 10) * 10;
    const saved = rounded - amount;
    // If exact multiple of 10, save minimum ₹1
    return saved === 0 ? 1 : saved;
}

// ─── 6% Annual Return Projection ───

export function projectReturn(amount: number, years: number = 1): number {
    return amount * Math.pow(1.06, years);
}

// ─── Process a transaction ───

export async function processTransaction(
    userId: string,
    amount: number,
    description: string = ''
): Promise<{ savedAmount: number; invested: boolean; error: string | null }> {
    const savedAmount = calculateSavings(amount);

    // 1. Insert transaction record
    const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        amount,
        saved_amount: savedAmount,
        description,
    });

    if (txError) {
        return { savedAmount: 0, invested: false, error: txError.message };
    }

    // 2. Update profile totals
    const { error: profileError } = await supabase.rpc('update_profile_totals', {
        p_user_id: userId,
        p_spent: amount,
        p_saved: savedAmount,
    });

    if (profileError) {
        // Fallback: manual update
        const { data: profile } = await supabase
            .from('profiles')
            .select('total_spent, total_saved')
            .eq('id', userId)
            .single();

        if (profile) {
            await supabase
                .from('profiles')
                .update({
                    total_spent: (profile.total_spent || 0) + amount,
                    total_saved: (profile.total_saved || 0) + savedAmount,
                })
                .eq('id', userId);
        }
    }

    // 3. Check for auto-investment
    const invested = await checkAndInvest(userId);

    return { savedAmount, invested, error: null };
}

// ─── Auto-Invest Logic ───

export async function checkAndInvest(userId: string): Promise<boolean> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('total_saved, total_invested')
        .eq('id', userId)
        .single();

    if (!profile || profile.total_saved < 100) return false;

    const investAmount = 100;
    const projectedValue = projectReturn(investAmount);

    // Insert investment record
    const { error: invError } = await supabase.from('investments').insert({
        user_id: userId,
        invested_amount: investAmount,
        projected_value: projectedValue,
    });

    if (invError) return false;

    // Update profile: deduct from savings, add to invested
    await supabase
        .from('profiles')
        .update({
            total_saved: (profile.total_saved || 0) - investAmount,
            total_invested: (profile.total_invested || 0) + investAmount,
        })
        .eq('id', userId);

    return true;
}

// ─── Fetch user profile ───

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { profile: data, error };
}

// ─── Fetch recent transactions ───

export async function getRecentTransactions(userId: string, limit: number = 5) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    return { transactions: data || [], error };
}

// ─── Fetch all investments ───

export async function getInvestments(userId: string) {
    const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { investments: data || [], error };
}
