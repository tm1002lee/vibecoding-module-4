import { TrafficLog } from './traffic';

export interface Alert {
  id: number;
  traffic_log_id: number;
  risk_score: number;
  ml_model_id: number;
  detected_at: string;
  description: string | null;
}

export interface MLModel {
  id: number;
  name: string;
  created_at: string;
}

export interface AlertDetail extends Alert {
  traffic_log: TrafficLog;
  ml_model: MLModel;
}
