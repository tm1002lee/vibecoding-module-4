'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MLModel } from '@/types/ml';
import { getMLModels } from '@/lib/mlApi';
import StatisticsCard from '@/components/charts/StatisticsCard';
import ModelCard from '@/components/ml/ModelCard';

export default function MLDashboard() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const modelsData = await getMLModels({ limit: 5 });
        setModels(modelsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ML Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Machine Learning based anomaly detection system
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatisticsCard
            title="Total Models"
            value={models.length}
            subtitle="Trained ML models"
            color="blue"
          />
          <StatisticsCard
            title="Analyzed Logs"
            value="N/A"
            subtitle="Total logs processed"
            color="green"
          />
          <StatisticsCard
            title="Anomalies Detected"
            value="N/A"
            subtitle="Suspicious traffic found"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/ml/train"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Train New Model
            </Link>
            <Link
              href="/ml/analyze"
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
            >
              Analyze Logs
            </Link>
            <Link
              href="/ml/statistics"
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              View Statistics
            </Link>
            <Link
              href="/ml/models"
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Manage Models
            </Link>
          </div>
        </div>

        {/* Recent Models */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Models</h2>
            <Link href="/ml/models" className="text-sm text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {models.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No models trained yet. Start by training your first model!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.slice(0, 3).map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
