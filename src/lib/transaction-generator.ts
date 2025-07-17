export interface Transaction {
  id: string;
  timestamp: Date;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  cardType: string;
  userId: string;
  userAge: number;
  userLocation: string;
  merchantCategory: string;
  isWeekend: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  velocity: number;
  riskScore: number;
  isFraud: boolean;
  flaggedReasons: string[];
}

const merchants = [
  'Amazon', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s', 'Shell', 'Exxon',
  'Best Buy', 'Home Depot', 'Costco', 'CVS', 'Walgreens', 'Subway', 'Pizza Hut',
  'Nike', 'Apple Store', 'GameStop', 'Macy\'s', 'Uber', 'Airbnb'
];

const categories = [
  'Grocery', 'Gas', 'Restaurant', 'Retail', 'Electronics', 'Healthcare',
  'Transportation', 'Entertainment', 'Travel', 'Online', 'Subscription'
];

const locations = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC'
];

const cardTypes = ['Visa', 'Mastercard', 'American Express', 'Discover'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function calculateVelocity(transactions: Transaction[], userId: string, currentTime: Date): number {
  const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
  const recentTransactions = transactions.filter(
    t => t.userId === userId && t.timestamp > oneHourAgo
  );
  return recentTransactions.length;
}

function generateFraudPatterns(): Partial<Transaction> {
  const patterns = [
    {
      amount: Math.random() * 5000 + 1000,
      location: getRandomElement(['Lagos, Nigeria', 'Kiev, Ukraine', 'Mumbai, India']),
      timeOfDay: 'night' as const,
      velocity: Math.floor(Math.random() * 10) + 5
    },
    {
      amount: Math.random() * 100 + 500,
      merchant: 'Unknown Merchant',
      category: 'Online',
      velocity: Math.floor(Math.random() * 15) + 10
    },
    {
      amount: Math.random() * 50 + 1,
      velocity: Math.floor(Math.random() * 20) + 15,
      timeOfDay: 'night' as const
    }
  ];
  
  return getRandomElement(patterns);
}

export function generateTransaction(
  existingTransactions: Transaction[] = [],
  forceFraud: boolean = false
): Transaction {
  const now = new Date();
  const isFraud = forceFraud || Math.random() < 0.15;
  
  const baseTransaction: Partial<Transaction> = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now,
    merchant: getRandomElement(merchants),
    category: getRandomElement(categories),
    location: getRandomElement(locations),
    cardType: getRandomElement(cardTypes),
    userId: `user_${Math.floor(Math.random() * 1000)}`,
    userAge: Math.floor(Math.random() * 60) + 18,
    userLocation: getRandomElement(locations),
    merchantCategory: getRandomElement(categories),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    timeOfDay: getTimeOfDay(now.getHours()),
    amount: Math.random() * 500 + 10,
    velocity: Math.floor(Math.random() * 5)
  };

  const fraudPatterns = isFraud ? generateFraudPatterns() : {};
  const transaction = { ...baseTransaction, ...fraudPatterns } as Transaction;

  transaction.velocity = calculateVelocity(existingTransactions, transaction.userId, now);

  const riskFactors = [];
  let riskScore = 0;

  if (transaction.amount > 1000) {
    riskScore += 30;
    riskFactors.push('High transaction amount');
  }

  if (transaction.timeOfDay === 'night') {
    riskScore += 20;
    riskFactors.push('Unusual time of day');
  }

  if (transaction.velocity > 5) {
    riskScore += 25;
    riskFactors.push('High transaction velocity');
  }

  if (transaction.location !== transaction.userLocation) {
    riskScore += 15;
    riskFactors.push('Location mismatch');
  }

  if (transaction.merchant === 'Unknown Merchant') {
    riskScore += 35;
    riskFactors.push('Unknown merchant');
  }

  if (transaction.category === 'Online' && transaction.amount > 200) {
    riskScore += 10;
    riskFactors.push('High-value online transaction');
  }

  if (transaction.isWeekend && transaction.amount > 500) {
    riskScore += 5;
    riskFactors.push('Weekend high-value transaction');
  }

  transaction.riskScore = Math.min(riskScore, 100);
  transaction.isFraud = isFraud;
  transaction.flaggedReasons = riskFactors;

  return transaction;
}

export function generateTransactionBatch(count: number = 50): Transaction[] {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const transaction = generateTransaction(transactions);
    transactions.push(transaction);
  }
  
  return transactions;
}