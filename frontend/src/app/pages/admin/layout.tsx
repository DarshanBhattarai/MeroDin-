// src/app/admin/layout.tsx
import AdminLayout from '@/app/layouts/AdminLayout'; // Global admin protection
import AdminLayoutClient from '@/features/admin/components/layouts/AdminLayout'; // Admin UI layout

export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout> {/* Global admin protection */}
      <AdminLayoutClient> {/* Admin sidebar/header UI */}
        {children}
      </AdminLayoutClient>
    </AdminLayout>
  );
}