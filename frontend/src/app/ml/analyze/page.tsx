'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MLModel, AnalysisResponse } from '@/types/ml';
import { TrafficLog } from '@/types/traffic';
import { getMLModels, analyzeLog } from '@/lib/mlApi';
import { fetchTrafficLogs } from '@/lib/api';
import AnalysisResults from '@/components/ml/AnalysisResults';

export default function AnalyzeLogsPage() {
  const searchParams = useSearchParams();
  const initialModelId = searchParams.get('model_id');

  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || '');
  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const modelsData = await getMLModels();
        setModels(modelsData);
      } catch (err) {
        console.error('Failed to load models:', err);
      }
    }
    loadModels();
  }, []);

  useEffect(() => {
    async function loadLogs() {
      setLoadingLogs(true);
      try {
        const logsData = await fetchTrafficLogs({ limit: 50 });
        setLogs(logsData);
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        setLoadingLogs(false);
      }
    }
    loadLogs();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedModelId) {
      setError('Please select a model');
      return;
    }

    if (selectedLogs.length === 0) {
      setError('Please select at least one log to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const logsToAnalyze = logs.filter((log) => selectedLogs.includes(log.id));
      const response = await analyzeLog({
        model_id: parseInt(selectedModelId),
        logs: logsToAnalyze,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze logs');
    } finally {
      setLoading(false);
    }
  };

  const toggleLogSelection = (logId: number) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((log) => log.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analyze Logs</h1>
          <p className="text-gray-600 mt-2">
            Select logs and a model to detect anomalous traffic patterns
          </p>
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Model</h2>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="">-- Select a model --</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                #{model.id} - {model.name} ({model.start_date} ~ {model.end_date})
              </option>
            ))}
          </select>
        </div>

        {/* Log Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Logs</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedLogs.length} / {logs.length} selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {selectedLogs.length === logs.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {loadingLogs ? (
            <div className="text-center py-8 text-gray-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No logs available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedLogs.length === logs.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Protocol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Packets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bytes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={
                        selectedLogs.includes(log.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLogs.includes(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.src_ip}:{log.src_port}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.dst_ip}:{log.dst_port}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.protocol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.packets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.bytes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !selectedModelId || selectedLogs.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Selected Logs'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (() => {
          // Calculate summary from results
          const summary = {
            total_analyzed: result.results.length,
            anomalies_detected: result.results.filter(r => r.is_anomaly).length,
            anomaly_rate: result.results.length > 0
              ? result.results.filter(r => r.is_anomaly).length / result.results.length
              : 0
          };

          return (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Analyzed</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {summary.total_analyzed}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Anomalies Detected</div>
                  <div className="text-2xl font-bold text-red-900">
                    {summary.anomalies_detected}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 font-medium">Anomaly Rate</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {(summary.anomaly_rate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <AnalysisResults results={result.results} />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
