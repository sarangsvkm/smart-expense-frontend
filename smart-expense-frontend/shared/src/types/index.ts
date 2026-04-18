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

export type IncomeCategory = 
  | 'SALARY' 
  | 'BUSINESS_PROFESSION' 
  | 'PRESUMPTIVE_BUSINESS' 
  | 'CAPITAL_GAINS' 
  | 'HOUSE_PROPERTY' 
  | 'OTHER_SOURCES' 
  | 'RENTAL' 
  | 'DIVIDENDS' 
  | 'INTEREST';

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

export enum LoanType {
  PERSONAL = 'PERSONAL',
  GOLD = 'GOLD',
  HOME = 'HOME',
  CAR = 'CAR',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS',
  OTHER = 'OTHER'
}

export enum RepaymentType {
  EMI = 'EMI',
  MONTHLY_INTEREST = 'MONTHLY_INTEREST',
  BULLET = 'BULLET'
}

export interface Loan {
  id?: number;
  loanName: string;
  financeName?: string;
  purpose?: string;
  principalAmount: number;

  interestRate?: number;
  tenureMonths?: number;
  startDate: string;
  remainingBalance?: number;
  emiAmount?: number;
  loanType: LoanType;
  repaymentType?: RepaymentType;
}

export interface MonthlyProjection {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

export interface LoanPayoffProjection {
  loanId: number;
  loanName: string;
  currentBalance: number;
  monthlySurplus: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInterestSaved: number;
  originalTenureMonths: number;
  fastPayoffTenureMonths: number;
  monthsSaved: number;
  projectionSchedule: MonthlyProjection[];
}

export interface TaxReportResponse {
  itrType: string;
  totalSalaryIncome: number;
  totalBusinessIncome: number;
  totalCapitalGains: number;
  totalOtherIncome: number;
  totalDeductions: number;
  verifiedDeductions: number;
  netTaxableIncome: number;
  livePortfolioValue: number;
  estimatedTax: number;
  estimatedTaxOldRegime: number;
  estimatedTaxNewRegime: number;
  recommendedRegime: 'OLD_REGIME' | 'NEW_REGIME';
  taxBracket: string;
  incomeBreakdown: Record<string, number>;
  capitalGainsBreakdown: Record<string, number>;
  cessAmount: number;
  eligibilityWarnings: string[];
}

export interface TaxInvestmentDoc {
  id: number;
  fileName: string;
  contentType: string;
  category: string;
  amount: number;
  fiscalYear: number;
  uploadDate: string;
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
