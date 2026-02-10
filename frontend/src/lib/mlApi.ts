import {
  MLModel,
  TrainRequest,
  TrainResponse,
  AnalyzeRequest,
  AnalysisResponse,
  Statistics,
  MLModelsParams,
} from '@/types/ml';

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// Train Model
export async function trainModel(data: TrainRequest): Promise<TrainResponse> {
  const response = await fetch('/api/ml/train', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Failed to train model');
  }

  return response.json();
}

// Analyze Logs
export async function analyzeLog(data: AnalyzeRequest): Promise<AnalysisResponse> {
  const response = await fetch('/api/ml/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Failed to analyze logs');
  }

  return response.json();
}

// Get Statistics
export async function getStatistics(
  startDate: string,
  endDate: string
): Promise<Statistics> {
  const queryString = buildQueryString({ start_date: startDate, end_date: endDate });
  const response = await fetch(`/api/ml/statistics${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  }

  return response.json();
}

// Get ML Models
export async function getMLModels(params: MLModelsParams = {}): Promise<MLModel[]> {
  const queryString = buildQueryString(params);
  const response = await fetch(`/api/ml/models${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ML models: ${response.statusText}`);
  }

  return response.json();
}

// Get ML Model by ID
export async function getMLModel(modelId: number): Promise<MLModel> {
  const response = await fetch(`/api/ml/models/${modelId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ML model ${modelId}: ${response.statusText}`);
  }

  return response.json();
}

// Delete ML Model
export async function deleteMLModel(modelId: number): Promise<void> {
  const response = await fetch(`/api/ml/models/${modelId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Failed to delete model');
  }
}
