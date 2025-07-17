import { Transaction } from './transaction-generator';

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  threshold: number;
  accuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  isActive: boolean;
}

export interface FraudDetectionResult {
  isBlocked: boolean;
  riskScore: number;
  confidence: number;
  modelVersion: string;
  reasons: string[];
  recommendation: 'approve' | 'review' | 'block';
}

export class FraudDetectionEngine {
  private models: ModelVersion[] = [
    {
      id: 'model_v1',
      name: 'Basic Rules Engine',
      version: '1.0.0',
      threshold: 60,
      accuracy: 0.85,
      falsePositiveRate: 0.12,
      falseNegativeRate: 0.08,
      isActive: false
    },
    {
      id: 'model_v2',
      name: 'Machine Learning Model',
      version: '2.1.0',
      threshold: 70,
      accuracy: 0.92,
      falsePositiveRate: 0.06,
      falseNegativeRate: 0.04,
      isActive: true
    },
    {
      id: 'model_v3',
      name: 'Deep Learning Model',
      version: '3.0.0',
      threshold: 75,
      accuracy: 0.96,
      falsePositiveRate: 0.03,
      falseNegativeRate: 0.02,
      isActive: false
    }
  ];

  private transactionHistory: Transaction[] = [];

  getModels(): ModelVersion[] {
    return this.models;
  }

  getActiveModel(): ModelVersion {
    return this.models.find(m => m.isActive) || this.models[0];
  }

  setActiveModel(modelId: string): void {
    this.models.forEach(model => {
      model.isActive = model.id === modelId;
    });
  }

  addTransaction(transaction: Transaction): void {
    this.transactionHistory.push(transaction);
  }

  private calculateVelocityScore(transaction: Transaction): number {
    const oneHourAgo = new Date(transaction.timestamp.getTime() - 60 * 60 * 1000);
    const recentTransactions = this.transactionHistory.filter(
      t => t.userId === transaction.userId && t.timestamp > oneHourAgo
    );
    
    if (recentTransactions.length <= 1) return 0;
    if (recentTransactions.length <= 3) return 10;
    if (recentTransactions.length <= 5) return 25;
    return 40;
  }

  private calculateAmountScore(transaction: Transaction): number {
    const userTransactions = this.transactionHistory.filter(
      t => t.userId === transaction.userId
    );
    
    if (userTransactions.length === 0) return 0;
    
    const avgAmount = userTransactions.reduce((sum, t) => sum + t.amount, 0) / userTransactions.length;
    const deviationRatio = transaction.amount / avgAmount;
    
    if (deviationRatio > 10) return 35;
    if (deviationRatio > 5) return 25;
    if (deviationRatio > 3) return 15;
    if (deviationRatio > 2) return 10;
    return 0;
  }

  private calculateLocationScore(transaction: Transaction): number {
    const userTransactions = this.transactionHistory.filter(
      t => t.userId === transaction.userId
    );
    
    const commonLocations = userTransactions.map(t => t.location);
    const locationFrequency = commonLocations.reduce((acc, loc) => {
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonLocation = Object.entries(locationFrequency)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (!mostCommonLocation) return 0;
    
    const [commonLoc] = mostCommonLocation;
    if (transaction.location !== commonLoc) {
      if (transaction.location.includes('Nigeria') || 
          transaction.location.includes('Ukraine') || 
          transaction.location.includes('India')) {
        return 30;
      }
      return 15;
    }
    return 0;
  }

  private calculateTimeScore(transaction: Transaction): number {
    const hour = transaction.timestamp.getHours();
    if (hour >= 2 && hour <= 6) return 20;
    if (hour >= 22 || hour <= 1) return 10;
    return 0;
  }

  private calculateMerchantScore(transaction: Transaction): number {
    if (transaction.merchant === 'Unknown Merchant') return 35;
    if (transaction.merchant.includes('ATM')) return 10;
    
    const suspiciousMerchants = ['Cash Advance', 'Western Union', 'MoneyGram'];
    if (suspiciousMerchants.some(merchant => transaction.merchant.includes(merchant))) {
      return 25;
    }
    return 0;
  }

  analyzeTransaction(transaction: Transaction): FraudDetectionResult {
    const activeModel = this.getActiveModel();
    const reasons: string[] = [];
    let totalScore = 0;

    const velocityScore = this.calculateVelocityScore(transaction);
    if (velocityScore > 0) {
      totalScore += velocityScore;
      reasons.push(`High transaction velocity (${transaction.velocity} transactions in 1 hour)`);
    }

    const amountScore = this.calculateAmountScore(transaction);
    if (amountScore > 0) {
      totalScore += amountScore;
      reasons.push(`Unusual transaction amount ($${transaction.amount.toFixed(2)})`);
    }

    const locationScore = this.calculateLocationScore(transaction);
    if (locationScore > 0) {
      totalScore += locationScore;
      reasons.push(`Unusual location (${transaction.location})`);
    }

    const timeScore = this.calculateTimeScore(transaction);
    if (timeScore > 0) {
      totalScore += timeScore;
      reasons.push(`Unusual time of day (${transaction.timeOfDay})`);
    }

    const merchantScore = this.calculateMerchantScore(transaction);
    if (merchantScore > 0) {
      totalScore += merchantScore;
      reasons.push(`Suspicious merchant (${transaction.merchant})`);
    }

    if (transaction.category === 'Online' && transaction.amount > 200) {
      totalScore += 10;
      reasons.push('High-value online transaction');
    }

    if (transaction.isWeekend && transaction.amount > 500) {
      totalScore += 5;
      reasons.push('Weekend high-value transaction');
    }

    const riskScore = Math.min(totalScore, 100);
    const confidence = Math.min((riskScore / 100) * 0.8 + 0.2, 1);

    let recommendation: 'approve' | 'review' | 'block';
    let isBlocked = false;

    if (riskScore >= activeModel.threshold + 10) {
      recommendation = 'block';
      isBlocked = true;
    } else if (riskScore >= activeModel.threshold - 10) {
      recommendation = 'review';
    } else {
      recommendation = 'approve';
    }

    return {
      isBlocked,
      riskScore,
      confidence,
      modelVersion: activeModel.version,
      reasons,
      recommendation
    };
  }

  getModelPerformanceStats(): Array<ModelVersion & { recentTransactions: number }> {
    return this.models.map(model => ({
      ...model,
      recentTransactions: this.transactionHistory.length
    }));
  }
}