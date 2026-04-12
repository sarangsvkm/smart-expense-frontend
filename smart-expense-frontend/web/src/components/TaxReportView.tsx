import React from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, Info, 
  ArrowRight, Download, Calculator, TrendingUp 
} from 'lucide-react';
import { TaxReportResponse } from '@smart-expense/shared/src/types';
import { cn } from '../lib/utils';

interface TaxReportViewProps {
  report: TaxReportResponse | null;
  loading: boolean;
}

export const TaxReportView: React.FC<TaxReportViewProps> = ({ report, loading }) => {
  if (loading) return <div>Loading reports...</div>;

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-gray-50/50 dark:bg-gray-900/50">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Tax Data Available</h3>
        <p className="text-muted-foreground max-w-md">
          Please add your income and expenses to generate a real-time tax estimation and ITR recommendation.
        </p>
      </div>
    );
  }

  const isNewRegimeBetter = report.recommendedRegime === 'NEW_REGIME';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recommendation Card */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Recommended
              </span>
              <h3 className="text-3xl font-bold">{report.recommendedRegime.replace('_', ' ')}</h3>
            </div>
            <div className="rounded-full bg-white dark:bg-primary shadow-lg p-3">
              <CheckCircle2 className="h-8 w-8 text-primary dark:text-white" />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
            Based on your income profile, the {report.recommendedRegime.toLowerCase().replace('_', ' ')} will save you approximately 
            <span className="text-primary font-bold"> ₹{Math.abs(report.estimatedTaxOldRegime - report.estimatedTaxNewRegime).toLocaleString()} </span> 
            this financial year.
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary group cursor-pointer">
            Explore why <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* ITR Form Card */}
        <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 p-4">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Target ITR Form</p>
              <h3 className="text-2xl font-bold">{report.itrType.split(' ')[0]}</h3>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {report.itrType}
          </p>
          <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" />
            Download Readiness Checklist
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-border bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Regime Comparison (FY 2025-26)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100/50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Metric</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Old Regime</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">New Regime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4 text-sm font-medium">Gross Total Income</td>
                <td className="px-6 py-4 text-sm">₹{(report.totalSalaryIncome + report.totalBusinessIncome + report.totalCapitalGains + report.totalOtherIncome).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">₹{(report.totalSalaryIncome + report.totalBusinessIncome + report.totalCapitalGains + report.totalOtherIncome).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium">Total Deductions (80C, etc.)</td>
                <td className="px-6 py-4 text-sm text-red-600">-₹{report.totalDeductions.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-400">Not Applicable</td>
              </tr>
              <tr className="bg-primary/5">
                <td className="px-6 py-4 text-sm font-bold">Estimated Tax Payable</td>
                <td className={cn("px-6 py-4 text-lg font-bold", !isNewRegimeBetter ? "text-primary" : "text-muted-foreground")}>
                  ₹{report.estimatedTaxOldRegime.toLocaleString()}
                </td>
                <td className={cn("px-6 py-4 text-lg font-bold", isNewRegimeBetter ? "text-primary" : "text-muted-foreground")}>
                  ₹{report.estimatedTaxNewRegime.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 flex items-start gap-4">
        <Info className="h-6 w-6 text-orange-600 dark:text-orange-400 shrink-0" />
        <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed font-medium">
          <span className="font-bold">Important:</span> This calculation is based on current financial data and acts as an estimation. 
          Please consult a professional Chartered Accountant (CA) before final submission to the Income Tax Department.
        </p>
      </div>
    </div>
  );
};
