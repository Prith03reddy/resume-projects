import React, { useState } from 'react';
import { Volume2, Play, Square, Pause, RotateCcw } from 'lucide-react';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { AnalysisResult } from '@chaukanna/shared';

interface AudioPlayerProps {
  result: AnalysisResult;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ result }) => {
  const { currentLanguage, t } = useLanguage();
  const { isPlaying, isPaused, speak, stop, pause, resume, isSupported } = useSpeechSynthesis();
  const [rate, setRate] = useState<number>(0.95);

  const scriptText = result.audioScript[currentLanguage] || result.audioScript.en;

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(scriptText, currentLanguage, rate);
    }
  };

  const handleRestart = () => {
    stop();
    speak(scriptText, currentLanguage, rate);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-slate-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 p-4 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Headline & Audio Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all cursor-pointer ${
              isPlaying && !isPaused
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : t.actions.listen}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {t.actions.listen}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                {currentLanguage.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isPlaying && !isPaused ? 'Playing voice advisory...' : 'Tap play to hear spoken safety warning'}
            </p>
          </div>
        </div>

        {/* Middle: Sound wave visualizer */}
        {isPlaying && !isPaused && (
          <div className="hidden md:flex items-center gap-1 h-8 px-4">
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-1" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-2" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-3" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-4" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-5" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-2" />
            <span className="w-1 bg-emerald-500 rounded-full animate-wave-4" />
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isPlaying && (
            <>
              <button
                onClick={handleRestart}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 text-xs transition-colors"
                title="Restart Audio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={stop}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs transition-colors"
                title="Stop Audio"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Speed Selector */}
          <select
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="px-2 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value={0.8}>0.8x</option>
            <option value={0.95}>1.0x</option>
            <option value={1.2}>1.2x</option>
          </select>
        </div>
      </div>

      {/* Script text preview */}
      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
        <p className="text-xs text-slate-600 dark:text-slate-300 italic font-serif">
          &ldquo;{scriptText}&rdquo;
        </p>
      </div>
    </div>
  );
};
