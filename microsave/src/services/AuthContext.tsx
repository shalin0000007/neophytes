/**
 * Auth Context
 * 
 * Manages user session state across the app.
 * Listens for Supabase auth changes and provides
 * user/session to all components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getSession } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    initialized: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Get initial session
        getSession().then(({ session: s }) => {
            setSession(s);
            setLoading(false);
            setInitialized(true);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const user = session?.user ?? null;

    return (
        <AuthContext.Provider value={{ session, user, loading, initialized }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
