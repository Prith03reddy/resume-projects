import { Router, Request, Response } from 'express';
import multer from 'multer';
import { DEMO_SAMPLES } from '@chaukanna/shared';
import {
  ingestRawText,
  ingestUrl,
  ingestImageBuffer,
  ingestPdfBuffer,
  ingestAudio,
  IngestedContent,
} from '../pipeline/1-ingest.js';
import { extractEntities } from '../pipeline/2-extract.js';
import { verifyExtractedEntities } from '../pipeline/3-verify.js';
import { compileVerdict } from '../pipeline/4-verdict.js';

const router = Router();

// Ephemeral in-memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

function runPipeline(content: IngestedContent) {
  const startTime = Date.now();
  // Stage 2: Parse & Extract
  const entities = extractEntities(content.sanitizedText);

  // Stage 3: Verify against Permitted Registries
  const verifiedResults = verifyExtractedEntities(entities);

  // Stage 4: Compile Evidence Verdict & Multilingual Advisory
  const verdict = compileVerdict(
    content.inputType,
    content.rawPreview,
    verifiedResults,
    content.guardrails,
    startTime
  );

  return verdict;
}

/**
 * POST /api/analyze/text
 */
router.post('/text', (req: Request, res: Response): void => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: 'Please provide message text to verify.' });
    return;
  }

  const ingested = ingestRawText(text);
  const result = runPipeline(ingested);
  res.json(result);
});

/**
 * POST /api/analyze/url
 */
router.post('/url', (req: Request, res: Response): void => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    res.status(400).json({ error: 'Please provide a URL to verify.' });
    return;
  }

  const ingested = ingestUrl(url);
  const result = runPipeline(ingested);
  res.json(result);
});

/**
 * POST /api/analyze/image
 * Accepts multipart file 'image' OR JSON { imageBase64, textHint }
 */
router.post('/image', upload.single('image'), (req: Request, res: Response): void => {
  let fileBuffer: Buffer | null = null;
  let mimeType = 'image/png';
  let textHint: string | undefined = req.body?.textHint;

  if (req.file) {
    fileBuffer = req.file.buffer;
    mimeType = req.file.mimetype;
  } else if (req.body?.imageBase64) {
    const rawB64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
    fileBuffer = Buffer.from(rawB64, 'base64');
    mimeType = req.body.imageMimeType || 'image/png';
  }

  if (!fileBuffer && !textHint) {
    res.status(400).json({ error: 'Please upload an image file or provide screenshot data.' });
    return;
  }

  const dummyBuffer = fileBuffer || Buffer.from('mock-image-data');
  const ingested = ingestImageBuffer(dummyBuffer, mimeType, textHint);
  const result = runPipeline(ingested);
  res.json(result);
});

/**
 * POST /api/analyze/pdf
 * Accepts multipart file 'pdf' OR JSON { pdfBase64, filename, textHint }
 */
router.post('/pdf', upload.single('pdf'), (req: Request, res: Response): void => {
  let fileBuffer: Buffer | null = null;
  let filename = 'document.pdf';
  let textHint: string | undefined = req.body?.textHint;

  if (req.file) {
    fileBuffer = req.file.buffer;
    filename = req.file.originalname;
  } else if (req.body?.pdfBase64) {
    const rawB64 = req.body.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    fileBuffer = Buffer.from(rawB64, 'base64');
    filename = req.body.pdfFilename || 'document.pdf';
  }

  if (!fileBuffer && !textHint) {
    res.status(400).json({ error: 'Please upload a PDF document or provide text.' });
    return;
  }

  const dummyBuffer = fileBuffer || Buffer.from('mock-pdf-data');
  const ingested = ingestPdfBuffer(dummyBuffer, filename, textHint);
  const result = runPipeline(ingested);
  res.json(result);
});

/**
 * POST /api/analyze/voice
 */
router.post('/voice', (req: Request, res: Response): void => {
  const { transcript } = req.body;
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    res.status(400).json({ error: 'Please provide audio transcript or voice note text.' });
    return;
  }

  const ingested = ingestAudio(transcript);
  const result = runPipeline(ingested);
  res.json(result);
});

/**
 * GET /api/analyze/demo-list
 */
router.get('/demo-list', (_req: Request, res: Response): void => {
  res.json(DEMO_SAMPLES);
});

/**
 * GET /api/analyze/demo/:sampleId
 */
router.get('/demo/:sampleId', (req: Request, res: Response): void => {
  const { sampleId } = req.params;
  const sample = DEMO_SAMPLES.find(s => s.id === sampleId) || DEMO_SAMPLES[0];

  const ingested = ingestRawText(sample.text);
  const result = runPipeline(ingested);
  res.json({
    sample,
    result,
  });
});

export default router;
