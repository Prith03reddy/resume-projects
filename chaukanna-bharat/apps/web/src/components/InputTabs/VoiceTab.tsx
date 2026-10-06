import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Send, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';

export const VoiceTab: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { analyzeVoice, loading } = useAnalysis();
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(prev => (prev ? `${prev} ${currentText}` : currentText));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleQuickVoiceSample = (sample: 'digital-arrest' | 'lottery') => {
    if (sample === 'digital-arrest') {
      setTranscript('Audio Message: "This is Inspector Vijay from Cyber Crime Branch. A parcel with illegal narcotics has been seized in your Aadhaar name. To avoid immediate physical arrest, transfer ₹50,000 security bail money to RBI clearing UPI id: policesafe@ybl right now."');
    } else {
      setTranscript('Audio Call: "Namaste Sir, congratulations you have won ₹25 Lakhs in Kaun Banega Crorepati lucky draw! To release the tax-free cheque into your SBI account, please send GST clearance fee of ₹4,999 to our manager via Google Pay."');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim() && !loading) {
      analyzeVoice(transcript.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mic Record Button */}
      <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={!speechSupported}
          className={`relative p-5 rounded-full transition-all shadow-lg cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-400/30'
              : speechSupported
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {isRecording
            ? 'Listening... Speak in Hindi or English now'
            : speechSupported
            ? 'Tap microphone to speak financial message'
            : 'Speech recognition requires Chrome or Edge (or type below)'}
        </p>

        {isRecording && (
          <div className="mt-2 flex items-center gap-1">
            <span className="w-1.5 h-4 bg-red-500 rounded-full animate-wave-1" />
            <span className="w-1.5 h-6 bg-red-500 rounded-full animate-wave-2" />
            <span className="w-1.5 h-8 bg-red-500 rounded-full animate-wave-3" />
            <span className="w-1.5 h-5 bg-red-500 rounded-full animate-wave-4" />
            <span className="w-1.5 h-3 bg-red-500 rounded-full animate-wave-5" />
          </div>
        )}
      </div>

      {/* Transcript Textarea */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Spoken audio transcript or forwarded voice message:
        </label>
        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={t.inputPlaceholders.voice}
          className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
        />
      </div>

      {/* Voice Samples */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Sample audio notes:</span>
        <button
          type="button"
          onClick={() => handleQuickVoiceSample('digital-arrest')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Fake "Digital Arrest" Police Threat
        </button>
        <button
          type="button"
          onClick={() => handleQuickVoiceSample('lottery')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Fake KBC Lottery Call
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!transcript.trim() || loading}
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
