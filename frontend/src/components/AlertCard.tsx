import { AlertDetail } from '@/types/alert';

interface AlertCardProps {
  alert: AlertDetail;
}

function getRiskColor(riskScore: number): string {
  if (riskScore >= 71) return 'border-red-500 bg-red-50';
  if (riskScore >= 31) return 'border-yellow-500 bg-yellow-50';
  return 'border-green-500 bg-green-50';
}

function getRiskBadgeColor(riskScore: number): string {
  if (riskScore >= 71) return 'bg-red-500 text-white';
  if (riskScore >= 31) return 'bg-yellow-500 text-white';
  return 'bg-green-500 text-white';
}

function getRiskLabel(riskScore: number): string {
  if (riskScore >= 71) return '높음';
  if (riskScore >= 31) return '중간';
  return '낮음';
}

export default function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className={`border-l-4 rounded-lg p-6 shadow-sm ${getRiskColor(alert.risk_score)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Alert #{alert.id}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(alert.detected_at).toLocaleString('ko-KR')}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBadgeColor(alert.risk_score)}`}>
            {getRiskLabel(alert.risk_score)}: {alert.risk_score}
          </span>
        </div>
      </div>

      {alert.description && (
        <p className="text-gray-700 mb-4">{alert.description}</p>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">관련 트래픽</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">출발지:</span>
            <span className="ml-2 font-mono text-gray-900">
              {alert.traffic_log.src_ip}:{alert.traffic_log.src_port}
            </span>
          </div>
          <div>
            <span className="text-gray-500">목적지:</span>
            <span className="ml-2 font-mono text-gray-900">
              {alert.traffic_log.dst_ip}:{alert.traffic_log.dst_port}
            </span>
          </div>
          <div>
            <span className="text-gray-500">프로토콜:</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
              {alert.traffic_log.protocol}
            </span>
          </div>
          <div>
            <span className="text-gray-500">패킷/바이트:</span>
            <span className="ml-2 text-gray-900">
              {alert.traffic_log.packets} / {alert.traffic_log.bytes.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">탐지 모델</h4>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{alert.ml_model.name}</span>
          <span className="text-gray-400 ml-2">
            (생성: {new Date(alert.ml_model.created_at).toLocaleDateString('ko-KR')})
          </span>
        </p>
      </div>
    </div>
  );
}
