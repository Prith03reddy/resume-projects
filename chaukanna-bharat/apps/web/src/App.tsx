import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { InputContainer } from './components/InputTabs/InputContainer.js';
import { ResultDashboard } from './components/Results/ResultDashboard.js';
import { SecurityNotice } from './components/SecurityNotice.js';
import { Footer } from './components/Footer.js';
import { RegistryExplorerModal } from './components/RegistryLookup/RegistryExplorerModal.js';
import { useAnalysis } from './context/AnalysisContext.js';
import { AlertCircle, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { result, loading, error } = useAnalysis();
  const [registryModalOpen, setRegistryModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenRegistry={() => setRegistryModalOpen(true)} />

      <main className="flex-1">
        <HeroBanner />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start justify-between gap-3 text-red-800 dark:text-red-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* If Result exists, display ResultDashboard, else display Input Tabs */}
          {result ? (
            <ResultDashboard result={result} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Ingest &amp; Analyze Transaction Signal
                </h2>
                <span className="text-xs text-slate-400">
                  Select input format below
                </span>
              </div>
              <InputContainer />
            </div>
          )}

          {/* Security Guardrails & Privacy Architecture */}
          <SecurityNotice />
        </div>
      </main>

      {/* Registry Explorer Modal */}
      {registryModalOpen && (
        <RegistryExplorerModal onClose={() => setRegistryModalOpen(false)} />
      )}

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return <MainContent />;
};

export default App;
