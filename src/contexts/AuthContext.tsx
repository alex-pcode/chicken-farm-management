import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { browserCache } from '../utils/browserCache';

// Re-export supabase for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { supabase };

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to fetch admin status from user_profiles
  const fetchAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin ?? false);
    } catch (err) {
      console.error('Error fetching admin status:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch admin status if user is logged in
      if (session?.user?.id) {
        fetchAdminStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const previousUserId = user?.id;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Fetch admin status for new user
      if (session?.user?.id) {
        fetchAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }

      // Clear cache only when switching users (different user ID)
      if (previousUserId && session?.user?.id !== previousUserId) {
        console.log('User changed, clearing cache for previous user:', previousUserId);
        browserCache.clearAll(previousUserId);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    // Cache is preserved on logout for faster re-login experience
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
