// src/app/layouts/AdminLayout.tsx - Global admin wrapper (optional)
'use client';

import  useAuth  from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user as any).role !== 'ADMIN')) {
      router.replace('/pages/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user as any).role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}