import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingDown, Calendar, Save, Sparkles, IndianRupee, ArrowRight, RefreshCw, X
} from 'lucide-react';
import { getFastPayoffProjection } from '@smart-expense/shared/src/api/loans';
import { Loan, LoanPayoffProjection } from '@smart-expense/shared/src/types';
import { cn } from '../lib/utils';

interface LoanFastPayoffViewProps {
  loan: Loan;
  onClose: () => void;
}

export const LoanFastPayoffView: React.FC<LoanFastPayoffViewProps> = ({ loan, onClose }) => {
  const [projection, setProjection] = useState<LoanPayoffProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualSurplus, setManualSurplus] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState(false);

  const fetchProjection = async (surplus?: number) => {
    if (!loan.id) return;
    setLoading(true);
    try {
      const data = await getFastPayoffProjection(loan.id, surplus);
      setProjection(data);
      if (!isCalculated) {
        setManualSurplus(data.monthlySurplus.toString());
        setIsCalculated(true);
      }
    } catch (err) {
      console.error('Failed to fetch projection', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjection();
  }, [loan.id]);

  const handleReCalculate = () => {
    fetchProjection(parseFloat(manualSurplus) || 0);
  };

  if (loading && !projection) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!projection) return null;

  const chartData = projection.projectionSchedule.filter((_, i) => i % 6 === 0 || i === projection.projectionSchedule.length - 1);

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-1">
            <Sparkles className="h-4 w-4" />
            AI Optimized Payoff Plan
          </div>
          <h3 className="text-3xl font-black tracking-tight">{loan.loanName}</h3>
          <p className="text-muted-foreground">Strategic plan to close your debt faster.</p>
        </div>
        <button 
          onClick={onClose}
          className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 p-6 border border-green-200 dark:border-green-900/50">
          <TrendingDown className="h-8 w-8 text-green-600 mb-4" />
          <p className="text-sm font-medium text-green-800 dark:text-green-400">Total Interest Saved</p>
          <p className="text-3xl font-black text-green-700 dark:text-green-300">₹{projection.totalInterestSaved.toLocaleString('en-IN')}</p>
        </div>
        
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 p-6 border border-blue-200 dark:border-blue-900/50">
          <Calendar className="h-8 w-8 text-blue-600 mb-4" />
          <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Time Saved</p>
          <p className="text-3xl font-black text-blue-700 dark:text-blue-300">{projection.monthsSaved} Months</p>
          <p className="text-xs text-blue-600 mt-1">~ {(projection.monthsSaved / 12).toFixed(1)} years earlier</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 p-6 border border-purple-200 dark:border-purple-900/50">
          <Save className="h-8 w-8 text-purple-600 mb-4" />
          <p className="text-sm font-medium text-purple-800 dark:text-purple-400">New Tenure</p>
          <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{projection.fastPayoffTenureMonths} Months</p>
          <p className="text-xs text-purple-600 mt-1">vs {projection.originalTenureMonths} originally</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Simulation Controls */}
        <div className="lg:col-span-1 border-r border-border pr-8">
          <h4 className="text-base font-bold mb-4 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Adjust Simulation
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Monthly Extra Payment (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="number" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-border rounded-xl pl-9 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  value={manualSurplus}
                  onChange={(e) => setManualSurplus(e.target.value)}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 p-2 rounded bg-gray-50 dark:bg-gray-800/50 border border-border/50">
                <div className="flex justify-between mb-1">
                   <span>Avg. Monthly Salary:</span>
                   <span className="font-bold text-foreground">₹{projection.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                   <span>Avg. Expenses:</span>
                   <span className="font-bold text-foreground">₹{projection.monthlyExpenses.toLocaleString()}</span>
                </div>
                <div className="border-t border-border/50 pt-1 mt-1 flex justify-between font-bold text-primary">
                   <span>Calculated Surplus:</span>
                   <span>₹{projection.monthlySurplus.toLocaleString()}</span>
                </div>
              </div>

            </div>
            <button 
              onClick={handleReCalculate}
              disabled={loading}
              className="w-full bg-primary py-3 rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? 'Calculating...' : 'Re-Simulate Plan'}
            </button>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20">
             <div className="flex gap-3">
                <div className="h-10 w-10 shrink-0 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">!</div>
                <div>
                   <p className="text-xs font-bold text-orange-800 dark:text-orange-400 uppercase">Pro Tip</p>
                   <p className="text-sm text-orange-700 dark:text-orange-500 mt-1">
                     Applying even ₹2,000 extra monthly can save you over ₹50,000 in interest for this loan!
                   </p>
                </div>
             </div>
          </div>

          {/* Expert Guide Section */}
          <div className="mt-8 space-y-4">
             <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Loan Strategy Guide</h4>
             <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-gray-50/50 dark:bg-gray-800/30">
                   <p className="text-xs font-bold mb-1 flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div> EMI Strategy</p>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Most cost-effective. You pay principal + interest monthly, reducing total interest quickly.</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-gray-50/50 dark:bg-gray-800/30">
                   <p className="text-xs font-bold mb-1 flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div> Interest-Only (IO)</p>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Lower monthly burden but more expensive overall. Best for short-term liquidity needs.</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-gray-50/50 dark:bg-gray-800/30">
                   <p className="text-xs font-bold mb-1 flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div> Bullet Repayment</p>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">Highest interest cost. Pay everything at the end. Use only if expecting a lump sum at maturity.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="lg:col-span-2">
          <h4 className="text-base font-bold mb-6 flex items-center justify-between">
            Balance Reduction Projection
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full">
              {loan.repaymentType || 'EMI'} Strategy
            </span>
          </h4>
          <div className="h-[400px] w-full min-h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Months', position: 'insideBottom', offset: -5 }} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Balance']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  labelFormatter={(month) => `Month ${month}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="remainingBalance" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
