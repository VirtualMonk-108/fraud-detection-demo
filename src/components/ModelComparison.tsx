'use client';

import { useState, useEffect } from 'react';
import { FraudDetectionEngine, ModelVersion } from '@/lib/fraud-detection';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export default function ModelComparison() {
  const [fraudEngine] = useState(() => new FraudDetectionEngine());
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [activeModelId, setActiveModelId] = useState<string>('');
  const [performanceData, setPerformanceData] = useState([
    { name: 'Week 1', v1_accuracy: 85, v2_accuracy: 92, v3_accuracy: 96, v1_fp: 12, v2_fp: 6, v3_fp: 3 },
    { name: 'Week 2', v1_accuracy: 87, v2_accuracy: 93, v3_accuracy: 97, v1_fp: 11, v2_fp: 5, v3_fp: 2 },
    { name: 'Week 3', v1_accuracy: 84, v2_accuracy: 91, v3_accuracy: 95, v1_fp: 13, v2_fp: 7, v3_fp: 4 },
    { name: 'Week 4', v1_accuracy: 86, v2_accuracy: 94, v3_accuracy: 98, v1_fp: 12, v2_fp: 4, v3_fp: 1 },
  ]);

  useEffect(() => {
    const modelData = fraudEngine.getModels();
    setModels(modelData);
    setActiveModelId(modelData.find(m => m.isActive)?.id || '');
  }, [fraudEngine]);

  const handleModelChange = (modelId: string) => {
    fraudEngine.setActiveModel(modelId);
    setActiveModelId(modelId);
    setModels(fraudEngine.getModels());
  };

  const getModelMetrics = (model: ModelVersion) => {
    const precision = 1 - model.falsePositiveRate;
    const recall = 1 - model.falseNegativeRate;
    const f1Score = 2 * (precision * recall) / (precision + recall);
    
    return {
      precision: precision * 100,
      recall: recall * 100,
      f1Score: f1Score * 100
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Model Performance Comparison
          </h1>
          <p className="text-gray-600">
            Compare different fraud detection model versions and their performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {models.map((model) => {
            const metrics = getModelMetrics(model);
            const isActive = model.id === activeModelId;
            
            return (
              <div
                key={model.id}
                className={`bg-white rounded-lg shadow-lg border-2 ${
                  isActive ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600">Version {model.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleModelChange(model.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-blue-100 text-blue-800 cursor-default'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {isActive ? 'Current' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(model.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {(model.falsePositiveRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">False Positive Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {metrics.precision.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Precision</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {metrics.recall.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Recall</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Risk Threshold:</span>
                      <span className="font-medium">{model.threshold}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">F1 Score:</span>
                      <span className="font-medium">{metrics.f1Score.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Accuracy Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="v1_accuracy"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Model v1.0"
                />
                <Line
                  type="monotone"
                  dataKey="v2_accuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Model v2.1"
                />
                <Line
                  type="monotone"
                  dataKey="v3_accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Model v3.0"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              False Positive Rates
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="v1_fp" fill="#ef4444" name="Model v1.0" />
                <Bar dataKey="v2_fp" fill="#3b82f6" name="Model v2.1" />
                <Bar dataKey="v3_fp" fill="#10b981" name="Model v3.0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Model Comparison Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-black">Model</th>
                  <th className="text-left py-2 px-4 text-black">Version</th>
                  <th className="text-left py-2 px-4 text-black">Accuracy</th>
                  <th className="text-left py-2 px-4 text-black">False Positive Rate</th>
                  <th className="text-left py-2 px-4 text-black">False Negative Rate</th>
                  <th className="text-left py-2 px-4 text-black">Precision</th>
                  <th className="text-left py-2 px-4 text-black">Recall</th>
                  <th className="text-left py-2 px-4 text-black">Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => {
                  const metrics = getModelMetrics(model);
                  const isActive = model.id === activeModelId;
                  
                  return (
                    <tr key={model.id} className={`border-b ${isActive ? 'bg-blue-50' : ''}`}>
                      <td className="py-2 px-4 font-medium text-black">{model.name}</td>
                      <td className="py-2 px-4 text-black">{model.version}</td>
                      <td className="py-2 px-4 text-black">{(model.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-2 px-4 text-black">{(model.falsePositiveRate * 100).toFixed(1)}%</td>
                      <td className="py-2 px-4 text-black">{(model.falseNegativeRate * 100).toFixed(1)}%</td>
                      <td className="py-2 px-4 text-black">{metrics.precision.toFixed(1)}%</td>
                      <td className="py-2 px-4 text-black">{metrics.recall.toFixed(1)}%</td>
                      <td className="py-2 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Model Performance Analysis</p>
              <p className="text-sm text-yellow-700 mt-1">
                Model v3.0 shows the best overall performance with 96% accuracy and only 3% false positive rate. 
                However, consider the trade-off between accuracy and processing time for real-time applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}