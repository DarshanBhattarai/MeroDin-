// src/app/landing/components/FeaturesSection.tsx
const features = [
  {
    icon: "📝",
    title: "Daily Journal",
    description: "Write your thoughts and reflections every day in a secure, private space designed for mindful writing."
  },
  {
    icon: "📊",
    title: "Mood Tracking",
    description: "Track your emotional journey with visual insights and identify patterns that matter to your wellbeing."
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your personal reflections are encrypted and accessible only to you. Your privacy is our priority."
  },
  {
    icon: "📱",
    title: "Always Accessible",
    description: "Access your journal from any device, anywhere. Your thoughts are always within reach."
  },
  {
    icon: "🎯",
    title: "Goal Setting",
    description: "Set personal goals and track your progress alongside your daily reflections and mood patterns."
  },
  {
    icon: "🌱",
    title: "Personal Growth",
    description: "Watch your personal development unfold through consistent reflection and self-awareness."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">
            Everything You Need for Mindful Living
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mero Din provides all the tools you need to cultivate self-awareness and personal growth through daily reflection.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}