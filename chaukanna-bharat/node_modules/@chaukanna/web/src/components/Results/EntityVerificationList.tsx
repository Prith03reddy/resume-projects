import React from 'react';
import { Database, CheckCircle, XCircle, HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { ExtractedEntity, EntityVerificationStatus } from '@chaukanna/shared';
import { useLanguage } from '../../context/LanguageContext.js';

interface EntityVerificationListProps {
  entities: ExtractedEntity[];
}

export const EntityVerificationList: React.FC<EntityVerificationListProps> = ({ entities }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: EntityVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle className="w-3.5 h-3.5" />
            {t.entityStatus.verified}
          </span>
        );
      case 'NOT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
            <XCircle className="w-3.5 h-3.5" />
            {t.entityStatus.notVerified}
          </span>
        );
      case 'COULD_NOT_DETERMINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
            <HelpCircle className="w-3.5 h-3.5" />
            {t.entityStatus.couldNotDetermine}
          </span>
        );
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'ORGANIZATION': return 'Organization';
      case 'REGISTRATION_NUMBER': return 'Reg Number (SEBI/RBI)';
      case 'UPI_ID': return 'UPI Handle';
      case 'URL': return 'URL / Platform';
      case 'RETURN_CLAIM': return 'Return Claim';
      case 'URGENCY_TRIGGER': return 'Urgency Cue';
      case 'PHONE': return 'Phone Contact';
      case 'AMOUNT': return 'Amount Solicited';
      default: return type;
    }
  };

  if (entities.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
        No specific financial entities or registration claims identified in this input.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t.sections.entitiesTitle}</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Verified against official SEBI &amp; RBI records
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Claim Type</th>
              <th className="px-4 py-3">Extracted Entity / Value</th>
              <th className="px-4 py-3">Verification Status</th>
              <th className="px-4 py-3">Official Finding / Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
            {entities.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    {getEntityTypeLabel(e.type)}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold font-mono text-slate-900 dark:text-white max-w-[200px] truncate" title={e.rawValue}>
                  {e.rawValue}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(e.verificationStatus)}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                  <p>{e.verificationDetails}</p>
                  {e.officialMatch && (
                    <div className="mt-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{e.officialMatch.name} ({e.officialMatch.registrationNo})</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
