"use client";

import { useEffect } from 'react';
import { useAuthStore, setupAuthListener } from '@/stores/auth-clean';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        
        // Setup auth listener first
        setupAuthListener();
        
        // Then initialize auth state
        await useAuthStore.getState().initialize();
        
      } catch (error) {
        console.error('❌ AuthInitializer: Auth initialization failed:', error);
      }
    };

    initializeAuth();
  }, []);

  // Always render immediately - NEVER block public pages
  return <>{children}</>;
}