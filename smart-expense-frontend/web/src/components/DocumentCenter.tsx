import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { deleteTaxDocument, downloadTaxDocument, getTaxDocuments, uploadTaxDocument } from '@smart-expense/shared/src/api/tax';
import { TaxInvestmentDoc } from '@smart-expense/shared/src/types';

export const DocumentCenter: React.FC = () => {
  const [docs, setDocs] = useState<TaxInvestmentDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('80C');
  const [amount, setAmount] = useState('');
  const [fiscalYear, setFiscalYear] = useState('2026');

  const fetchDocs = async () => {
    try {
      const documents = await getTaxDocuments();
      setDocs(documents);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !amount) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('amount', amount);
    formData.append('fiscalYear', fiscalYear);

    try {
      await uploadTaxDocument(formData);
      setFile(null);
      setAmount('');
      fetchDocs();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const fileBlob = await downloadTaxDocument(id);
      const url = window.URL.createObjectURL(new Blob([fileBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteTaxDocument(id);
      fetchDocs();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Investment Proof Vault
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          <CheckCircle className="h-3 w-3 text-green-500" />
          Verified Deductions: ₹{docs.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
        </div>
      </div>

      <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1">Document File</label>
          <div className="relative">
            <input 
              type="file" 
              className="hidden" 
              id="doc-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label 
              htmlFor="doc-upload"
              className="flex items-center gap-2 w-full px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors text-sm truncate"
            >
              <Upload className="h-4 w-4" />
              {file ? file.name : "Select Proof..."}
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1">Category</label>
          <select 
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="80C">Section 80C (PPF/LIC/ELSS)</option>
            <option value="80D">Section 80D (Health Insurance)</option>
            <option value="HLI">House Loan Interest</option>
            <option value="HRA">Rent Receipts (HRA)</option>
            <option value="OTHER">Other Proofs</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-1">Deduction Amount (₹)</label>
          <input 
            type="number" 
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-border rounded-lg text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button 
            type="submit" 
            disabled={uploading || !file || !amount}
            className="w-full h-[38px] flex items-center justify-center gap-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 font-bold"
          >
            {uploading ? "Uploading..." : <><Plus className="h-4 w-4" /> Add Document</>}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-bold opacity-60">Document ID</th>
              <th className="px-4 py-3 text-left font-bold opacity-60">Category</th>
              <th className="px-4 py-3 text-left font-bold opacity-60">Amount</th>
              <th className="px-4 py-3 text-left font-bold opacity-60">Date</th>
              <th className="px-4 py-3 text-right font-bold opacity-60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                  No verification documents uploaded yet.
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {doc.fileName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-secondary text-xs font-bold text-secondary-foreground">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-primary">
                    ₹{doc.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-600 dark:text-blue-400">
        <AlertCircle className="h-4 w-4" />
        <p>Verified deductions are automatically factored into your tax liability calculations above.</p>
      </div>
    </div>
  );
};
