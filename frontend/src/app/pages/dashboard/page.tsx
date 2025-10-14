// src/app/dashboard/page.tsx
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import StatsPanel from "@/app/components/StatsPanel";
import LogoutButton from "@/features/auth/components/LogoutButton"; // Adjust path as needed

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        {/* Header with title and logout button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <LogoutButton />
        </div>
        
        {/* Dashboard content */}
        <StatsPanel />
        
        {/* You can add more dashboard content here */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">
            This is your personal dashboard where you can track your activities and statistics.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}