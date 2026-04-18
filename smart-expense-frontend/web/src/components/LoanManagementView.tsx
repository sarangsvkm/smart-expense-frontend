import React, { useState } from 'react';
import { CreditCard, Calendar, TrendingDown, History, PlusCircle, CheckCircle2, IndianRupee, Plus, Sparkles, Home, Car, GraduationCap, Briefcase, HelpCircle } from 'lucide-react';
import { Loan, LoanType } from '@smart-expense/shared/src/types';
import { getLoanPaymentHistory, LoanPayment, recordLoanPayment } from '@smart-expense/shared/src/api/loans';
import { cn } from '../lib/utils';
import { TransactionModal } from './TransactionModal';
import { LoanFastPayoffView } from './LoanFastPayoffView';

interface LoanManagementViewProps {
  loans: Loan[];
  onRefresh: () => void;
}

export const LoanManagementView: React.FC<LoanManagementViewProps> = ({ loans, onRefresh }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<LoanPayment[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewFastPayoff, setViewFastPayoff] = useState<Loan | null>(null);

  const getLoanIcon = (type: LoanType) => {
    switch (type) {
      case LoanType.GOLD: return <Sparkles className="h-6 w-6" />;
      case LoanType.HOME: return <Home className="h-6 w-6" />;
      case LoanType.CAR: return <Car className="h-6 w-6" />;
      case LoanType.EDUCATION: return <GraduationCap className="h-6 w-6" />;
      case LoanType.BUSINESS: return <Briefcase className="h-6 w-6" />;
      case LoanType.PERSONAL: return <CreditCard className="h-6 w-6" />;
      default: return <HelpCircle className="h-6 w-6" />;
    }
  };

  const fetchHistory = async (id: number) => {
    try {
      const history = await getLoanPaymentHistory(id);
      setPaymentHistory(history);
      setSelectedLoanId(id);
    } catch (err) {
      console.error('Failed to fetch payment history', err);
    }
  };

  const handlePayEmi = async (loanId: number) => {
    if (!paymentAmount) return;
    setIsPaying(true);
    try {
      await recordLoanPayment(loanId, {
        amount: parseFloat(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'PAID'
      });
      setPaymentAmount('');
      fetchHistory(loanId);
      onRefresh();
    } catch (err) {
      console.error('Failed to record EMI payment', err);
      alert('Error recording payment.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Loan
        </button>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={onRefresh} 
        fixedType="LOAN"
      />

      {/* Grid of Loans */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <div key={loan.id} className="relative rounded-2xl border border-border bg-white dark:bg-gray-900 p-6 shadow-sm group">
            <div className="mb-4 flex items-center justify-between">
              <div className={cn(
                "rounded-2xl p-3 shadow-inner",
                loan.loanType === LoanType.GOLD ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" : "bg-primary/10 text-primary"
              )}>
                {getLoanIcon(loan.loanType)}
              </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm",
                    loan.loanType === LoanType.GOLD ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-primary/5 border-primary/20 text-primary/70"
                  )}>
                    {loan.loanType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                      {loan.repaymentType || 'EMI'} Strategy
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-100 dark:border-red-800">
                      {loan.interestRate}% Interest
                    </span>
                  </div>
                </div>
            </div>
            
            <div className="mb-4">
               <h3 className="text-xl font-black tracking-tight leading-none group-hover:text-primary transition-colors">{loan.loanName}</h3>
               {loan.financeName && (
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/30 mr-1.5 animate-pulse"></span>
                    {loan.financeName}
                  </p>
               )}
            </div>

            {loan.purpose && (
               <div className="mb-5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[11px] font-medium text-muted-foreground italic flex gap-2 items-start">
                     <span className="text-primary font-bold">Purpose:</span>
                     {loan.purpose}
                  </p>
               </div>
            )}
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-semibold">₹{loan.principalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-bold text-primary">₹{(loan.remainingBalance || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground font-medium">
                  {loan.repaymentType === 'MONTHLY_INTEREST' ? 'Monthly Interest' : 
                   loan.repaymentType === 'BULLET' ? 'Target Maturity' : 'Est. Monthly EMI'}
                </span>
                <span className={cn(
                  "font-black",
                  loan.repaymentType === 'BULLET' ? "text-indigo-600" : "text-orange-600"
                )}>
                  ₹{(loan.emiAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div 
                   className="h-full bg-primary transition-all duration-1000" 
                   style={{ width: `${Math.max(5, (1 - (loan.remainingBalance || 0) / loan.principalAmount) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loan.id && fetchHistory(loan.id)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <History className="h-3 w-3" />
                History
              </button>
              <button
                onClick={() => setSelectedLoanId(loan.id || null)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-900 dark:bg-gray-100 py-2 text-xs font-bold text-white dark:text-gray-900 hover:opacity-90 transition-all shadow-sm"
              >
                <PlusCircle className="h-3 w-3" />
                Pay EMI
              </button>
            </div>
            
            <button
               onClick={() => setViewFastPayoff(loan)}
               className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20"
            >
               <TrendingDown className="h-3 w-3" />
               Simulate Fast Close Strategy
            </button>
          </div>
        ))}
      </div>

      {/* Payment / History Panel */}
      {selectedLoanId && (
        <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-primary" />
                Loan Activity: {loans.find(l => l.id === selectedLoanId)?.loanName}
              </h3>
              <p className="text-muted-foreground mt-1">Record EMI payments and track your progress.</p>
            </div>
            <button 
               onClick={() => setSelectedLoanId(null)}
               className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Close Panel
            </button>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Payment Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Record Payment</h4>
              <div className="space-y-4">
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                   </div>
                   <input
                     type="number"
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-border rounded-xl pl-10 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                     placeholder="Enter EMI Amount"
                     value={paymentAmount}
                     onChange={(e) => setPaymentAmount(e.target.value)}
                   />
                </div>
                <button
                  onClick={() => handlePayEmi(selectedLoanId!)}
                  disabled={isPaying || !paymentAmount}
                  className="w-full rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isPaying ? 'Recording...' : 'Confirm EMI Payment'}
                </button>
              </div>
            </div>

            {/* History Section */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Payment History</h4>
              <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                {paymentHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-8 text-center border-2 border-dashed rounded-xl">No payments recorded yet.</p>
                ) : (
                  paymentHistory.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-1.5 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">₹{pay.amount.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(pay.paymentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {pay.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fast Payoff Simulation View */}
      {viewFastPayoff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 overflow-auto py-10">
          <div className="w-full max-w-5xl">
             <LoanFastPayoffView 
                loan={viewFastPayoff} 
                onClose={() => setViewFastPayoff(null)} 
             />
          </div>
        </div>
      )}
    </div>
  );
};
