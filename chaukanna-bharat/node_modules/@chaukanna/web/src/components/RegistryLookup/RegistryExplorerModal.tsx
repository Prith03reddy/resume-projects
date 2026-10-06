import React, { useState, useEffect } from 'react';
import { X, Search, Database, ExternalLink, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RegistryItem } from '@chaukanna/shared';
import { searchRegistryApi } from '../../utils/api.js';

interface RegistryExplorerModalProps {
  onClose: () => void;
}

export const RegistryExplorerModal: React.FC<RegistryExplorerModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [results, setResults] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await searchRegistryApi(searchTerm, selectedCategory);
        setResults(data.results);
      } catch (err) {
        console.error('Failed to fetch registry items:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Official Regulatory Registry Explorer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live verification against official SEBI &amp; RBI permitted directories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by entity name, SEBI/RBI registration no (e.g., INH000001234, Zerodha, Bajaj Finance)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Registries
            </button>
            <button
              onClick={() => setSelectedCategory('SEBI_RA')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === 'SEBI_RA'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              SEBI Research Analysts
            </button>
            <button
              onClick={() => setSelectedCategory('SEBI_RIA')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === 'SEBI_RIA'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              SEBI Investment Advisers
            </button>
            <button
              onClick={() => setSelectedCategory('RBI_NBFC')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === 'RBI_NBFC'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              RBI NBFCs
            </button>
            <button
              onClick={() => setSelectedCategory('KNOWN_FRAUD_PATTERN')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedCategory === 'KNOWN_FRAUD_PATTERN'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60'
              }`}
            >
              Blacklisted Scam Syndicates
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50/60 dark:bg-slate-950/60">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin inline-block mb-2" />
              <p>Searching official registries...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p className="font-semibold text-sm">No official records matched &quot;{searchTerm}&quot;</p>
              <p className="mt-1 text-slate-400">
                Transparent Uncertainty: Entities not found here must be verified on sebi.gov.in before any transaction.
              </p>
            </div>
          ) : (
            results.map((item) => {
              const isBlacklisted = item.status === 'BLACKLISTED';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border bg-white dark:bg-slate-900 transition-all ${
                    isBlacklisted
                      ? 'border-red-200 dark:border-red-900/60 bg-red-50/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {isBlacklisted ? (
                        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span>{item.name}</span>
                    </h4>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isBlacklisted
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono">
                      <span>Reg No: <strong className="text-slate-800 dark:text-slate-200">{item.registrationNo}</strong></span>
                      {item.verifiedSince && (
                        <span>• Active since: {item.verifiedSince}</span>
                      )}
                    </div>

                    {item.officialPortalUrl && (
                      <a
                        href={item.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
