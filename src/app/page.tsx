'use client';

import { useState } from 'react';
import RealTimeDashboard from '@/components/RealTimeDashboard';
import ModelComparison from '@/components/ModelComparison';
import { BarChart3, Shield, TrendingUp } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comparison'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">FraudGuard AI</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Live Dashboard
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'comparison'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Model Comparison
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === 'dashboard' ? <RealTimeDashboard /> : <ModelComparison />}
      </main>
    </div>
  );
}
