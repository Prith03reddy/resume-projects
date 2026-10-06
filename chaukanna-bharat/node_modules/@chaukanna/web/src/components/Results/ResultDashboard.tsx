import React, { useState } from 'react';
import { RotateCcw, AlertOctagon, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '@chaukanna/shared';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';
import { VerdictBadge } from './VerdictBadge.js';
import { AudioPlayer } from './AudioPlayer.js';
import { EvidenceCards } from './EvidenceCards.js';
import { EntityVerificationList } from './EntityVerificationList.js';
import { ActionGuidance } from './ActionGuidance.js';
import { DownloadReportModal } from './DownloadReportModal.js';

interface ResultDashboardProps {
  result: AnalysisResult;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result }) => {
  const { t } = useLanguage();
  const { resetAnalysis } = useAnalysis();
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Reset / New Check Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.sections.verdictTitle}
          </h2>
        </div>
        <button
          onClick={resetAnalysis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.actions.reset}</span>
        </button>
      </div>

      {/* Critical Guardrail Banner: OTP / Credential Theft attempt */}
      {result.guardrailFlags.otpRequested && (
        <div className="p-4 rounded-xl border-2 border-red-500 bg-red-600 text-white shadow-lg animate-pulse-subtle flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5 text-white" />
          <div>
            <h4 className="font-extrabold text-sm sm:text-base">
              CRITICAL SECURITY THREAT: CREDENTIAL THEFT DETECTED
            </h4>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              {t.guardrails.otpAlert} Legitimate banks, RBI, and SEBI officials will NEVER ask for your OTP, PIN, password, or CVV. Disclose nothing.
            </p>
          </div>
        </div>
      )}

      {/* Guardrail Notice: Prompt Injection Sanitized */}
      {result.guardrailFlags.promptInjectionAttempted && (
        <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <p>{t.guardrails.injectionAlert}</p>
        </div>
      )}

      {/* 1. Big Verdict Badge */}
      <VerdictBadge result={result} />

      {/* 2. Voice Audio Safety Advisory */}
      <AudioPlayer result={result} />

      {/* 3. Recommended Action Guidance ("Pause. Verify. Then Act.") */}
      <ActionGuidance
        adviceList={result.actionableAdvice}
        riskLevel={result.riskLevel}
        onOpenReportModal={() => setShowReportModal(true)}
      />

      {/* 4. "Why?" Evidence Breakdown Cards */}
      <EvidenceCards evidenceCards={result.evidenceCards} />

      {/* 5. Extracted Entities & Regulatory Status */}
      <EntityVerificationList entities={result.entities} />

      {/* Download Incident Report Modal */}
      {showReportModal && (
        <DownloadReportModal
          result={result}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
