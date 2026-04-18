import React, { useState, useMemo } from 'react';
import { 
  Car, IndianRupee, Gauge, ShieldCheck, AlertTriangle, 
  Info, TrendingUp, Calendar, ArrowRight, Wallet,
  HelpCircle, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip } from 'recharts';

interface CarPlannerViewProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebtEmi: number;
}

export const CarPlannerView: React.FC<CarPlannerViewProps> = ({ 
  monthlyIncome, 
  monthlyExpenses, 
  existingDebtEmi 
}) => {
  const [carPrice, setCarPrice] = useState(1500000); // 15L default
  const [downPayment, setDownPayment] = useState(300000); // 20% default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% avg car loan
  const [tenureYears, setTenureYears] = useState(5); // 5 years common
  const [maintenanceMonthly, setMaintenanceMonthly] = useState(5000); // Buffer for fuel/insurance

  // Calculations
  const calculations = useMemo(() => {
    const loanAmount = Math.max(0, carPrice - downPayment);
    const monthlyRate = interestRate / 12 / 100;
    const months = tenureYears * 12;
    
    let emi = 0;
    if (loanAmount > 0) {
      if (monthlyRate > 0) {
        emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        emi = loanAmount / months;
      }
    }

    const totalInterest = (emi * months) - loanAmount;
    const totalCost = carPrice + totalInterest;
    const netIncome = Math.max(0, monthlyIncome - monthlyExpenses - existingDebtEmi);
    const emiToIncomeRatio = monthlyIncome > 0 ? emi / monthlyIncome : 0;
    const totalCarCostRatio = monthlyIncome > 0 ? (emi + maintenanceMonthly) / monthlyIncome : 0;

    // Rules
    const isDownPaymentOk = (downPayment / carPrice) >= 0.2;
    const isTenureOk = tenureYears <= 4;
    const isBudgetOk = totalCarCostRatio <= 0.1; // 10% rule
    
    const rule20410_score = [isDownPaymentOk, isTenureOk, isBudgetOk].filter(Boolean).length;

    // Affordability Health
    let status: 'SAFE' | 'GOOD' | 'WARNING' | 'RISKY' = 'SAFE';
    if (emi > netIncome * 0.6 || monthlyIncome === 0) status = 'RISKY';
    else if (emi > netIncome * 0.4) status = 'WARNING';
    else if (emi > netIncome * 0.2) status = 'GOOD';
    else status = 'SAFE';

    return {
      loanAmount,
      emi,
      totalInterest,
      totalCost,
      netIncome,
      emiToIncomeRatio,
      totalCarCostRatio,
      rules: {
        isDownPaymentOk,
        isTenureOk,
        isBudgetOk,
        rule20410_score
      },
      status
    };
  }, [carPrice, downPayment, interestRate, tenureYears, maintenanceMonthly, monthlyIncome, monthlyExpenses, existingDebtEmi]);

  const COLORS = ['#8b5cf6', '#e2e8f0'];
  const pieData = [
    { name: 'EMI + Costs', value: calculations.emi + maintenanceMonthly },
    { name: 'Remaining Income', value: Math.max(0, monthlyIncome - (calculations.emi + maintenanceMonthly)) }
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        <div className={cn("p-2 rounded-lg bg-gray-50 dark:bg-gray-800", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-xl font-black">₹{Math.round(value).toLocaleString('en-IN')}</div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-12 pb-20">
      {/* Left Column: Inputs & Sliders */}
      <div className="lg:col-span-7 space-y-8">
        <section className="rounded-3xl border border-border bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Car Details</h3>
              <p className="text-sm text-muted-foreground">Adjust the parameters to fit your dream car.</p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Car Price */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-primary" /> Car On-Road Price
                </label>
                <span className="text-lg font-black text-primary">₹{carPrice.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="300000" max="10000000" step="50000"
                value={carPrice} onChange={(e) => setCarPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>3 Lakh</span>
                <span>1 Crore</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" /> Down Payment
                </label>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-black text-primary">₹{downPayment.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{((downPayment/carPrice)*100).toFixed(1)}% of price</span>
                </div>
              </div>
              <input 
                type="range" min="0" max={carPrice} step="10000"
                value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-4">
              {/* Interest Rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interest Rate</label>
                  <span className="font-bold">{interestRate}%</span>
                </div>
                <input 
                  type="range" min="5" max="18" step="0.1"
                  value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Tenure */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tenure (Years)</label>
                  <span className="font-bold">{tenureYears} Years</span>
                </div>
                <input 
                  type="range" min="1" max="7" step="1"
                  value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
            
            {/* Running Costs */}
            <div className="pt-6 border-t border-dashed border-border">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" /> Est. Monthly Running Costs 
                  <span title="Includes Fuel, Insurance, Maintenance">
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </span>
                </label>
                <span className="text-lg font-black text-orange-600">₹{maintenanceMonthly.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" min="2000" max="50000" step="1000"
                value={maintenanceMonthly} onChange={(e) => setMaintenanceMonthly(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        </section>

        {/* 20/4/10 Rule Checklist */}
        <section className="rounded-3xl border border-border bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
           <div className="bg-primary/5 p-6 border-b border-primary/10">
              <h4 className="font-black text-sm uppercase tracking-tighter flex items-center gap-2 text-primary">
                 <ShieldCheck className="h-5 w-5" /> The 20/4/10 Financial Rule
              </h4>
           </div>
           <div className="p-8 space-y-4">
              {[
                { label: "20% Down Payment", ok: calculations.rules.isDownPaymentOk, desc: `Goal: ₹${(carPrice * 0.2).toLocaleString()} | Current: ${((downPayment/carPrice)*100).toFixed(0)}%` },
                { label: "4-Year Max Tenure", ok: calculations.rules.isTenureOk, desc: `Goal: ≤ 48 months | Current: ${tenureYears * 12} months` },
                { label: "10% of Gross Income", ok: calculations.rules.isBudgetOk, desc: `Goal: ₹${(monthlyIncome * 0.1).toLocaleString()} /mo | Current: ₹${Math.round(calculations.emi + maintenanceMonthly).toLocaleString()}` }
              ].map((rule, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border transition-all",
                  rule.ok ? "bg-green-50/50 border-green-100 text-green-800 dark:bg-green-900/10 dark:border-green-900/20" : "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/20"
                )}>
                  <div className={cn("mt-1", rule.ok ? "text-green-600" : "text-red-500")}>
                    {rule.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{rule.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{rule.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* Right Column: Analysis & Gauges */}
      <div className="lg:col-span-5 space-y-6">
        {/* Main Affordability Score */}
        <div className={cn(
          "rounded-[2.5rem] border p-8 shadow-xl transition-all duration-500 overflow-hidden relative",
          calculations.status === 'SAFE' ? "bg-green-600 border-green-700 text-white" :
          calculations.status === 'GOOD' ? "bg-blue-600 border-blue-700 text-white" :
          calculations.status === 'WARNING' ? "bg-orange-600 border-orange-700 text-white" :
          "bg-red-600 border-red-700 text-white"
        )}>
           {/* Abstract Background pattern */}
           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
           
           <div className="relative z-10 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Affordability Analysis</span>
              <h2 className="text-4xl font-black mt-2 mb-4 tracking-tighter">
                {calculations.status === 'SAFE' ? "Strong Buy" :
                 calculations.status === 'GOOD' ? "Safe Purchase" :
                 calculations.status === 'WARNING' ? "Stretch Buy" : "Risky Choice"}
              </h2>
              
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-2 flex items-center gap-2 border border-white/30">
                   <Gauge className="h-5 w-5" />
                   <span className="font-black text-sm uppercase">Health Status</span>
                </div>
              </div>

              <div className="space-y-4 text-left bg-black/10 rounded-3xl p-6 border border-white/5">
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  {calculations.status === 'SAFE' ? "Your current financial profile easily supports this EMI. You're following the best practices for auto financing." :
                   calculations.status === 'GOOD' ? "This is a manageable purchase. You'll still have a solid cushion for savings after the monthly payment." :
                   calculations.status === 'WARNING' ? "This car will take a significant chunk of your monthly surplus. Consider a higher down payment or a cheaper model." :
                   "High Risk! This purchase exceeds prudent financial boundaries. You might struggle with other expenses or emergency savings."}
                </p>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, (calculations.emiToIncomeRatio * 100) * 2)}%` }}
                     className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                   />
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                   <span>Budget Impact</span>
                   <span>{(calculations.emiToIncomeRatio * 100).toFixed(1)}% of Income</span>
                </div>
              </div>
           </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Monthly EMI" value={calculations.emi} icon={CreditCard} colorClass="text-primary" />
          <StatCard title="Loan Amount" value={calculations.loanAmount} icon={IndianRupee} colorClass="text-green-600" />
          <StatCard title="Total Interest" value={calculations.totalInterest} icon={TrendingUp} colorClass="text-red-500" />
          <StatCard title="Total Cost" value={calculations.totalCost} icon={Car} colorClass="text-indigo-600" />
        </div>

        {/* Budget Impact Visualization */}
        <div className="rounded-3xl border border-border bg-white dark:bg-gray-900 p-8 shadow-sm">
           <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex justify-between items-center">
             Budget Impact 
             <span className="text-primary">₹{Math.round(calculations.emi + maintenanceMonthly).toLocaleString()} /mo</span>
           </h4>
           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-32 w-32 flex-shrink-0 flex items-center justify-center">
                  <PieChart width={128} height={128}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
              </div>
              <div className="space-y-4 flex-1 w-full">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Surplus</p>
                    <p className={cn(
                      "text-lg font-black",
                      (calculations.netIncome - calculations.emi) >= 0 ? "text-green-600" : "text-red-500"
                    )}>
                      ₹{Math.round(calculations.netIncome - calculations.emi).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-tight">Remaining after all expenses + new car EMI.</p>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Salary Personalization Active 
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const CreditCard = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
