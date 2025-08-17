"use client";

import { useEffect } from 'react';
import { useAuthStore, setupAuthListener } from '@/stores/auth-fixed';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔧 AuthInitializer: Starting auth setup...');
        
        // Setup auth listener first
        console.log('🎧 AuthInitializer: Setting up auth listener...');
        setupAuthListener();
        
        // Then initialize auth state
        console.log('🚀 AuthInitializer: Calling initialize...');
        await useAuthStore.getState().initialize();
        console.log('✅ AuthInitializer: Auth initialization complete');
        
      } catch (error) {
        console.error('❌ AuthInitializer: Auth initialization failed:', error);
      }
    };

    initializeAuth();
  }, []);

  // Always render immediately - NEVER block public pages
  return <>{children}</>;
}