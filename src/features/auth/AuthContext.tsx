import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile } from '@/types/database';
import { User, Session } from '@supabase/supabase-js';

// Default demo profile for offline/preview mode when Supabase is not configured
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { full_name: 'Alex Johnson', avatar_url: '' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex@trackspace.dev',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  display_name: 'Alex Johnson',
  avatar_url: null,
  timezone: 'Asia/Jakarta',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline / Local mock mode
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsLoading(false);
      setIsDemoMode(true);
      return;
    }

    // Live Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if record not yet triggered
        setProfile({
          id: userId,
          display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
          avatar_url: user?.user_metadata?.avatar_url || null,
          timezone: 'Asia/Jakarta',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      // Profile fetch failed
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    if (!isSupabaseConfigured) {
      setUser({ ...DEMO_USER, email });
      setProfile({ ...DEMO_PROFILE, display_name: email.split('@')[0] });
      return {};
    }

    if (!password) {
      return { error: 'Password required' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!isSupabaseConfigured) {
      setUser({ ...DEMO_USER, email });
      setProfile({ ...DEMO_PROFILE, display_name: fullName || email.split('@')[0] });
      return {};
    }

    if (!password) {
      return { error: 'Password required' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error?.message };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (profile) {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updated);
      if (isSupabaseConfigured && user) {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
