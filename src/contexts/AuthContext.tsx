import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { toast } from 'sonner';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
  return data;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
    setIsAdmin(profileData?.role === 'admin');
  };

  useEffect(() => {
    supabase
      .auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          const profileData = await getProfile(session.user.id);
          
          // Check if user is banned
          if (profileData?.banned) {
            await supabase.auth.signOut();
            toast.error('Your account has been banned. Please contact support.');
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }
          
          setUser(session.user);
          setProfile(profileData);
          setIsAdmin(profileData?.role === 'admin');
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      })
      .catch((error: Error) => {
        toast.error(`Failed to fetch user session: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then((profileData) => {
          setProfile(profileData);
          setIsAdmin(profileData?.role === 'admin');
        });
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user is banned
      if (data.user) {
        const profile = await getProfile(data.user.id);
        if (profile?.banned) {
          await supabase.auth.signOut();
          throw new Error('Your account has been banned. Please contact support.');
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithSSO({
        domain: 'miaoda-gg.com',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_self');
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithEmail, signInWithGoogle, signOut, refreshProfile }}>
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
