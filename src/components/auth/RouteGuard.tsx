"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/providers/ThemeProvider';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export default function RouteGuard({ 
  children, 
  requireAuth = false, 
  redirectTo = '/login',
  allowedRoles = []
}: RouteGuardProps) {
  // We don't need this component at all - it's causing issues
  // Auth checking should be done in AdminLayout and login page directly
  return <>{children}</>;
}

// Convenient wrapper components
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={['admin']}>
      {children}
    </RouteGuard>
  );
}

export function ModeratorRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={['admin', 'moderator']}>
      {children}
    </RouteGuard>
  );
}