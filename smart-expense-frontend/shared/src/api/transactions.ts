import apiClient from './client';
import type { Expense, Income, IncomeCategory, Loan } from '../types';

interface CreateExpensePayload {
  amount: number;
  description: string;
  date: string;
  isTaxDeductible: boolean;
  categoryName: string;
}

interface CreateIncomePayload {
  amount: number;
  source: string;
  date: string;
  category: IncomeCategory;
  isTaxable: boolean;
  assetType?: string;
  purchasePrice?: number;
  purchaseDate?: string;
}

interface CreateLoanPayload {
  loanName: string;
  financeName?: string;
  purpose?: string;
  principalAmount: number;
  interestRate?: number;
  tenureMonths?: number;
  emiAmount?: number;
  startDate: string;
  loanType: string;
  repaymentType: string;
}

export const getExpenses = async () => {
  const response = await apiClient.get<Expense[]>('/expenses');
  return response.data;
};

export const getIncome = async () => {
  const response = await apiClient.get<Income[]>('/income');
  return response.data;
};

export const createExpense = async (payload: CreateExpensePayload) => {
  const response = await apiClient.post('/expenses', {
    amount: payload.amount,
    description: payload.description,
    date: payload.date,
    isTaxDeductible: payload.isTaxDeductible,
    category: { name: payload.categoryName },
  });
  return response.data;
};

export const createIncome = async (payload: CreateIncomePayload) => {
  const response = await apiClient.post('/income', payload);
  return response.data;
};

export const createLoan = async (payload: CreateLoanPayload) => {
  const response = await apiClient.post<Loan>('/loans', payload);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  await apiClient.delete(`/expenses/${id}`);
};

export const deleteIncome = async (id: number) => {
  await apiClient.delete(`/income/${id}`);
};

export const suggestDiscovery = async (description: string) => {
  const response = await apiClient.get('/discovery/suggest', {
    params: { description }
  });
  return response.data;
};
