import React, { useState } from 'react';
import { X, Receipt, IndianRupee, Info } from 'lucide-react';
import apiClient from '@smart-expense/shared/src/api/client';
import { cn } from '../lib/utils';
import { IncomeCategory } from '@smart-expense/shared/src/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<IncomeCategory | string>('FOOD');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [isTaxable, setIsTaxable] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'EXPENSE') {
        await apiClient.post('/expenses', {
          amount: parseFloat(amount),
          description,
          date,
          isTaxDeductible,
        });
      } else {
        await apiClient.post('/income', {
          amount: parseFloat(amount),
          source,
          date,
          category,
          isTaxable,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction', error);
      alert('Error adding transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Add Transaction</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Toggle Type */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8">
          <button
            onClick={() => setType('EXPENSE')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
              type === 'EXPENSE' ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Receipt className="h-4 w-4" />
            Expense
          </button>
          <button
            onClick={() => setType('INCOME')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all",
              type === 'INCOME' ? "bg-white dark:bg-gray-700 shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <IndianRupee className="h-4 w-4" />
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full rounded-lg border border-border bg-white dark:bg-gray-800 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                {type === 'EXPENSE' ? 'Description' : 'Source'}
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white dark:bg-gray-800 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder={type === 'EXPENSE' ? 'Lunch, Rent, etc.' : 'Salary, Freelance, etc.'}
                value={type === 'EXPENSE' ? description : source}
                onChange={(e) => type === 'EXPENSE' ? setDescription(e.target.value) : setSource(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-border bg-white dark:bg-gray-800 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {type === 'INCOME' && (
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-border bg-white dark:bg-gray-800 px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="SALARY">Salary</option>
                  <option value="BUSINESS">Business</option>
                  <option value="CAPITAL_GAINS">Capital Gains</option>
                  <option value="RENTAL">Rental</option>
                  <option value="DIVIDENDS">Dividends</option>
                  <option value="INTEREST">Interest</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Tax Toggles */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              {type === 'EXPENSE' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Tax Deductible?</p>
                    <p className="text-xs text-muted-foreground">Is this under 80C, 80D, etc.?</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Taxable Income?</p>
                    <p className="text-xs text-muted-foreground">Should this be included in ITR?</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={isTaxable}
                    onChange={(e) => setIsTaxable(e.target.checked)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-all",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
