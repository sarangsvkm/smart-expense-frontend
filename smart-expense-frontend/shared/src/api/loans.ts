import { LoanPayoffProjection } from '../types';
import apiClient from './client';

export interface LoanPayment {
  id: number;
  amount: number;
  paymentDate: string;
  status: string;
}

interface RecordLoanPaymentPayload {
  amount: number;
  paymentDate: string;
  status: string;
}

export const getLoanPaymentHistory = async (loanId: number) => {
  const response = await apiClient.get<LoanPayment[]>(`/emi/loan/${loanId}`);
  return response.data;
};

export const recordLoanPayment = async (loanId: number, payload: RecordLoanPaymentPayload) => {
  const response = await apiClient.post(`/emi/loan/${loanId}`, payload);
  return response.data;
};

export const getFastPayoffProjection = async (loanId: number, manualSurplus?: number) => {
  const response = await apiClient.get<LoanPayoffProjection>(`/loans/${loanId}/fast-payoff`, {
    params: { manualSurplus }
  });
  return response.data;
};
