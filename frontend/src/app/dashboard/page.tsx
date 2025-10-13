import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import StatsPanel from "@/app/components/StatsPanel";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <StatsPanel />
      </div>
    </ProtectedRoute>
  );
}
