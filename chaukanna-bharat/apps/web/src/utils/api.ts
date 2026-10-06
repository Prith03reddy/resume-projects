import { AnalysisResult, DemoSample, RegistryItem } from '@chaukanna/shared';

const API_BASE = '/api';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeTextApi(text: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeUrlApi(url: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `URL analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeImageApi(fileOrBase64: File | string, textHint?: string): Promise<AnalysisResult> {
  let res: Response;
  if (typeof fileOrBase64 === 'string') {
    res = await fetch(`${API_BASE}/analyze/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: fileOrBase64, textHint }),
    });
  } else {
    const formData = new FormData();
    formData.append('image', fileOrBase64);
    if (textHint) formData.append('textHint', textHint);
    res = await fetch(`${API_BASE}/analyze/image`, {
      method: 'POST',
      body: formData,
    });
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Image analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzePdfApi(fileOrBase64: File | string, filename?: string, textHint?: string): Promise<AnalysisResult> {
  let res: Response;
  if (typeof fileOrBase64 === 'string') {
    res = await fetch(`${API_BASE}/analyze/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64: fileOrBase64, filename, textHint }),
    });
  } else {
    const formData = new FormData();
    formData.append('pdf', fileOrBase64);
    if (textHint) formData.append('textHint', textHint);
    res = await fetch(`${API_BASE}/analyze/pdf`, {
      method: 'POST',
      body: formData,
    });
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `PDF analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function analyzeVoiceApi(transcript: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Voice analysis failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDemoSampleApi(sampleId: string): Promise<{ sample: DemoSample; result: AnalysisResult }> {
  const res = await fetch(`${API_BASE}/analyze/demo/${encodeURIComponent(sampleId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load demo sample: ${res.statusText}`);
  }
  return res.json();
}

export async function searchRegistryApi(query: string, category?: string): Promise<{ total: number; results: RegistryItem[] }> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);

  const res = await fetch(`${API_BASE}/verify/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Registry search failed: ${res.statusText}`);
  }
  return res.json();
}

export async function exportIncidentDossierApi(result: AnalysisResult): Promise<{ dossierId: string; generatedAt: string; markdownReport: string }> {
  const res = await fetch(`${API_BASE}/report/export-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!res.ok) {
    throw new Error(`Failed to generate incident dossier: ${res.statusText}`);
  }
  return res.json();
}
