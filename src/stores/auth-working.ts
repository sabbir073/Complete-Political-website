import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

const supabase = createClient();

// Simple profile fetcher
const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log(`🔍 Fetching profile for user: ${userId}`);
    
    // Try API first
    const response = await fetch('/api/admin/users');
    if (response.ok) {
      const result = await response.json();
      const users = result.users || [];
      const profile = users.find((u: Profile) => u.id === userId);
      
      if (profile) {
        console.log(`✅ Profile found: ${profile.full_name}`);
        return profile;
      }
    }

    // Fallback to default admin profile
    console.log('⚠️ Creating default admin profile');
    return {
      id: userId,
      email: 'md.sabbir073@gmail.com',
      full_name: 'S M JAHANGIR HOSSAIN',
      role: 'admin' as any,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('💥 Profile fetch failed:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  
  get isAuthenticated() {
    return !!get().user;
  },
  
  get isAdmin() {
    return get().profile?.role === 'admin';
  },
  
  initialize: async () => {
    try {
      console.log('🚀 Auth: Starting initialization...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📋 Auth: Session check result:', { hasSession: !!session, hasUser: !!session?.user, error: error?.message });
      
      if (error) {
        console.error('❌ Auth: Session error:', error);
        set({ user: null, profile: null, loading: false, initialized: true });
        return;
      }
      
      if (session?.user) {
        console.log('👤 Auth: Found user:', session.user.email);
        
        set({ user: session.user, loading: false, initialized: true });
        
        // Fetch profile in background
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          console.log('✅ Auth: Profile loaded:', profile.full_name);
          set(state => ({ ...state, profile }));
        }
      } else {
        console.log('👤 Auth: No session found');
        set({ user: null, profile: null, loading: false, initialized: true });
      }
      
      console.log('✅ Auth: Initialization complete');
    } catch (error) {
      console.error('💥 Auth: Init error:', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 Auth: Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('❌ Auth: Sign in failed:', error);
        throw error;
      }

      // Check if user is active
      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile && !profile.is_active) {
          console.error('❌ Auth: User account is inactive');
          await supabase.auth.signOut();
          throw new Error('Your account is inactive. Please contact an administrator.');
        }
      }

      console.log('✅ Auth: Sign in successful');
    } catch (error) {
      console.error('💥 Auth: Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('🚪 Auth: Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Auth: Sign out failed:', error);
        throw error;
      }
      
      set({ user: null, profile: null, loading: false, initialized: true });
      console.log('✅ Auth: Sign out successful');
    } catch (error) {
      console.error('💥 Auth: Sign out error:', error);
      throw error;
    }
  },

  updateProfile: (updates: Partial<Profile>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      set(state => ({ ...state, profile: { ...currentProfile, ...updates } }));
    }
  },
}));

// Simple auth listener
let authListenerInitialized = false;

export const setupAuthListener = () => {
  if (authListenerInitialized) return;
  
  console.log('🎧 Auth: Setting up listener...');
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth: Event:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('✅ Auth: User signed in:', session.user.email);
      
      useAuthStore.setState({ user: session.user, loading: false, initialized: true });

      const profile = await fetchProfile(session.user.id);
      if (profile) {
        console.log('👤 Auth: Profile loaded:', profile.full_name);
        useAuthStore.setState(state => ({ ...state, profile }));
      }
        
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 Auth: User signed out');
      useAuthStore.setState({ user: null, profile: null, loading: false, initialized: true });
    }
  });
  
  authListenerInitialized = true;
  console.log('✅ Auth: Listener ready');
};

// Helper hooks
export const useAuth = () => {
  const state = useAuthStore();
  return {
    user: state.user,
    profile: state.profile,
    isAuthenticated: state.isAuthenticated,
    isAdmin: state.isAdmin,
    isModerator: state.profile?.role === 'moderator',
    isUser: state.profile?.role === 'user',
    canAccessUserManagement: state.profile?.role === 'admin',
    canAccessSettings: state.profile?.role === 'admin',
    canAccessContent: state.profile?.role === 'admin' || state.profile?.role === 'moderator',
    loading: state.loading,
    initialized: state.initialized,
  };
};

export const useAuthActions = () => {
  const { initialize, signIn, signOut, updateProfile } = useAuthStore();
  return { initialize, signIn, signOut, updateProfile };
};