import { Router, Request, Response } from 'express';
import { AnalysisResult, OFFICIAL_PORTALS } from '@chaukanna/shared';

const router = Router();

/**
 * POST /api/report/export-summary
 * Builds an official incident dossier for cybercrime.gov.in / 1930 reporting.
 */
router.post('/export-summary', (req: Request, res: Response): void => {
  const result: AnalysisResult = req.body;

  if (!result || !result.riskLevel) {
    res.status(400).json({ error: 'Valid AnalysisResult payload required.' });
    return;
  }

  const generatedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const markdownReport = `
# CHAUKANNA BHARAT — FINANCIAL SAFETY VERIFICATION DOSSIER
**Generated on:** ${generatedDate} (IST)
**Dossier Reference ID:** ${result.id}
**Platform Mandate:** "AI does the reading. Evidence does the verdict."

---

## 1. EXECUTIVE VERDICT
- **Risk Assessment:** ${result.riskLevel} (${result.riskScore} / 100)
- **Verdict Headline:** ${result.verdictHeadline}
- **Input Type Evaluated:** ${result.inputType}
- **Evaluation Timing:** ${result.processingTimeMs} ms (Processed Ephemerally in Volatile Memory)

### Summary Explanation:
${result.summaryExplanation}

---

## 2. EVIDENTIARY FINDINGS & REGULATORY VIOLATIONS
${
  result.evidenceCards.length > 0
    ? result.evidenceCards
        .map(
          (card, idx) => `
### [Finding ${idx + 1}] ${card.title} (${card.severity})
- **Category:** ${card.category}
- **Evidence Finding:** ${card.finding}
${card.quote ? `- **Extracted Quote:** "${card.quote}"` : ''}
${card.regulationClause ? `- **Statutory Reference:** ${card.regulationClause}` : ''}
${card.recommendedVerificationUrl ? `- **Official Verification Link:** ${card.recommendedVerificationUrl}` : ''}
`
        )
        .join('\n')
    : 'No regulatory violations or suspicious fraud patterns detected.'
}

---

## 3. EXTRACTED ENTITIES & REGISTRY CORROBORATION
| Entity Type | Claimed Value | Verification Status | Official Corroboration Details |
| :--- | :--- | :--- | :--- |
${result.entities
  .map(
    e =>
      `| ${e.type} | \`${e.rawValue.replace(/\|/g, '/')}\` | **${e.verificationStatus}** | ${
        e.verificationDetails || 'No additional records'
      } |`
  )
  .join('\n')}

---

## 4. IMMEDIATE ACTION GUIDANCE
${result.actionableAdvice.map((adv, i) => `${i + 1}. ${adv}`).join('\n')}

---

## 5. STATUTORY REPORTING PROCEDURE (IF VICTIMIZED)
1. **National Cyber Crime Helpline:** Call **1930** immediately within the golden hour to freeze fraudulent banking transactions.
2. **National Cyber Crime Reporting Portal:** File a formal cyber complaint at **${OFFICIAL_PORTALS.CYBERCRIME_PORTAL}**.
3. **SEBI Investor Complaints:** Report unauthorized stock tips or impersonation at **${OFFICIAL_PORTALS.SEBI_SCORES}**.
4. **RBI Sachet Portal:** Report illegal deposit collection or unregistered loan apps at **${OFFICIAL_PORTALS.RBI_SACHET}**.

---
*Notice: Chaukanna Bharat does not provide trading advice or speculate on markets. Zero PII or message texts are retained on disk.*
`;

  res.json({
    dossierId: result.id,
    generatedAt: generatedDate,
    markdownReport: markdownReport.trim(),
  });
});

export default router;
