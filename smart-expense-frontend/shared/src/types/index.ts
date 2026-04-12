export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface JwtResponse {
  token: string;
  type: string; // Matches 'type: "Bearer"' from backend
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string; // Required for login — not optional
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role?: string[];  // 1:1 Parity: Matches backend SignupRequest.java field 'role'
}

export interface MessageResponse {
  message: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Expense {
  id?: number;
  amount: number;
  description: string;
  date: string;
  isTaxDeductible: boolean;
  category?: Category;
}

export type IncomeCategory = 'SALARY' | 'BUSINESS' | 'CAPITAL_GAINS' | 'RENTAL' | 'DIVIDENDS' | 'INTEREST' | 'OTHER';

export interface Income {
  id?: number;
  amount: number;
  source: string;
  date: string;
  category: IncomeCategory;
  isTaxable: boolean;
  purchasePrice?: number;
  purchaseDate?: string;
  assetType?: string;
}

export interface Loan {
  id?: number;
  loanName: string;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  remainingBalance?: number;
}

export interface TaxReportResponse {
  itrType: string;
  totalSalaryIncome: number;
  totalBusinessIncome: number;
  totalCapitalGains: number;
  totalOtherIncome: number;
  totalDeductions: number;
  netTaxableIncome: number;
  estimatedTax: number;
  estimatedTaxOldRegime: number;
  estimatedTaxNewRegime: number;
  recommendedRegime: 'OLD_REGIME' | 'NEW_REGIME';
  taxBracket: string;
  incomeBreakdown: Record<string, number>;
  capitalGainsBreakdown: Record<string, number>;
}

export interface FinancialSummary {
  totalExpenses: number;
  totalIncome: number;
  totalDebt: number;
  savings: number;
  savingsPercentage: number;
  expensesByCategory: Record<string, number>;
  expenseCount: number;
  loanCount: number;
  healthStatus: 'Good' | 'Warning' | 'Critical';
}
