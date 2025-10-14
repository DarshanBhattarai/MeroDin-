// src/app/landing/components/HeroSection.tsx
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-6">
            Welcome to Mero Din
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your personal journal and daily reflection companion. Capture your thoughts, 
            track your mood, and reflect on your journey in a secure, private space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/auth/register" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </Link>
            <Link 
              href="/auth/login" 
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 font-semibold text-lg transition-colors"
            >
              Continue Your Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}