interface AnomalyBadgeProps {
  isAnomaly: boolean;
  score?: number;
}

export default function AnomalyBadge({ isAnomaly, score }: AnomalyBadgeProps) {
  if (isAnomaly) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Anomaly {score !== undefined && `(${(score * 100).toFixed(1)}%)`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Normal {score !== undefined && `(${(score * 100).toFixed(1)}%)`}
    </span>
  );
}
