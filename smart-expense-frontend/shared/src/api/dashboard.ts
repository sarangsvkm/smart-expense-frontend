import apiClient from './client';
import type { Expense, FinancialSummary, Income, Loan, TaxReportResponse } from '../types';

export const fetchDashboardData = async () => {
  const results = await Promise.allSettled([
    apiClient.get<Expense[]>('/expenses'),
    apiClient.get<Income[]>('/income'),
    apiClient.get<Loan[]>('/loans'),
    apiClient.get<TaxReportResponse>('/tax/report'),
    apiClient.get<FinancialSummary>('/analytics/summary'),
  ]);

  const getValue = <T>(result: PromiseSettledResult<any>, defaultVal: T): T => 
    result.status === 'fulfilled' && result.value?.data ? result.value.data : defaultVal;

  return {
    expenses: getValue<Expense[]>(results[0], []),
    income: getValue<Income[]>(results[1], []),
    loans: getValue<Loan[]>(results[2], []),
    taxReport: getValue<TaxReportResponse | null>(results[3], null),
    financialSummary: getValue<FinancialSummary | null>(results[4], null),
  };
};
