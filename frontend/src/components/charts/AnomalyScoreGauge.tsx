'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnomalyScoreGaugeProps {
  score: number; // 0-1
  size?: number;
}

export default function AnomalyScoreGauge({ score, size = 200 }: AnomalyScoreGaugeProps) {
  const percentage = Math.round(score * 100);
  const color = score > 0.7 ? '#ef4444' : score > 0.4 ? '#f59e0b' : '#10b981';

  const data = [
    { name: 'Score', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-16">
        <div className="text-3xl font-bold" style={{ color }}>
          {percentage}%
        </div>
        <div className="text-sm text-gray-500 mt-1">Anomaly Score</div>
      </div>
    </div>
  );
}
