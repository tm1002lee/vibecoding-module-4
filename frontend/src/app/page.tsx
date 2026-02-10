'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrafficLog } from '@/types/traffic';
import { Alert } from '@/types/alert';

export default function Home() {
  const [recentLogs, setRecentLogs] = useState<TrafficLog[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalAlerts, setTotalAlerts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/logs?limit=5').then((res) => res.json()),
      fetch('/api/alerts?limit=5').then((res) => res.json()),
      fetch('/api/logs?limit=1000').then((res) => res.json()),
      fetch('/api/alerts?limit=1000').then((res) => res.json()),
    ])
      .then(([logs, alerts, allLogs, allAlerts]) => {
        setRecentLogs(logs);
        setRecentAlerts(alerts);
        setTotalLogs(allLogs.length);
        setTotalAlerts(allAlerts.length);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">총 로그 수</h2>
            <p className="text-4xl font-bold text-indigo-600">{totalLogs.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">최근 경고 수</h2>
            <p className="text-4xl font-bold text-red-600">{totalAlerts.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">최근 로그</h2>
              <Link
                href="/logs"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                더보기 →
              </Link>
            </div>
            <div className="p-6">
              {recentLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">로그가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {log.protocol}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {log.src_ip}:{log.src_port} → {log.dst_ip}:{log.dst_port}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">최근 경고</h2>
              <Link
                href="/alerts"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                더보기 →
              </Link>
            </div>
            <div className="p-6">
              {recentAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">경고가 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border-l-4 pl-4 py-2 ${
                        alert.risk_score >= 71
                          ? 'border-red-500'
                          : alert.risk_score >= 31
                          ? 'border-yellow-500'
                          : 'border-green-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          Alert #{alert.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            alert.risk_score >= 71
                              ? 'bg-red-500 text-white'
                              : alert.risk_score >= 31
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {alert.risk_score}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {alert.description || '설명 없음'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.detected_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
