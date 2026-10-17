export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CHF';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // e.g. 1 USD = 0.92 EUR
}

export type PayFrequency = 'biweekly' | 'monthly' | 'annual';

export type AutomationFramework = '50_30_20' | '60_20_20' | '70_20_10' | 'custom';

export interface ExpenseCategory {
  id: string;
  name: string;
  stream: 'Essential Needs' | 'Lifestyle & Wants' | 'Wealth Building';
  rulePct: number;
  projected: number;
  actual: number;
  foreignNote?: string;
  icon: string;
}

export interface TargetVault {
  id: string;
  name: string;
  categoryTag: string;
  currentAmount: number;
  targetAmount: number;
  monthlyAuto: number;
  targetDate: string;
  status: 'Ahead' | 'On Track' | 'Almost Done' | 'Starting' | 'Open';
  icon: string;
  currency?: CurrencyCode;
  foreignCurrentAmount?: number;
  foreignTargetAmount?: number;
  hedgedUSD?: string;
  isJPY?: boolean;
}

export interface StreamItem {
  name: string;
  amount: number;
  note?: string;
}
