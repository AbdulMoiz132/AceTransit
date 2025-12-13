export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-teal-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900 p-4">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            AceTransit
          </h1>
          <div className="mt-3 h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4 font-medium px-4">
          Smart Courier. Swift Delivery.
        </p>

        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 px-4">
          Premium AI-assisted courier platform for home-to-home deliveries with real-time tracking and smart billing.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
            ⚡ Lightning Fast
          </span>
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
            🧠 AI-Powered
          </span>
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
            📍 Real-Time Tracking
          </span>
          <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
            💎 Premium Experience
          </span>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Project Initialized Successfully
          </span>
        </div>

        {/* Footer Note */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Next.js • TypeScript • Tailwind CSS • Framer Motion
          </p>
        </div>
      </main>
    </div>
  );
}
