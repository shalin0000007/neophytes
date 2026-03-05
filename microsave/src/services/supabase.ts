/**
 * Supabase Client
 * 
 * Initializes the Supabase client with AsyncStorage for
 * session persistence across app restarts.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing from .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// ─── Auth helpers ───

export async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
}

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
}
