// src/app/landing/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/80 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="font-bold text-2xl text-indigo-900 mb-4">Mero Din</div>
            <p className="text-gray-600 max-w-md">
              Your personal space for daily reflection, mood tracking, and personal growth. 
              Start your journey of self-discovery today.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Navigation</h4>
            <div className="space-y-2">
              <Link href="/landing" className="block text-gray-600 hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <Link href="/auth/login" className="block text-gray-600 hover:text-indigo-600 transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="block text-gray-600 hover:text-indigo-600 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-600 hover:text-indigo-600 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">
            © 2024 Mero Din. Made with ❤️ for mindful living and personal growth.
          </p>
        </div>
      </div>
    </footer>
  );
}