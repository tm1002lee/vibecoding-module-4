import { MLModel } from '@/types/ml';
import Link from 'next/link';

interface ModelCardProps {
  model: MLModel;
  onDelete?: (modelId: number) => void;
}

export default function ModelCard({ model, onDelete }: ModelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
          <p className="text-sm text-gray-500 mt-1">ID: {model.id}</p>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Algorithm:</span>{' '}
              {model.algorithm || 'isolation_forest'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Period:</span>{' '}
              {model.start_date} ~ {model.end_date}
            </p>
            {model.training_samples && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Samples:</span> {model.training_samples}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Created:</span>{' '}
              {new Date(model.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="ml-4">
          {model.is_merged ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Merged
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Single
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/ml/analyze?model_id=${model.id}`}
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Analyze
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(model.id)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
