import React, { useState } from 'react';
import { Send, FileText, Sparkles, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';

export const TextInputTab: React.FC = () => {
  const { t } = useLanguage();
  const { analyzeText, loading } = useAnalysis();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      analyzeText(text.trim());
    }
  };

  const handleQuickPaste = (sampleText: string) => {
    setText(sampleText);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.inputPlaceholders.text}
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner resize-y font-mono"
        />

        {/* Action icons on top right */}
        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Paste Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Quick samples:</span>
        <button
          type="button"
          onClick={() => handleQuickPaste('SEBI approved. Guaranteed 40% returns. Join VIP Telegram. Send ₹10,000 today.')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          SEBI 40% VIP Tip
        </button>
        <button
          type="button"
          onClick={() => handleQuickPaste('Part-time income: Like 5 YouTube videos daily and earn ₹3500. Pay ₹1,500 security deposit to upi: taskbonus@okaxis')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          YouTube Task Scam
        </button>
        <button
          type="button"
          onClick={() => handleQuickPaste('HDFC Bank: Rs 1,450.00 debited from A/c **4821 on 05-OCT-26 at RELIANCE RETAIL. UPI Ref: 427918239102. If not you, SMS BLOCK to 5676712 or call 18001600. Check: hdfcbank.com')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          Authentic Bank SMS
        </button>
      </div>

      {/* Submit CTA */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400">
          {text.length} characters • Ephemeral processing
        </span>
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.actions.analyzing}
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t.actions.analyze}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
