import React, { useState } from 'react';
import { MessageSquareText, Image, FileText, Link2, Mic } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { TextInputTab } from './TextInputTab.js';
import { ScreenshotTab } from './ScreenshotTab.js';
import { PdfTab } from './PdfTab.js';
import { UrlTab } from './UrlTab.js';
import { VoiceTab } from './VoiceTab.js';

type TabKey = 'text' | 'screenshot' | 'pdf' | 'url' | 'voice';

export const InputContainer: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>('text');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'text', label: t.tabs.text, icon: <MessageSquareText className="w-4 h-4" /> },
    { key: 'screenshot', label: t.tabs.screenshot, icon: <Image className="w-4 h-4" /> },
    { key: 'pdf', label: t.tabs.pdf, icon: <FileText className="w-4 h-4" /> },
    { key: 'url', label: t.tabs.url, icon: <Link2 className="w-4 h-4" /> },
    { key: 'voice', label: t.tabs.voice, icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/70 dark:bg-slate-950/40 p-1.5 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="p-5 sm:p-6">
        {activeTab === 'text' && <TextInputTab />}
        {activeTab === 'screenshot' && <ScreenshotTab />}
        {activeTab === 'pdf' && <PdfTab />}
        {activeTab === 'url' && <UrlTab />}
        {activeTab === 'voice' && <VoiceTab />}
      </div>
    </div>
  );
};
