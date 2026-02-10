'use client';

import { useEffect, useState } from 'react';
import { MLModel } from '@/types/ml';
import { getMLModels, deleteMLModel } from '@/lib/mlApi';
import ModelCard from '@/components/ml/ModelCard';

export default function ModelsPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'single' | 'merged'>('all');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    loadModels();
  }, [filter]);

  const loadModels = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};
      if (filter === 'single') params.is_merged = false;
      if (filter === 'merged') params.is_merged = true;

      const data = await getMLModels(params);
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId: number) => {
    if (!confirm('Are you sure you want to delete this model?')) {
      return;
    }

    setDeleteLoading(modelId);

    try {
      await deleteMLModel(modelId);
      setModels((prev) => prev.filter((model) => model.id !== modelId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete model');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Model Management</h1>
          <p className="text-gray-600 mt-2">View and manage trained ML models</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Models
              </button>
              <button
                onClick={() => setFilter('single')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  filter === 'single'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Models
              </button>
              <button
                onClick={() => setFilter('merged')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  filter === 'merged'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Merged Models
              </button>
            </div>
            <div className="ml-auto text-sm text-gray-600">{models.length} models found</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading models...</p>
          </div>
        )}

        {/* Models List */}
        {!loading && !error && (
          <>
            {models.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 mb-4">
                  {filter === 'all'
                    ? 'No models found. Start by training your first model!'
                    : `No ${filter} models found.`}
                </p>
                <a
                  href="/ml/train"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Train New Model
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="relative">
                    {deleteLoading === model.id && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      </div>
                    )}
                    <ModelCard model={model} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Model Details Table */}
        {!loading && !error && models.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Algorithm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Training Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Samples
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {models.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {model.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.algorithm || 'isolation_forest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.start_date} ~ {model.end_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.training_samples?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(model.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {model.is_merged ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Merged
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Single
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
