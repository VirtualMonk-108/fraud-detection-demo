'use client';

import { useState, useEffect } from 'react';
import { Transaction, generateTransaction } from '@/lib/transaction-generator';
import { FraudDetectionEngine, FraudDetectionResult } from '@/lib/fraud-detection';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MapPin,
  CreditCard,
  Play,
  Pause
} from 'lucide-react';
import ExplainableAI from './ExplainableAI';

interface TransactionWithResult extends Transaction {
  result: FraudDetectionResult;
}

export default function RealTimeDashboard() {
  const [transactions, setTransactions] = useState<TransactionWithResult[]>([]);
  const [fraudEngine] = useState(() => new FraudDetectionEngine());
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithResult | null>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    flaggedTransactions: 0,
    blockedTransactions: 0,
    averageRiskScore: 0
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        const newTransaction = generateTransaction(transactions);
        const result = fraudEngine.analyzeTransaction(newTransaction);
        fraudEngine.addTransaction(newTransaction);
        
        const transactionWithResult: TransactionWithResult = {
          ...newTransaction,
          result
        };
        
        setTransactions(prev => [transactionWithResult, ...prev.slice(0, 99)]);
        
        setStats(prev => ({
          totalTransactions: prev.totalTransactions + 1,
          flaggedTransactions: prev.flaggedTransactions + (result.riskScore >= 60 ? 1 : 0),
          blockedTransactions: prev.blockedTransactions + (result.isBlocked ? 1 : 0),
          averageRiskScore: ((prev.averageRiskScore * prev.totalTransactions + result.riskScore) / (prev.totalTransactions + 1))
        }));
      }, 2000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, transactions, fraudEngine]);

  const getStatusColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'block': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return <Shield className="w-4 h-4" />;
      case 'review': return <AlertTriangle className="w-4 h-4" />;
      case 'block': return <AlertTriangle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Real-Time Fraud Detection Dashboard
          </h1>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
              isRunning 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Transactions</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.flaggedTransactions}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Transactions</p>
                <p className="text-2xl font-bold text-red-600">{stats.blockedTransactions}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRiskScore.toFixed(1)}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Live Transaction Feed</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Click "Start Monitoring" to begin tracking transactions
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(transaction.result.recommendation)}`}>
                          {getStatusIcon(transaction.result.recommendation)}
                          {transaction.result.recommendation}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Risk: {transaction.result.riskScore}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {transaction.merchant}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(transaction.timestamp, 'HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            {selectedTransaction ? (
              <ExplainableAI
                result={selectedTransaction.result}
                transactionId={selectedTransaction.id.slice(-8)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Transaction Analysis
                </h3>
                <div className="text-center text-gray-500 py-12">
                  Select a transaction from the feed to see detailed analysis
                </div>
              </div>
            )}
          </div>
        </div>

        {isRunning && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Live monitoring active - New transactions appear every 2 seconds
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}