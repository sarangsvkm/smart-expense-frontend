import React from 'react';
import { Trash2, Receipt, IndianRupee, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { Expense, Income } from '@smart-expense/shared/src/types';
import { deleteExpense, deleteIncome } from '@smart-expense/shared/src/api/transactions';
import { TransactionModal } from './TransactionModal';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface TransactionListViewProps {
  type: 'EXPENSES' | 'INCOMES';
  data: (Expense | Income)[];
  onRefresh: () => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({ type, data, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      if (type === 'EXPENSES') {
        await deleteExpense(id);
      } else {
        await deleteIncome(id);
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to delete record', err);
      alert('Failed to delete. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add {type === 'EXPENSES' ? 'Expense' : 'Income'}
        </button>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onRefresh} 
        fixedType={type === 'EXPENSES' ? 'EXPENSE' : 'INCOME'}
      />

      <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-muted-foreground font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">{type === 'EXPENSES' ? 'Description' : 'Source'}</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No {type.toLowerCase()} records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {type === 'EXPENSES' ? (item as Expense).description : (item as Income).source}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      type === 'EXPENSES' 
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    )}>
                      {item.category?.name || (item as Income).category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right whitespace-nowrap">
                    <span className={type === 'EXPENSES' ? 'text-red-600' : 'text-green-600'}>
                      {type === 'EXPENSES' ? '-' : '+'} ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};
