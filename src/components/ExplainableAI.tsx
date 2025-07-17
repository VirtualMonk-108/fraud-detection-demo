'use client';

import { FraudDetectionResult } from '@/lib/fraud-detection';
import { AlertTriangle, Shield, Eye, TrendingUp } from 'lucide-react';

interface ExplainableAIProps {
  result: FraudDetectionResult;
  transactionId: string;
}

export default function ExplainableAI({ result, transactionId }: ExplainableAIProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'text-green-600 bg-green-50';
      case 'review': return 'text-yellow-600 bg-yellow-50';
      case 'block': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return <Shield className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'block': return <AlertTriangle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevelText = (score: number) => {
    if (score >= 80) return 'Very High Risk';
    if (score >= 60) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Explanation - Transaction {transactionId}
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRecommendationColor(result.recommendation)}`}>
          {getRecommendationIcon(result.recommendation)}
          {result.recommendation.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getRiskLevelColor(result.riskScore)}`}>
            {result.riskScore}%
          </div>
          <div className="text-sm text-gray-600">Risk Score</div>
          <div className={`text-xs ${getRiskLevelColor(result.riskScore)}`}>
            {getRiskLevelText(result.riskScore)}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {(result.confidence * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">
            v{result.modelVersion}
          </div>
          <div className="text-sm text-gray-600">Model Version</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Risk Factors Detected:</h4>
        {result.reasons.length > 0 ? (
          <ul className="space-y-2">
            {result.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            No significant risk factors detected
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Decision Process:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Risk score calculated based on transaction patterns</p>
          <p>• Compared against model threshold</p>
          <p>• Confidence level determined by feature strength</p>
          <p>• Final recommendation generated based on risk assessment</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Model Explanation:</strong> This decision was made using our fraud detection model 
          that analyzes transaction patterns, user behavior, and contextual factors to assess risk 
          in real-time.
        </p>
      </div>
    </div>
  );
}