import React, { createContext, useContext, useState } from 'react';
import { AnalysisResult, DemoSample, DEMO_SAMPLES } from '@chaukanna/shared';
import {
  analyzeTextApi,
  analyzeUrlApi,
  analyzeImageApi,
  analyzePdfApi,
  analyzeVoiceApi,
  fetchDemoSampleApi,
} from '../utils/api.js';

interface AnalysisContextType {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  activeDemo: DemoSample | null;
  analyzeText: (text: string) => Promise<void>;
  analyzeUrl: (url: string) => Promise<void>;
  analyzeImage: (fileOrBase64: File | string, textHint?: string) => Promise<void>;
  analyzePdf: (fileOrBase64: File | string, filename?: string, textHint?: string) => Promise<void>;
  analyzeVoice: (transcript: string) => Promise<void>;
  loadDemoById: (sampleId: string) => Promise<void>;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<DemoSample | null>(null);

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
    setActiveDemo(null);
  };

  const handleAction = async (fn: () => Promise<AnalysisResult>, demoToSet: DemoSample | null = null) => {
    setLoading(true);
    setError(null);
    setActiveDemo(demoToSet);
    try {
      const data = await fn();
      setResult(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'An unexpected verification error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeText = async (text: string) => {
    await handleAction(() => analyzeTextApi(text));
  };

  const analyzeUrl = async (url: string) => {
    await handleAction(() => analyzeUrlApi(url));
  };

  const analyzeImage = async (fileOrBase64: File | string, textHint?: string) => {
    await handleAction(() => analyzeImageApi(fileOrBase64, textHint));
  };

  const analyzePdf = async (fileOrBase64: File | string, filename?: string, textHint?: string) => {
    await handleAction(() => analyzePdfApi(fileOrBase64, filename, textHint));
  };

  const analyzeVoice = async (transcript: string) => {
    await handleAction(() => analyzeVoiceApi(transcript));
  };

  const loadDemoById = async (sampleId: string) => {
    setLoading(true);
    setError(null);
    const demo = DEMO_SAMPLES.find(s => s.id === sampleId) || DEMO_SAMPLES[0];
    setActiveDemo(demo);
    try {
      const response = await fetchDemoSampleApi(demo.id);
      setResult(response.result);
    } catch (err: any) {
      console.error('Demo error:', err);
      // Fallback: analyze sample text directly if demo endpoint is unavailable
      try {
        const directRes = await analyzeTextApi(demo.text);
        setResult(directRes);
      } catch (fallbackErr: any) {
        setError(fallbackErr?.message || 'Failed to load demo sample.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        result,
        loading,
        error,
        activeDemo,
        analyzeText,
        analyzeUrl,
        analyzeImage,
        analyzePdf,
        analyzeVoice,
        loadDemoById,
        resetAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
