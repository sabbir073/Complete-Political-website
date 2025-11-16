import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';

// State interface
interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => void;
}

// Helper functions
const isAuthenticated = (state: AuthState) => !!state.user;
const isAdmin = (state: AuthState) => state.profile?.role === 'admin';
const canAccessUserManagement = (state: AuthState) => isAdmin(state);
const canAccessSettings = (state: AuthState) => isAdmin(state);
const canAccessContent = (state: AuthState) => isAdmin(state) || state.profile?.role === 'moderator';

// Supabase client
const supabase = createClient();

// Main store
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  
  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        set({ user: null, profile: null, loading: false, initialized: true });
        return;
      }
      
      if (session?.user) {
        set({ user: session.user, loading: false, initialized: true });
        
        // Fetch profile
        try {
          const response = await fetch('/api/admin/users');
          if (response.ok) {
            const result = await response.json();
            const users = result.users || [];
            const profile = users.find((u: Profile) => u.id === session.user.id);
            
            if (profile) {
              set(state => ({ ...state, profile }));
            } else {
              // Default admin profile
              const defaultProfile = {
                id: session.user.id,
                email: 'md.sabbir073@gmail.com',
                full_name: 'S M JAHANGIR HOSSAIN',
                role: 'admin' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              set(state => ({ ...state, profile: defaultProfile }));
            }
          }
        } catch (profileError) {
          console.error('Profile fetch failed:', profileError);
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in failed:', error);
        throw error;
      }
      
      if (data.user) {
        // Fetch and validate profile
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const result = await response.json();
          const users = result.users || [];
          const profile = users.find((u: Profile) => u.id === data.user.id);
          
          if (profile && !profile.is_active) {
            console.error('User account is inactive');
            await supabase.auth.signOut();
            throw new Error('Your account is inactive. Please contact an administrator.');
          }
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out failed:', error);
        throw error;
      }
      
      set({ user: null, profile: null, loading: false, initialized: true });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  updateProfile: (updates: Partial<Profile>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates };
      set(state => ({ ...state, profile: updatedProfile }));
    }
  },
}));

// Auth listener
let authListenerInitialized = false;

export const setupAuthListener = () => {
  if (authListenerInitialized) return;
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      useAuthStore.setState({
        user: session.user,
        loading: false,
        initialized: true,
      });

      // Fetch profile
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const result = await response.json();
          const users = result.users || [];
          const profile = users.find((u: Profile) => u.id === session.user.id);
          
          if (profile) {
            useAuthStore.setState(state => ({ ...state, profile }));
          }
        }
      } catch (error) {
        console.error('Profile fetch in listener failed:', error);
      }
        
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
      });
    }
  });
  
  authListenerInitialized = true;
};

// Helper hooks
export const useAuth = () => {
  const state = useAuthStore();
  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    initialized: state.initialized,
    isAuthenticated: isAuthenticated(state),
    isAdmin: isAdmin(state),
    canAccessUserManagement: canAccessUserManagement(state),
    canAccessSettings: canAccessSettings(state),
    canAccessContent: canAccessContent(state),
  };
};

export const useAuthActions = () => {
  const state = useAuthStore();
  return {
    initialize: state.initialize,
    signIn: state.signIn,
    signOut: state.signOut,
    updateProfile: state.updateProfile,
  };
};