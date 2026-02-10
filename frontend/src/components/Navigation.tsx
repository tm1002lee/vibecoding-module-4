import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
            >
              Home
            </Link>
            <Link
              href="/logs"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Logs
            </Link>
            <Link
              href="/alerts"
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Alerts
            </Link>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-800">
              방화벽 트래픽 로그 분석 시스템
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
