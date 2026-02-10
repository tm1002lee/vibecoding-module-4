'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TimeSeriesData {
  time: string;
  anomalies: number;
  normal: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  height?: number;
}

export default function TimeSeriesChart({ data, height = 300 }: TimeSeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="anomalies"
          stroke="#ef4444"
          name="Anomalies"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="normal"
          stroke="#10b981"
          name="Normal"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
