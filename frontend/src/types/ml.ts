import { TrafficLog } from './traffic';

export interface MLModel {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  model_path: string | null;
  created_at: string;
  is_merged: boolean;
  algorithm?: string;
  params?: Record<string, any>;
  training_samples?: number;
}

export interface TrainRequest {
  name: string;
  start_date: string;
  end_date: string;
  algorithm: 'isolation_forest';
  params?: {
    contamination?: number;
    n_estimators?: number;
  };
}

export interface TrainResponse {
  model_id: number;
  name: string;
  start_date: string;
  end_date: string;
  algorithm: string;
  params: Record<string, any>;
  training_samples: number;
  created_at: string;
}

export interface AnalyzeRequest {
  model_id: number;
  logs: TrafficLog[];
}

export interface AnalysisResult {
  log: TrafficLog;
  anomaly_score: number;
  is_anomaly: boolean;
  confidence: number;
  explanation: string | null;
}

export interface AnalysisResponse {
  model_id: number;
  model_name: string;
  results: AnalysisResult[];
  summary?: {
    total_analyzed: number;
    anomalies_detected: number;
    anomaly_rate: number;
  };
}

export interface StatDetail {
  mean: number;
  std: number;
  min: number;
  max: number;
  threshold_upper: number;
}

export interface Statistics {
  period: {
    start: string;
    end: string;
  };
  statistics: {
    total_logs: number;
    packets: StatDetail;
    bytes: StatDetail;
    top_src_ips: Array<{ ip: string; count: number }>;
    top_dst_ips: Array<{ ip: string; count: number }>;
    protocol_distribution: Record<string, number>;
  };
  anomalies_detected?: number;
}

export interface MLModelsParams {
  skip?: number;
  limit?: number;
  is_merged?: boolean;
}
