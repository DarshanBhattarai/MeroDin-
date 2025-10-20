'use client';

import { Provider } from "react-redux";
import { store } from "@/app/store";
import useAuth from '@/features/auth/hooks/useAuth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        {/* Public header/navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Your App</h1>
              </div>
              <nav className="flex items-center space-x-4">
                {user ? (
                  <a href="/dashboard" className="text-gray-700 hover:text-gray-900">
                    Dashboard
                  </a>
                ) : (
                  <>
                    <a href="/pages/auth/login" className="text-gray-700 hover:text-gray-900">
                      Login
                    </a>
                    <a href="/pages/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Sign Up
                    </a>
                  </>
                )}
              </nav>
            </div>
          </div>
        </header>
        
        <main>{children}</main>
      </div>
    </Provider>
  );
}
