import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, FileText, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '@chaukanna/shared';
import { exportIncidentDossierApi } from '../../utils/api.js';

interface DownloadReportModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ result, onClose }) => {
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exportIncidentDossierApi(result)
      .then((data) => {
        setReportMarkdown(data.markdownReport);
      })
      .catch((err) => {
        console.error('Report generation error:', err);
        setReportMarkdown(`Chaukanna Bharat Safety Dossier - ID: ${result.id}\nRisk: ${result.riskLevel} (${result.riskScore}/100)\n\nEvidence Summary:\n${result.summaryExplanation}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Chaukanna_Bharat_Dossier_${result.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              Financial Safety Verification Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs bg-slate-50/50 dark:bg-slate-950/50">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <span className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin inline-block mb-2" />
              <p>Compiling official evidence dossier...</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 select-all">
              {reportMarkdown}
            </pre>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Compliant for submission to National Cybercrime Helpline 1930
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
