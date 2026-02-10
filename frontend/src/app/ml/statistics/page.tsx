'use client';

import { useState } from 'react';
import { Statistics } from '@/types/ml';
import { getStatistics } from '@/lib/mlApi';
import StatisticsCard from '@/components/charts/StatisticsCard';
import BarChart from '@/components/charts/BarChart';

export default function StatisticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getStatistics(startDate, endDate);
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistics Analysis</h1>
          <p className="text-gray-600 mt-2">
            View traffic statistics and anomaly detection insights
          </p>
        </div>

        {/* Date Selection Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex-1">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Get Statistics'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Statistics Display */}
        {statistics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatisticsCard
                title="Total Logs"
                value={statistics.statistics.total_logs.toLocaleString()}
                subtitle={`${statistics.period.start} ~ ${statistics.period.end}`}
                color="blue"
              />
              <StatisticsCard
                title="Avg Packets"
                value={statistics.statistics.packets.mean.toFixed(2)}
                subtitle={`Std: ${statistics.statistics.packets.std.toFixed(2)}`}
                color="green"
              />
              <StatisticsCard
                title="Avg Bytes"
                value={statistics.statistics.bytes.mean.toFixed(0)}
                subtitle={`Std: ${statistics.statistics.bytes.std.toFixed(0)}`}
                color="yellow"
              />
              {statistics.anomalies_detected !== undefined && (
                <StatisticsCard
                  title="Anomalies"
                  value={statistics.anomalies_detected}
                  subtitle="Detected anomalies"
                  color="red"
                />
              )}
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Packets Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Packets Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mean:</span>
                    <span className="font-medium">{statistics.statistics.packets.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Dev:</span>
                    <span className="font-medium">{statistics.statistics.packets.std.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-medium">{statistics.statistics.packets.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-medium">{statistics.statistics.packets.max}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Threshold (Upper):</span>
                    <span className="font-medium text-red-600">
                      {statistics.statistics.packets.threshold_upper.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bytes Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bytes Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mean:</span>
                    <span className="font-medium">{statistics.statistics.bytes.mean.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Dev:</span>
                    <span className="font-medium">{statistics.statistics.bytes.std.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-medium">{statistics.statistics.bytes.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-medium">{statistics.statistics.bytes.max}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Threshold (Upper):</span>
                    <span className="font-medium text-red-600">
                      {statistics.statistics.bytes.threshold_upper.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Source IPs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Source IPs</h3>
                <BarChart
                  data={statistics.statistics.top_src_ips.map((item) => ({
                    name: item.ip,
                    value: item.count,
                  }))}
                  height={300}
                  color="#6366f1"
                />
              </div>

              {/* Top Destination IPs */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Destination IPs
                </h3>
                <BarChart
                  data={statistics.statistics.top_dst_ips.map((item) => ({
                    name: item.ip,
                    value: item.count,
                  }))}
                  height={300}
                  color="#8b5cf6"
                />
              </div>

              {/* Protocol Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Protocol Distribution
                </h3>
                <BarChart
                  data={Object.entries(statistics.statistics.protocol_distribution).map(
                    ([protocol, count]) => ({
                      name: protocol,
                      value: count,
                    })
                  )}
                  height={300}
                  color="#10b981"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
