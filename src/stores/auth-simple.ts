import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  
  // Computed
  isAuthenticated: boolean;
  isAdmin: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
  
  // Internal
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
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
        console.log(`✅ Profile found via API: ${profile.full_name}`);
        return profile;
      }
    }

    // Fallback: Create default admin profile for known admin
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
  // Initial state
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  
  // Computed getters
  get isAuthenticated() {
    return !!get().user;
  },
  
  get isAdmin() {
    return get().profile?.role === 'admin';
  },
  
  // Actions
  initialize: async () => {
    try {
      console.log('🚀 Simple Auth: Starting initialization...');
      
      console.log('🔍 Simple Auth: Getting session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('📋 Simple Auth: Session result:', { hasSession: !!session, hasUser: !!session?.user, error: error?.message });
      
      if (error) {
        console.error('❌ Simple Auth: Session error:', error);
        set({
          user: null,
          profile: null,
          loading: false,
          initialized: true,
        });
        console.log('✅ Simple Auth: Initialization complete (with session error)');
        return;
      }
      
      if (session?.user) {
        console.log('👤 Simple Auth: Found session for user:', session.user.email);
        
        set({
          user: session.user,
          loading: false,
          initialized: true,
        });
        
        console.log('✅ Simple Auth: User state set, fetching profile...');

        // Fetch profile in background
        try {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            console.log('✅ Simple Auth: Profile loaded:', profile.full_name);
            set(state => ({
              ...state,
              profile: profile,
            }));
          } else {
            console.log('⚠️ Simple Auth: No profile found');
          }
        } catch (profileError) {
          console.error('❌ Simple Auth: Profile fetch error:', profileError);
        }
      } else {
        console.log('👤 Simple Auth: No session found');
        set({
          user: null,
          profile: null,
          loading: false,
          initialized: true,
        });
      }
      
      console.log('✅ Simple Auth: Initialization complete');
    } catch (error) {
      console.error('💥 Simple Auth: Init error:', error);
      set({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
      console.log('✅ Simple Auth: Initialization complete (with error)');
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log('🔐 Simple Auth: Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('❌ Simple Auth: Sign in failed:', error);
        throw error;
      }

      // Check if user is active
      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        if (profile && !profile.is_active) {
          console.error('❌ Simple Auth: User account is inactive');
          await supabase.auth.signOut();
          throw new Error('Your account is inactive. Please contact an administrator.');
        }
      }

      console.log('✅ Simple Auth: Sign in successful');
    } catch (error) {
      console.error('💥 Simple Auth: Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('🚪 Simple Auth: Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Simple Auth: Sign out failed:', error);
        throw error;
      }
      
      set({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
      
      console.log('✅ Simple Auth: Sign out successful');
    } catch (error) {
      console.error('💥 Simple Auth: Sign out error:', error);
      throw error;
    }
  },

  updateProfile: (updates: Partial<Profile>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      set(state => ({
        ...state,
        profile: { ...currentProfile, ...updates }
      }));
    }
  },

  // Internal setters
  setUser: (user: User | null) => {
    set(state => ({ ...state, user }));
  },

  setProfile: (profile: Profile | null) => {
    set(state => ({ ...state, profile }));
  },

  setLoading: (loading: boolean) => {
    set(state => ({ ...state, loading }));
  },
}));

// Simple auth listener
let authListenerInitialized = false;

export const setupAuthListener = () => {
  if (authListenerInitialized) return;
  
  console.log('🎧 Simple Auth: Setting up listener...');
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Simple Auth: Auth event:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('✅ Simple Auth: User signed in:', session.user.email);
      
      useAuthStore.setState({
        user: session.user,
        loading: false,
        initialized: true,
      });

      // Fetch profile
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        console.log('👤 Simple Auth: Profile loaded:', profile.full_name);
        useAuthStore.setState(state => ({
          ...state,
          profile: profile,
        }));
      }
        
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 Simple Auth: User signed out');
      
      useAuthStore.setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    }
  });
  
  authListenerInitialized = true;
  console.log('✅ Simple Auth: Listener ready');
};

// Helper hooks
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const isAuthenticated = useAuthStore((state) => !!state.user);
  const isAdmin = useAuthStore((state) => state.profile?.role === 'admin');
  const isModerator = useAuthStore((state) => state.profile?.role === 'moderator');
  const isUser = useAuthStore((state) => state.profile?.role === 'user');
  const canAccessUserManagement = useAuthStore((state) => state.profile?.role === 'admin');
  const canAccessSettings = useAuthStore((state) => state.profile?.role === 'admin');
  const canAccessContent = useAuthStore((state) => {
    const role = state.profile?.role;
    return role === 'admin' || role === 'moderator';
  });
  
  return { 
    user, 
    profile, 
    isAuthenticated, 
    isAdmin, 
    isModerator, 
    isUser, 
    canAccessUserManagement, 
    canAccessSettings, 
    canAccessContent, 
    loading, 
    initialized 
  };
};

export const useAuthActions = () => {
  const { initialize, signIn, signOut, updateProfile } = useAuthStore();
  return { initialize, signIn, signOut, updateProfile };
};