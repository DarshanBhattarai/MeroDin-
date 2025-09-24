export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">
          Welcome to Mero Din
        </h1>
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
          <p className="text-gray-600">
            Start writing your thoughts for today...
          </p>
        </div>
      </div>
    </div>
  );
}
