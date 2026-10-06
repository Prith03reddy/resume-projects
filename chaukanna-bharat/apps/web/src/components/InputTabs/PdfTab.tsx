import React, { useState, useRef } from 'react';
import { FileUp, FileCheck, X, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';

export const PdfTab: React.FC = () => {
  const { t } = useLanguage();
  const { analyzePdf, loading } = useAnalysis();
  const [file, setFile] = useState<File | null>(null);
  const [textHint, setTextHint] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File) => {
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSamplePdf = (type: 'loan' | 'prospectus') => {
    if (type === 'loan') {
      setTextHint('Instant Loan Sanction Letter: "Approved ₹1,00,000 without documents. Borrower must deposit ₹2,499 refundable processing fee to UPI id: quickloan@okaxis prior to disbursement. Non-compliance results in legal action."');
      setFile(new File(['mock-pdf-content'], 'Instant_Loan_Agreement.pdf', { type: 'application/pdf' }));
    } else {
      setTextHint('High Yield Wealth Management Brochure: "Alpha Crypto Yield Fund — Guaranteed 35% monthly ROI backed by government sovereign bonds. Send funds to investment desk."');
      setFile(new File(['mock-pdf-content'], 'Alpha_Yield_Prospectus.pdf', { type: 'application/pdf' }));
    }
  };

  const handleClear = () => {
    setFile(null);
    setTextHint('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((file || textHint) && !loading) {
      if (file) {
        analyzePdf(file, file.name, textHint);
      } else {
        analyzePdf('mock-pdf-data', 'Document.pdf', textHint);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          file
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept="application/pdf"
          className="hidden"
        />

        {file ? (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-emerald-300 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  Ready for financial claim extraction
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileUp className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Click to upload or drag &amp; drop PDF document
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loan agreements, investment prospectus, scheme brochure, or fake sanction letters
            </p>
          </div>
        )}
      </div>

      {/* Text preview / extracted clauses */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Extracted document text or specific clauses:
        </label>
        <textarea
          rows={3}
          value={textHint}
          onChange={(e) => setTextHint(e.target.value)}
          placeholder="e.g. Loan sanction text, upfront processing fee demands, or guaranteed return promises..."
          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Quick Samples */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Sample PDFs:</span>
        <button
          type="button"
          onClick={() => handleLoadSamplePdf('loan')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Fake Loan Sanction Agreement
        </button>
        <button
          type="button"
          onClick={() => handleLoadSamplePdf('prospectus')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Guaranteed Yield Prospectus
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={(!file && !textHint) || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.actions.analyzing}
            </span>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              {t.actions.analyze}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
