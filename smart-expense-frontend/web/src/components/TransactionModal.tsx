import React, { useState, useEffect } from 'react';
import { X, Receipt, IndianRupee, Info, CreditCard, TrendingUp, Sparkles } from 'lucide-react';
import { createExpense, createIncome, createLoan, suggestDiscovery } from '@smart-expense/shared/src/api/transactions';
import { cn } from '../lib/utils';
import { IncomeCategory } from '@smart-expense/shared/src/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fixedType?: 'EXPENSE' | 'INCOME' | 'LOAN';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess, fixedType }) => {

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'LOAN'>(fixedType || 'EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [loanName, setLoanName] = useState('');
  const [financeName, setFinanceName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loanType, setLoanType] = useState('PERSONAL');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<IncomeCategory | string>(fixedType === 'INCOME' ? 'SALARY' : 'FOOD_DINING');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [isTaxable, setIsTaxable] = useState(true);
  const [assetType, setAssetType] = useState('STOCKS');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRateUnknown, setIsRateUnknown] = useState(false);
  const [repaymentType, setRepaymentType] = useState<'EMI' | 'MONTHLY_INTEREST' | 'BULLET'>('EMI');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [lastDiscoveredAt, setLastDiscoveredAt] = useState<string>('');
  const [discoveryMessage, setDiscoveryMessage] = useState<string | null>(null);

  const isInterestOnly = repaymentType === 'MONTHLY_INTEREST';
  const isBullet = repaymentType === 'BULLET';

  const SUGGESTED_RATES: Record<string, number> = {
    'HOME': 8.5,
    'GOLD': 11.0,
    'PERSONAL': 12.0,
    'CAR': 9.0,
    'EDUCATION': 10.5,
    'BUSINESS': 14.0,
    'OTHER': 10.0
  };

  const applySuggestedRate = () => {
    const rate = SUGGESTED_RATES[loanType] || 10.0;
    setInterestRate(rate.toString());
  };

  // Real-time Intelligent Auto-Discovery
  useEffect(() => {
    if (type !== 'EXPENSE' || !description || description.length < 3) return;

    const timer = setTimeout(async () => {
      setIsDiscovering(true);
      try {
        const discovery = await suggestDiscovery(description);
        if (discovery.confidence === 'HIGH') {
            setCategory(discovery.category);
            setIsTaxDeductible(discovery.isTaxDeductible);
            setLastDiscoveredAt(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Discovery failed', err);
      } finally {
        setIsDiscovering(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [description, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'EXPENSE') {
        await createExpense({
          amount: parseFloat(amount),
          description,
          date,
          isTaxDeductible,
          categoryName: category,
        });
      } else if (type === 'INCOME') {
        await createIncome({
          amount: parseFloat(amount),
          source,
          date,
          category: category as IncomeCategory,
          isTaxable,
          ...(category === 'CAPITAL_GAINS' ? {
            assetType,
            purchasePrice: parseFloat(purchasePrice) || 0,
            purchaseDate: purchaseDate || date
          } : {})
        });
      } else if (type === 'LOAN') {
        await createLoan({
          loanName,
          financeName,
          purpose,
          loanType,
          repaymentType,
          principalAmount: parseFloat(principal),
          interestRate: !isRateUnknown ? parseFloat(interestRate) : undefined,
          tenureMonths: parseInt(tenure, 10),
          emiAmount: isRateUnknown ? parseFloat(amount) : (repaymentType === 'BULLET' ? parseFloat(amount) : undefined),
          startDate: date,
        });
      }
      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction', error);
      alert('Error adding transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setSource('');
    setLoanName('');
    setFinanceName('');
    setPurpose('');
    setPrincipal('');
    setInterestRate('');
    setTenure('');
    setCategory(type === 'INCOME' ? 'SALARY' : 'FOOD_DINING');
    setIsTaxDeductible(false);
    setIsTaxable(true);
  };

  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME' | 'LOAN') => {
    setType(newType);
    setCategory(newType === 'INCOME' ? 'SALARY' : 'FOOD_DINING');
    // Clear mutual fields when switching
    setDescription('');
    setSource('');
    setDiscoveryMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-2 py-4 md:px-4">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header - Fixed & Compact */}
        <div className={cn(
           "px-5 py-3 border-b-2 shrink-0 flex items-center justify-between",
           type === 'EXPENSE' ? "border-rose-100 dark:border-rose-900/20" : 
           type === 'INCOME' ? "border-emerald-100 dark:border-emerald-900/20" : 
           "border-indigo-100 dark:border-indigo-900/20"
        )}>
           <div className="flex items-center gap-3">
              <div className={cn(
                 "p-2 rounded-xl",
                 type === 'EXPENSE' ? "bg-rose-100 text-rose-600" : 
                 type === 'INCOME' ? "bg-emerald-100 text-emerald-600" : 
                 "bg-indigo-100 text-indigo-600"
              )}>
                 {type === 'EXPENSE' ? <Receipt className="h-5 w-5" /> : 
                  type === 'INCOME' ? <IndianRupee className="h-5 w-5" /> : 
                  <CreditCard className="h-5 w-5" />}
              </div>
              <div>
                 <h2 className="text-lg font-black tracking-tight leading-tight">Add {type.charAt(0) + type.slice(1).toLowerCase()}</h2>
                 <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Transaction Entry</p>
              </div>
           </div>

           <button 
             onClick={() => {
               resetForm();
               onClose();
             }} 
             className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
           >
             <X className="h-5 w-5" />
           </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
           <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
             {/* Toggle Type */}
             {!fixedType && (
               <div className="flex p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg mb-5">
                 <button
                   type="button"
                   onClick={() => handleTypeChange('EXPENSE')}
                   className={cn(
                     "flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold rounded-md transition-all",
                     type === 'EXPENSE' ? "bg-white dark:bg-gray-700 shadow-sm text-rose-600" : "text-gray-500 hover:text-gray-700"
                   )}
                 >
                   <Receipt className="h-3 w-3" />
                   Expense
                 </button>
                 <button
                   type="button"
                   onClick={() => handleTypeChange('INCOME')}
                   className={cn(
                     "flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold rounded-md transition-all",
                     type === 'INCOME' ? "bg-white dark:bg-gray-700 shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
                   )}
                 >
                   <IndianRupee className="h-3 w-3" />
                   Income
                 </button>
                 <button
                   type="button"
                   onClick={() => handleTypeChange('LOAN')}
                   className={cn(
                     "flex-1 flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold rounded-md transition-all",
                     type === 'LOAN' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
                   )}
                 >
                   <CreditCard className="h-3 w-3" />
                   Loan
                 </button>
               </div>
             )}

             <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="col-span-2 relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">
                    {type === 'EXPENSE' ? 'Description' : 'Source'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={type === 'EXPENSE' ? 'Lunch, Rent, etc.' : 'Salary, Freelance, etc.'}
                    value={type === 'EXPENSE' ? description : source}
                    onChange={(e) => type === 'EXPENSE' ? setDescription(e.target.value) : setSource(e.target.value)}
                  />
                  {type === 'EXPENSE' && isDiscovering && (
                    <div className="absolute right-3 top-7 flex items-center gap-1.5 text-[8px] font-bold text-primary animate-pulse">
                       <Sparkles className="h-2 w-2" />
                       Thinking...
                    </div>
                  )}
                </div>

                {(type === 'INCOME' || type === 'EXPENSE') && (
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                      {discoveryMessage && (
                        <span className="text-[9px] font-black text-emerald-600 animate-bounce">
                          {discoveryMessage}
                        </span>
                      )}
                    </div>
                    <select
                      className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setDiscoveryMessage(null);
                      }}
                    >
                      {type === 'INCOME' ? (
                        <>
                          <option value="SALARY">Salary</option>
                          <option value="BUSINESS_PROFESSION">Business/Profession</option>
                          <option value="PRESUMPTIVE_BUSINESS">Presumptive Business (ITR-4)</option>
                          <option value="CAPITAL_GAINS">Capital Gains (Stocks/Gold)</option>
                          <option value="HOUSE_PROPERTY">Rental/House Property</option>
                          <option value="INTEREST">Interest Income</option>
                          <option value="DIVIDENDS">Dividends</option>
                          <option value="OTHER_SOURCES">Other Sources</option>
                        </>
                      ) : (
                        <>
                          <option value="FOOD_DINING">Food & Dining</option>
                          <option value="HOUSING_RENT">Housing & Rent</option>
                          <option value="UTILITIES">Utilities</option>
                          <option value="TRANSPORTATION">Transportation</option>
                          <option value="HEALTH_FITNESS">Health & Fitness</option>
                          <option value="SHOPPING">Shopping</option>
                          <option value="ENTERTAINMENT">Entertainment</option>
                          <option value="TRAVEL">Travel</option>
                          <option value="EDUCATION">Education</option>
                          <option value="PERSONAL_CARE">Personal Care</option>
                          <option value="INVESTMENTS">Investments</option>
                          <option value="MISCELLANEOUS">Miscellaneous</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {type === 'INCOME' && category === 'CAPITAL_GAINS' && (
                  <div className="col-span-2 grid grid-cols-2 gap-3 mt-1 animate-in slide-in-from-top-2 duration-300">
                    <div className="col-span-2">
                       <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.2em] text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5" /> Capital Gains Info
                       </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">Asset</label>
                      <select
                        className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                      >
                        <option value="STOCKS">Equity/Stocks</option>
                        <option value="GOLD">Gold/Silver</option>
                        <option value="REAL_ESTATE">Real Estate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">Buy Price</label>
                      <input
                        type="number"
                        className="w-full rounded-xl border border-border bg-white dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {type === 'LOAN' && (
                  <div className="col-span-2 space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <div>
                       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2 bg-indigo-50 dark:bg-indigo-950/30 w-fit px-2 py-0.5 rounded-full">
                          <Receipt className="h-2.5 w-2.5" /> Basic Info
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">
                               {loanType === 'GOLD' ? 'Gold Loan Designation' : 'Loan Name'}
                            </label>
                            <input
                              type="text"
                              required
                              className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              placeholder={loanType === 'GOLD' ? 'e.g. Muthoot / SBI Gold' : 'e.g. HDFC Home Loan'}
                              value={loanName}
                              onChange={(e) => setLoanName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">
                               {loanType === 'GOLD' ? 'Gold Financier' : 'Institution'}
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              placeholder="Bank/Company"
                              value={financeName}
                              onChange={(e) => setFinanceName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">
                               {loanType === 'GOLD' ? 'Gold Item/Need' : 'Purpose'}
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              placeholder="Why this loan?"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                            />
                          </div>
                       </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 w-fit px-2 py-0.5 rounded-full">
                            <IndianRupee className="h-2.5 w-2.5" /> Financial Terms
                        </div>
                        <div className="flex items-center gap-2">
                           {loanType === 'GOLD' && (
                             <select 
                               className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-none rounded-md px-2 py-0.5 focus:ring-0 cursor-pointer"
                               value={repaymentType}
                               onChange={(e) => setRepaymentType(e.target.value as any)}
                             >
                                <option value="EMI">EMI</option>
                                <option value="MONTHLY_INTEREST">Interest Only</option>
                                <option value="BULLET">Bullet Payment</option>
                             </select>
                           )}
                           <label className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground cursor-pointer ml-1">
                              <input 
                                type="checkbox" 
                                className="h-3 w-3 rounded border-gray-300 text-indigo-600"
                                checked={isRateUnknown}
                                onChange={(e) => setIsRateUnknown(e.target.checked)}
                              />
                              Rate Unknown?
                           </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div className={cn((isRateUnknown || isInterestOnly) ? "col-span-2" : "col-span-1")}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Loan Type</label>
                            <select
                              className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              value={loanType}
                              onChange={(e) => setLoanType(e.target.value)}
                            >
                              <option value="PERSONAL">Personal</option>
                              <option value="GOLD">Gold</option>
                              <option value="HOME">Home</option>
                              <option value="CAR">Car</option>
                              <option value="EDUCATION">Edu</option>
                              <option value="BUSINESS">Biz</option>
                            </select>
                         </div>
                         
                         {!(isRateUnknown || isInterestOnly) && (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Principal (₹)</label>
                              <input
                                type="number"
                                required
                                className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                placeholder="0.00"
                                value={principal}
                                onChange={(e) => setPrincipal(e.target.value)}
                              />
                            </div>
                         )}

                         {(isRateUnknown || repaymentType !== 'EMI') && (
                            <div className="col-span-2 grid grid-cols-2 gap-3">
                               <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Total Principal (₹)</label>
                                  <input
                                    type="number"
                                    required
                                    className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="0.00"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                  />
                               </div>
                               <div>
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1 ml-1">
                                     {repaymentType === 'MONTHLY_INTEREST' ? 'Int/Mo (₹)' : 
                                      repaymentType === 'BULLET' ? 'Maturity (₹)' : 'Pay/Mo (₹)'}
                                  </label>
                                  <input
                                    type="number"
                                    required
                                    className="w-full rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 px-3 py-1.5 text-sm font-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                  />
                               </div>
                            </div>
                         )}
                         
                         <div>
                             <div className="flex items-center justify-between mb-1 ml-1 leading-none">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                   {isRateUnknown ? 'Tenure (Mo)' : 'Rate (%)'}
                                </label>
                                {!isRateUnknown && !interestRate && (
                                   <button 
                                     type="button" 
                                     onClick={applySuggestedRate}
                                     className="text-[8px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                                   >
                                     Suggest?
                                   </button>
                                )}
                             </div>
                             <input
                               type="number"
                               step="0.1"
                               required
                               className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                               placeholder={isRateUnknown ? 'e.g. 12' : `e.g. ${SUGGESTED_RATES[loanType] || 10.5}`}
                               value={isRateUnknown ? tenure : interestRate}
                               onChange={(e) => isRateUnknown ? setTenure(e.target.value) : setInterestRate(e.target.value)}
                             />
                         </div>

                         {(!isRateUnknown || repaymentType === 'EMI') && (
                            <div>
                               <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">Tenure (Mo)</label>
                               <input
                                 type="number"
                                 required
                                 className="w-full rounded-xl border border-border bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                 placeholder="Months"
                                 value={tenure}
                                 onChange={(e) => setTenure(e.target.value)}
                               />
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
             </div>

             {type !== 'LOAN' && (
               <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Info className="h-4 w-4 text-primary" />
                     <div>
                        <p className="text-[11px] font-bold">{type === 'EXPENSE' ? 'Tax Deductible?' : 'Taxable Income?'}</p>
                        <p className="text-[9px] text-muted-foreground">Automatically detected by AI</p>
                     </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={type === 'EXPENSE' ? isTaxDeductible : isTaxable}
                    onChange={(e) => type === 'EXPENSE' ? setIsTaxDeductible(e.target.checked) : setIsTaxable(e.target.checked)}
                  />
               </div>
             )}
           </form>
        </div>

        {/* Footer - Fixed */}
        <div className="px-5 py-3 border-t bg-gray-50 dark:bg-gray-800/10 shrink-0">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="flex-1 rounded-lg border border-border py-1.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="transaction-form"
              disabled={loading}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-sm font-bold text-white transition-all transform active:scale-95",
                type === 'EXPENSE' ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20" : 
                type === 'INCOME' ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" : 
                "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? 'Processing...' : `Add ${type.charAt(0) + type.slice(1).toLowerCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
