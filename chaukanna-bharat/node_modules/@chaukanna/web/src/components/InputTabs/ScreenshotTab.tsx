import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAnalysis } from '../../context/AnalysisContext.js';

export const ScreenshotTab: React.FC = () => {
  const { t } = useLanguage();
  const { analyzeImage, loading } = useAnalysis();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textHint, setTextHint] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleScreenshot = (type: 'whatsapp' | 'fakeqr') => {
    if (type === 'whatsapp') {
      setTextHint('WhatsApp Screenshot: "JOIN OFFICIAL SEBI VIP SIGNALS. 100% daily returns guaranteed. Pay ₹5,000 to upi: vipstocktips@ybl to get calls."');
      setPreviewUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    } else {
      setTextHint('Fake Electricity Bill Payment QR Screenshot: "Urgent: Electricity will be disconnected tonight at 9:30 PM. Call helpline 9876543210 or scan QR to pay ₹120 immediately."');
      setPreviewUrl('https://images.unsplash.com/photo-1595079672139-cdc4b0b44714?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTextHint('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((selectedFile || previewUrl || textHint) && !loading) {
      if (selectedFile) {
        analyzeImage(selectedFile, textHint);
      } else if (previewUrl) {
        analyzeImage(previewUrl, textHint);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          previewUrl
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative inline-block max-w-full">
            <img
              src={previewUrl}
              alt="Screenshot Preview"
              className="max-h-56 mx-auto rounded-lg shadow-md object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute -top-3 -right-3 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Screenshot loaded for OCR analysis
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Click to upload or drag &amp; drop screenshot
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports PNG, JPG, WEBP • WhatsApp chat, Payment QR, or Telegram screenshot
            </p>
          </div>
        )}
      </div>

      {/* Optional OCR Context / Text Hint */}
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Text extracted from image or visual description:
        </label>
        <input
          type="text"
          value={textHint}
          onChange={(e) => setTextHint(e.target.value)}
          placeholder="e.g. WhatsApp chat showing guaranteed profit promise or UPI QR code..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Quick Sample Loaders */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Sample images:</span>
        <button
          type="button"
          onClick={() => handleLoadSampleScreenshot('whatsapp')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Telegram Stock Tip Screenshot
        </button>
        <button
          type="button"
          onClick={() => handleLoadSampleScreenshot('fakeqr')}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Fake Utility Disconnection Flyer
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={(!selectedFile && !previewUrl && !textHint) || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.actions.analyzing}
            </span>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              {t.actions.analyze}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
