import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  LayoutDashboard, Wallet, CreditCard, Receipt, TrendingDown, 
  Plus, LogOut, Calculator, IndianRupee, History, Menu, X
} from 'lucide-react';
import { fetchDashboardData, signOut } from '@smart-expense/shared/src';
import { Expense, Income, Loan, TaxReportResponse, FinancialSummary } from '@smart-expense/shared/src/types';
import { cn } from '../lib/utils';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

import { TransactionModal } from './TransactionModal';
import { TaxReportView } from './TaxReportView';
import { TransactionListView } from './TransactionListView';
import { LoanManagementView } from './LoanManagementView';
import { CarPlannerView } from './CarPlannerView';
import { Car } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [taxReport, setTaxReport] = useState<TaxReportResponse | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TAX' | 'EXPENSES' | 'INCOMES' | 'LOANS' | 'HISTORY' | 'CAR_PLANNER'>('DASHBOARD');
  const [strategyType, setStrategyType] = useState<'AVALANCHE' | 'SNOWBALL'>('AVALANCHE');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await fetchDashboardData();
      setExpenses(data.expenses);
      setIncome(data.income);
      setLoans(data.loans);
      setTaxReport(data.taxReport);
      setFinancialSummary(data.financialSummary);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalDebt = loans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
  const totalEmi = loans.reduce((sum, l) => sum + (l.emiAmount || 0), 0);

  const chartData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar - Desktop and Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white dark:bg-gray-900 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            SmartExpense
          </h1>
          <button 
            className="md:hidden p-2 text-gray-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {[
            { id: 'DASHBOARD', name: 'Dashboard', icon: LayoutDashboard },
            { id: 'EXPENSES', name: 'Expenses', icon: Receipt },
            { id: 'INCOMES', name: 'Incomes', icon: IndianRupee },
            { id: 'LOANS', name: 'Loans & EMI', icon: CreditCard },
            { id: 'CAR_PLANNER', name: 'Car Planner', icon: Car },
            { id: 'TAX', name: 'Tax Center', icon: Calculator },
            { id: 'HISTORY', name: 'History', icon: History },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-lg border border-border bg-white dark:bg-gray-900 shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {activeTab === 'DASHBOARD' ? 'Financial Overview' : 
                 activeTab === 'TAX' ? 'Tax & ITR Center' :
                 activeTab === 'EXPENSES' ? 'Expense Management' :
                 activeTab === 'INCOMES' ? 'Income Streams' :
                 activeTab === 'LOANS' ? 'Loans & Debt Recovery' : 
                 activeTab === 'CAR_PLANNER' ? 'Car Buy Planner' : 'History'}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {activeTab === 'DASHBOARD' ? "Welcome back! Here's what's happening today." :
                 activeTab === 'TAX' ? "Analyze your tax liability and plan your ITR filing." :
                 activeTab === 'EXPENSES' ? "Manage your daily spending and track deductions." :
                 activeTab === 'INCOMES' ? "Track your earnings and optimize your cash flow." :
                 activeTab === 'LOANS' ? "Monitor your debts and stay on top of EMI payments." :
                 activeTab === 'CAR_PLANNER' ? "Evaluate affordability and plan your dream car purchase." :
                 "Review your past financial activities."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {financialSummary && (
              <div className={cn(
                "hidden md:flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-sm border",
                financialSummary.healthStatus === 'Good' ? "bg-green-100 text-green-700 border-green-200" :
                financialSummary.healthStatus === 'Warning' ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                "bg-red-100 text-red-700 border-red-200"
              )}>
                <span className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  financialSummary.healthStatus === 'Good' ? "bg-green-500" :
                  financialSummary.healthStatus === 'Warning' ? "bg-yellow-500" :
                  "bg-red-500"
                )}></span>
                Financial Health: {financialSummary.healthStatus}
              </div>
            )}
          </div>
        </header>

        {activeTab === 'DASHBOARD' ? (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { title: 'Total Balance', value: totalIncome - totalExpenses, icon: Wallet, color: 'text-blue-600' },
                { title: 'Monthly Income', value: totalIncome, icon: IndianRupee, color: 'text-green-600' },
                { title: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-600' },
                { title: 'Ongoing Debt', value: totalDebt, icon: CreditCard, color: 'text-orange-600' },
              ].map((stat) => (
                <div key={stat.title} className="rounded-xl border border-border bg-white dark:bg-gray-900 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">₹{stat.value.toLocaleString()}</div>
                    {stat.title === 'Total Balance' && financialSummary && (
                      <span className="text-xs font-medium text-green-600">
                        {financialSummary.savingsPercentage.toFixed(1)}% saved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Income vs Expenses</h3>
                <div className="h-[300px] w-full relative">
                  <ResponsiveContainer width="99%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white dark:bg-gray-900 p-6 shadow-sm text-center">
                <h3 className="text-lg font-semibold mb-6">Tax Insights</h3>
                {taxReport ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Recommended Regime</p>
                      <p className="text-xl font-bold text-primary">{taxReport.recommendedRegime.replace('_', ' ')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-muted-foreground">Estimated Tax</p>
                        <p className="text-lg font-semibold">₹{taxReport.estimatedTax.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-muted-foreground">Tax Bracket</p>
                        <p className="text-lg font-semibold">{taxReport.taxBracket}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground py-10">Add income and expenses to see tax estimates.</p>
                )}
                <button 
                  onClick={() => setActiveTab('TAX')}
                  className="mt-4 w-full rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  View Detailed ITR Report
                </button>
              </div>
            </div>

            {/* Debt Strategy Section */}
            <div className="mt-8 rounded-xl border border-border bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Smart Debt Strategy</h3>
                  <p className="text-sm text-muted-foreground">Prioritize your payments to save interest or stay motivated.</p>
                </div>
                <div className="flex rounded-lg border border-border p-1">
                  {(['AVALANCHE', 'SNOWBALL'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setStrategyType(type)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        strategyType === type 
                          ? "bg-primary text-white shadow" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {loans.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...loans]
                    .sort((a, b) => strategyType === 'AVALANCHE' 
                      ? ((b.interestRate || 0) - (a.interestRate || 0)) 
                      : ((a.remainingBalance || a.principalAmount) - (b.remainingBalance || b.principalAmount))
                    )
                    .map((loan, idx) => (
                      <div key={loan.id} className="p-4 rounded-xl border border-border bg-gray-50/50 dark:bg-gray-800/50 relative">
                        {idx === 0 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            TOP PRIORITY
                          </span>
                        )}
                        <h4 className="font-semibold text-sm mb-2">{loan.loanName}</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Rate</span>
                            <span className="font-medium text-red-600">{loan.interestRate ?? 0}%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Balance</span>
                            <span className="font-medium">₹{(loan.remainingBalance || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No active loans to strategize.
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'TAX' ? (
          <TaxReportView report={taxReport} loading={loading} />
        ) : activeTab === 'EXPENSES' ? (
          <TransactionListView type="EXPENSES" data={expenses} onRefresh={fetchData} />
        ) : activeTab === 'INCOMES' ? (
          <TransactionListView type="INCOMES" data={income} onRefresh={fetchData} />
        ) : activeTab === 'LOANS' ? (
          <LoanManagementView loans={loans} onRefresh={fetchData} />
        ) : activeTab === 'CAR_PLANNER' ? (
          <CarPlannerView 
            monthlyIncome={totalIncome} 
            monthlyExpenses={totalExpenses} 
            existingDebtEmi={totalEmi} 
          />
        ) : (
          <div className="flex h-96 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-gray-50/50">
             <div className="text-center">
                <p className="text-lg font-semibold text-muted-foreground">Module coming soon...</p>
                <p className="text-sm text-muted-foreground">This section is currently being wired up to the backend.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
