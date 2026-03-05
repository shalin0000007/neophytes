/**
 * Supabase Client
 * 
 * Initializes the Supabase client with AsyncStorage for
 * session persistence across app restarts.
 * 
 * Gracefully handles missing/invalid credentials so the
 * app can at least render the UI during development.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are configured
const isConfigured =
    supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10;

// Only create real client if credentials exist, otherwise create a dummy
export const supabase: SupabaseClient = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    })
    : (new Proxy({} as any, {
        get: (_target, prop) => {
            // Return no-op functions for chaining
            if (prop === 'auth') {
                return {
                    signUp: async () => ({ data: null, error: { message: 'Supabase not configured. Update .env with your credentials.' } }),
                    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured. Update .env with your credentials.' } }),
                    signOut: async () => ({ error: null }),
                    getSession: async () => ({ data: { session: null }, error: null }),
                    getUser: async () => ({ data: { user: null }, error: null }),
                    onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => { } } } }),
                };
            }
            if (prop === 'from') {
                return () => ({
                    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }), order: () => ({ limit: async () => ({ data: [], error: null }) }) }), order: () => ({ limit: async () => ({ data: [], error: null }) }) }),
                    insert: async () => ({ error: { message: 'Supabase not configured' } }),
                    update: () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
                });
            }
            if (prop === 'rpc') {
                return async () => ({ data: null, error: { message: 'Supabase not configured' } });
            }
            return () => { };
        },
    }) as unknown as SupabaseClient);

if (!isConfigured) {
    console.warn(
        '⚠️ Supabase not configured! Update .env with your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
    );
}

// ─── Auth helpers ───

export async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name },
        },
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
