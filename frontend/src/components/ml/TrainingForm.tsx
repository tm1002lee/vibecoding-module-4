'use client';

import { useState } from 'react';
import { TrainRequest } from '@/types/ml';

interface TrainingFormProps {
  onSubmit: (data: TrainRequest) => void;
  isLoading?: boolean;
}

export default function TrainingForm({ onSubmit, isLoading }: TrainingFormProps) {
  const [formData, setFormData] = useState<TrainRequest>({
    name: '',
    start_date: '',
    end_date: '',
    algorithm: 'isolation_forest',
    params: {
      contamination: 0.1,
      n_estimators: 100,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert date strings to ISO datetime format
    const submitData: TrainRequest = {
      ...formData,
      start_date: formData.start_date ? `${formData.start_date}T00:00:00Z` : '',
      end_date: formData.end_date ? `${formData.end_date}T23:59:59Z` : '',
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Model Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="algorithm" className="block text-sm font-medium text-gray-700">
          Algorithm
        </label>
        <select
          id="algorithm"
          value={formData.algorithm}
          onChange={(e) =>
            setFormData({ ...formData, algorithm: e.target.value as 'isolation_forest' })
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="isolation_forest">Isolation Forest</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Hyperparameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contamination"
              className="block text-sm font-medium text-gray-700"
            >
              Contamination (0-1)
            </label>
            <input
              type="number"
              id="contamination"
              step="0.01"
              min="0"
              max="1"
              value={formData.params?.contamination}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...formData.params, contamination: parseFloat(e.target.value) },
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="n_estimators"
              className="block text-sm font-medium text-gray-700"
            >
              N Estimators
            </label>
            <input
              type="number"
              id="n_estimators"
              step="1"
              min="10"
              max="1000"
              value={formData.params?.n_estimators}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  params: { ...formData.params, n_estimators: parseInt(e.target.value) },
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Training...' : 'Start Training'}
      </button>
    </form>
  );
}
