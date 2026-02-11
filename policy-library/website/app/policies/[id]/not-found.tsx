import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Policy Not Found</h2>
          <p className="text-gray-600">
            The policy you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/policies?type=covered_entity"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse CE Policies
          </Link>
          <Link
            href="/policies?type=business_associate"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Browse BA Policies
          </Link>
        </div>
      </div>
    </div>
  );
}
