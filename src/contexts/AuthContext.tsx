import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { ensureUserProfile, getUserProfile, updateUserProfile } from '../lib/profileService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isLoaded: boolean;
  signUp: (email: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signIn: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  refreshUserProfile: () => Promise<void>;
  updateProfile: (updates: { firstName?: string; lastName?: string; phone?: string; homeStage?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const TESTING_MODE = true;

  const mockUser: User = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: { fullName: 'Test User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;

  if (TESTING_MODE) {
    console.log('%c🧪 TESTING MODE ENABLED - Authentication Bypassed', 'background: #FFA500; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.log('Mock User:', mockUser);
  }

  const [user, setUser] = useState<User | null>(TESTING_MODE ? mockUser : null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(TESTING_MODE ? false : true);
  const [isLoaded, setIsLoaded] = useState(TESTING_MODE ? true : false);

  useEffect(() => {
    if (TESTING_MODE) {
      return;
    }

    let mounted = true;

    async function loadUserProfile(userId: string, email: string, metadata?: Record<string, any>) {
      try {
        const profile = await ensureUserProfile(userId, email, metadata);
        if (mounted && profile) setUserProfile(profile);
      } catch (e) {
        console.error("loadUserProfile error:", e);
        if (mounted) setUserProfile(null);
      }
    }

    async function initializeAuth() {
      try {
        setIsLoading(true);

        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("getSession error:", error);

        const currentSession = data?.session ?? null;

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        setIsLoaded(true);

        if (currentSession?.user?.email) {
          loadUserProfile(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.user_metadata
          );
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) setIsLoaded(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      setIsLoaded(true);
      setIsLoading(false);

      if (newSession?.user?.email) {
        loadUserProfile(
          newSession.user.id,
          newSession.user.email,
          newSession.user.user_metadata
        );
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [TESTING_MODE]);
  

  const signUp = async (email: string, metadata?: Record<string, any>) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
  
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {},
        },
      });
  
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };
  

  const signIn = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;


      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    }
  };

  const updateUserMetadata = async (metadata: Record<string, any>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update metadata error:', error);
      return { error: error as Error };
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;

    const profile = await getUserProfile(user.id);
    if (profile) {
      setUserProfile(profile);
    }
  };

  const updateProfile = async (updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    homeStage?: string;
  }) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const updatedProfile = await updateUserProfile(user.id, updates);

      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      setUserProfile(updatedProfile);

      const metadataUpdates: Record<string, any> = {};
      if (updates.firstName || updates.lastName) {
        const fullName = `${updates.firstName || userProfile?.firstName || ''} ${updates.lastName || userProfile?.lastName || ''}`.trim();
        metadataUpdates.fullName = fullName;
      }
      if (updates.phone !== undefined) {
        metadataUpdates.phoneNumber = updates.phone;
      }
      if (updates.homeStage) {
        metadataUpdates.homeStage = updates.homeStage;
      }

      if (Object.keys(metadataUpdates).length > 0) {
        await updateUserMetadata(metadataUpdates);
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isLoading,
        isLoaded,
        signUp,
        signIn,
        signOut,
        updateUserMetadata,
        signInWithGoogle,
        refreshUserProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
