import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Send, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';

export const UrlTab: React.FC = () => {
  const { t } = useLanguage();
  const { analyzeUrl, loading } = useAnalysis();
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) {
      analyzeUrl(url.trim());
    }
  };

  const handleQuickUrl = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Globe className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.inputPlaceholders.url}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
        />
      </div>

      {/* Quick samples */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Test links:</span>
        <button
          type="button"
          onClick={() => handleQuickUrl('https://t.me/sebi_vip_daily_profit_signals')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Telegram VIP Signals (t.me)
        </button>
        <button
          type="button"
          onClick={() => handleQuickUrl('https://secure-login-hdfc-kyc-update.online')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Phishing Fake Banking URL
        </button>
        <button
          type="button"
          onClick={() => handleQuickUrl('https://zerodha.com')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Verified Broker Portal (zerodha.com)
        </button>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p>
          Warning: Scammers frequently use typosquatted domains (e.g. <code>hdfc-kyc.net</code> instead of <code>hdfcbank.com</code>) or private Telegram channels to evade SEBI regulatory oversight.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.actions.analyzing}
            </span>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              {t.actions.analyze}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
