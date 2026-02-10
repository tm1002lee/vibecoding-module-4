'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  color?: string;
  title?: string;
}

export default function BarChart({
  data,
  height = 300,
  color = '#6366f1',
  title,
}: BarChartProps) {
  return (
    <div>
      {title && <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill={color} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
