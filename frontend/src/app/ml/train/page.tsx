'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrainRequest, TrainResponse } from '@/types/ml';
import { trainModel } from '@/lib/mlApi';
import TrainingForm from '@/components/ml/TrainingForm';

export default function TrainModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TrainRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await trainModel(data);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Train New Model</h1>
          <p className="text-gray-600 mt-2">
            Train a machine learning model to detect anomalous traffic patterns
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <TrainingForm onSubmit={handleSubmit} isLoading={loading} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-900">Training Completed!</h2>
              <span className="text-2xl">✓</span>
            </div>

            <div className="space-y-2 text-sm text-green-800">
              <p>
                <strong>Model ID:</strong> {result.model_id}
              </p>
              <p>
                <strong>Name:</strong> {result.name}
              </p>
              <p>
                <strong>Algorithm:</strong> {result.algorithm}
              </p>
              <p>
                <strong>Training Period:</strong> {result.start_date} ~ {result.end_date}
              </p>
              <p>
                <strong>Training Samples:</strong> {result.training_samples.toLocaleString()}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(result.created_at).toLocaleString()}
              </p>
              {result.params && (
                <p>
                  <strong>Parameters:</strong> {JSON.stringify(result.params, null, 2)}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => router.push(`/ml/analyze?model_id=${result.model_id}`)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
              >
                Analyze Logs with This Model
              </button>
              <button
                onClick={() => router.push('/ml/models')}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                View All Models
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Train Another Model
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
