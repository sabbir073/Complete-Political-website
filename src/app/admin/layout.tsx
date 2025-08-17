"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/RouteGuard';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}