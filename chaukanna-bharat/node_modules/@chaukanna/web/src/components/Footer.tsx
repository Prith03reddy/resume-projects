import React from 'react';
import { Shield, ExternalLink, Heart } from 'lucide-react';
import { OFFICIAL_PORTALS } from '@chaukanna/shared';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Mandate */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>CHAUKANNA BHARAT (चौंकन्ना भारत)</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-center md:text-left">
            &ldquo;AI does the reading. Evidence does the verdict.&rdquo;
          </p>
          <p className="text-[11px] text-slate-400">
            Dedicated to protecting Indian retail investors and citizens from digital financial fraud.
          </p>
        </div>

        {/* Regulatory Portals */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <a
            href={OFFICIAL_PORTALS.SEBI_SCORES}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>SEBI SCORES</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={OFFICIAL_PORTALS.RBI_SACHET}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>RBI Sachet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={OFFICIAL_PORTALS.CYBERCRIME_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>Cybercrime 1930</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={OFFICIAL_PORTALS.NPCI_UPI_SAFETY}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>NPCI UPI Safety</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
