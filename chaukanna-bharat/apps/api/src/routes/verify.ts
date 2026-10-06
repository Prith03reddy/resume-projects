import { Router, Request, Response } from 'express';
import { PERMITTED_REGISTRY_DATABASE, LEGITIMATE_OFFICIAL_DOMAINS } from '@chaukanna/shared';

const router = Router();

/**
 * GET /api/verify/search?q=...&category=...
 */
router.get('/search', (req: Request, res: Response): void => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim();

  let results = PERMITTED_REGISTRY_DATABASE;

  if (category) {
    results = results.filter(item => item.category === category);
  }

  if (query) {
    results = results.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.registrationNo.toLowerCase().includes(query) ||
      (item.validDomains && item.validDomains.some(d => d.toLowerCase().includes(query)))
    );
  }

  res.json({
    total: results.length,
    query,
    results,
  });
});

/**
 * POST /api/verify/upi
 */
router.post('/upi', (req: Request, res: Response): void => {
  const { upiId } = req.body;
  if (!upiId || typeof upiId !== 'string') {
    res.status(400).json({ error: 'Please provide upiId.' });
    return;
  }

  const cleanUpi = upiId.trim().toLowerCase();
  const personalSuffixes = ['@ybl', '@okaxis', '@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@upi', '@apl'];
  const isPersonal = personalSuffixes.some(s => cleanUpi.endsWith(s));

  res.json({
    upiId: cleanUpi,
    isPersonalHandle: isPersonal,
    safetyStatus: isPersonal ? 'FLAGGED_PERSONAL' : 'UNVERIFIED_MERCHANT',
    warning: isPersonal
      ? 'High risk: Personal retail UPI handles should NEVER be used for corporate investments, advisory fees, or loan disbursements.'
      : 'Verify with your bank that this merchant VPA is registered with an authorized payment aggregator before sending funds.',
  });
});

/**
 * GET /api/verify/domains
 */
router.get('/domains', (_req: Request, res: Response): void => {
  res.json({
    whitelistedOfficialDomains: LEGITIMATE_OFFICIAL_DOMAINS,
  });
});

export default router;
