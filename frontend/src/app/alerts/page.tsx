'use client';

import { useEffect, useState } from 'react';
import AlertCard from '@/components/AlertCard';
import Pagination from '@/components/Pagination';
import { AlertDetail } from '@/types/alert';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDetail[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, riskFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts?limit=1000');

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data: AlertDetail[] = await response.json();
      setAlerts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = alerts;

    if (riskFilter === 'high') {
      filtered = filtered.filter((alert) => alert.risk_score >= 71);
    } else if (riskFilter === 'medium') {
      filtered = filtered.filter(
        (alert) => alert.risk_score >= 31 && alert.risk_score <= 70
      );
    } else if (riskFilter === 'low') {
      filtered = filtered.filter((alert) => alert.risk_score <= 30);
    }

    setFilteredAlerts(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadAlerts();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">경고를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold mb-2">오류 발생</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">경고 목록</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            새로고침
          </button>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위험도
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">전체</option>
                <option value="high">높음 (71-100)</option>
                <option value="medium">중간 (31-70)</option>
                <option value="low">낮음 (0-30)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setRiskFilter('')}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                필터 초기화
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            총 {filteredAlerts.length}개 경고 (전체 {alerts.length}개)
          </div>
        </div>

        {paginatedAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">표시할 경고가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {filteredAlerts.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredAlerts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </main>
  );
}
