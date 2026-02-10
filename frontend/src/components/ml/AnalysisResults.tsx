import { AnalysisResult } from '@/types/ml';
import AnomalyBadge from './AnomalyBadge';

interface AnalysisResultsProps {
  results: AnalysisResult[];
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  // 설명 텍스트를 파싱하여 리스트로 변환
  const parseExplanation = (explanation: string | null) => {
    if (!explanation) return null;

    // " | "로 구분된 여러 이유를 분리
    const reasons = explanation.split(' | ').map(r => r.trim());
    return reasons;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source IP
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination IP
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Protocol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Packets
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bytes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Anomaly Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
              위험 원인
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result, index) => {
            const explanationParts = parseExplanation(result.explanation);

            return (
              <tr
                key={index}
                className={result.is_anomaly ? 'bg-red-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.log.src_ip}:{result.log.src_port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.log.dst_ip}:{result.log.dst_port}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.log.protocol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.log.packets}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.log.bytes}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        result.anomaly_score > 0.7
                          ? '#ef4444'
                          : result.anomaly_score > 0.4
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  >
                    {(result.anomaly_score * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <AnomalyBadge isAnomaly={result.is_anomaly} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(result.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-sm min-w-[300px]">
                  {!result.explanation ? (
                    <span className="text-gray-500">{result.is_anomaly ? '-' : '정상'}</span>
                  ) : explanationParts && explanationParts.length > 1 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {explanationParts.map((reason, idx) => (
                        <li key={idx} className="text-red-700 font-medium">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-red-700 font-medium">{result.explanation}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
