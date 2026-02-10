import { TrafficLog } from '@/types/traffic';
import { Alert, AlertDetail } from '@/types/alert';

export interface LogsParams {
  skip?: number;
  limit?: number;
  src_ip?: string;
  dst_ip?: string;
  protocol?: string;
  start_time?: string;
  end_time?: string;
}

export interface AlertsParams {
  skip?: number;
  limit?: number;
  min_risk_score?: number;
  start_time?: string;
  end_time?: string;
}

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

// Traffic Logs API
export async function fetchTrafficLogs(params: LogsParams = {}): Promise<TrafficLog[]> {
  const queryString = buildQueryString(params);
  const response = await fetch(`/api/logs${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchTrafficLogById(id: number): Promise<TrafficLog> {
  const response = await fetch(`/api/logs/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch log ${id}: ${response.statusText}`);
  }

  return response.json();
}

// Alerts API
export async function fetchAlerts(params: AlertsParams = {}): Promise<Alert[]> {
  const queryString = buildQueryString(params);
  const response = await fetch(`/api/alerts${queryString}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAlertById(id: number): Promise<AlertDetail> {
  const response = await fetch(`/api/alerts/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch alert ${id}: ${response.statusText}`);
  }

  return response.json();
}
