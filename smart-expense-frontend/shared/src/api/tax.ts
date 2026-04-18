import apiClient from './client';
import type { TaxInvestmentDoc } from '../types';

export const getTaxDocuments = async () => {
  const response = await apiClient.get<TaxInvestmentDoc[]>('/tax/documents');
  return response.data;
};

export const uploadTaxDocument = async (formData: FormData) => {
  const response = await apiClient.post('/tax/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadTaxDocument = async (id: number) => {
  const response = await apiClient.get(`/tax/documents/download/${id}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteTaxDocument = async (id: number) => {
  await apiClient.delete(`/tax/documents/${id}`);
};

export const downloadTaxReport = async (year: number, itrType: string) => {
  const response = await apiClient.get('/tax/report/download', {
    params: { year, itrType },
    responseType: 'blob',
  });
  return response.data;
};
