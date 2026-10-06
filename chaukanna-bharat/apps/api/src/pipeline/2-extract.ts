import { ExtractedEntity, EntityType } from '@chaukanna/shared';

// Regular expressions for entity parsing
const REGEX_PATTERNS = {
  // UPI ID: e.g. name@bank, 9876543210@paytm
  UPI_ID: /\b[a-zA-Z0-9.\-_]{2,50}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|ibl|axl|upi|apl|fbl|idfcbank|postbank|barodampay)\b/gi,
  GENERIC_UPI: /\b[a-zA-Z0-9.\-_]{2,50}@[a-zA-Z]{2,20}\b/gi,
  
  // Registration numbers (SEBI / RBI)
  SEBI_REG_NO: /\bIN[A-Z0-9]{9,12}\b/gi,
  RBI_REG_NO: /\b(?:[N|B|A]-\d{2}\.\d{5}|RBI\/\d{4}\/[A-Z0-9]+)\b/gi,
  GENERIC_REG_CLAIM: /\b(?:SEBI|RBI|GOVT|REG(?:ISTRATION)?|LICENSE|CIN|LLPIN)\s*(?:NO|NUMBER|ID|REG|CODE)?[:.\s-]*([A-Z0-9\/-]{5,20})\b/gi,

  // Phone numbers (Indian mobile)
  PHONE_IN: /(?:\+91[\s-]?)?[6-9]\d{9}\b/g,

  // URLs & messaging platforms
  URL: /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi,
  TELEGRAM_LINK: /(?:t\.me|telegram\.me)\/[a-zA-Z0-9_+]{3,60}/gi,
  WHATSAPP_LINK: /(?:wa\.me|chat\.whatsapp\.com)\/[a-zA-Z0-9_+]{5,60}/gi,

  // Amounts
  AMOUNT: /(?:₹|Rs\.?|INR)\s*[\d,]+(?:\.\d{2})?/gi,

  // Guaranteed Return claims
  GUARANTEED_RETURN: /\b(?:guaranteed|assured|fixed|100%\s*(?:safe|risk[- ]free)|double\s*(?:your)?\s*money|profit\s*guarantee)\b.*?(?:\d{1,3}%|\d+x|₹\s*\d+)?/gi,
  RETURN_PERCENTAGE: /\b(?:\d{1,3}%\s*(?:returns?|profit|gain|daily|monthly|weekly|annual|roi))\b/gi,

  // Urgency / Pressure triggers
  URGENCY_TRIGGER: /\b(?:today\s*only|hurry|urgent|urgently|within\s*\d+\s*(?:mins|minutes|hours)|last\s*chance|limited\s*(?:slots|seats|time)|expires\s*(?:in|soon)|immediate(?:ly)?\s*(?:fee|payment|disbursement)|act\s*now)\b/gi,

  // Known Financial Institutions & Regulators
  ORGANIZATIONS: /\b(?:SEBI|Securities and Exchange Board of India|RBI|Reserve Bank of India|NSE|BSE|HDFC Bank|State Bank of India|SBI|ICICI Bank|Kotak Mahindra Bank|Axis Bank|Bajaj Finance|Tata Capital|Zerodha|Groww|Angel One|Upstox|Binance|VIP Telegram|VIP Channel)\b/gi,
};

export function extractEntities(sanitizedText: string): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  let entityCounter = 1;

  function addEntity(
    type: EntityType,
    rawValue: string,
    context: string,
    normalizedValue?: string
  ) {
    // Avoid duplicates of the same type and normalized value
    const norm = (normalizedValue || rawValue).trim().toLowerCase();
    const existing = entities.find(e => e.type === type && e.normalizedValue.toLowerCase() === norm);
    if (!existing) {
      entities.push({
        id: `entity-${entityCounter++}`,
        type,
        rawValue: rawValue.trim(),
        normalizedValue: normalizedValue || rawValue.trim(),
        context: context.trim().slice(0, 140),
        verificationStatus: 'COULD_NOT_DETERMINE', // Default before Stage 3
      });
    }
  }

  // 1. Extract Organizations & Regulators
  const orgMatches = sanitizedText.match(REGEX_PATTERNS.ORGANIZATIONS);
  if (orgMatches) {
    orgMatches.forEach(org => {
      addEntity('ORGANIZATION', org, `Mentioned organization: "${org}"`);
    });
  }

  // 2. Extract Registration Numbers
  const sebiMatches = sanitizedText.match(REGEX_PATTERNS.SEBI_REG_NO);
  if (sebiMatches) {
    sebiMatches.forEach(reg => {
      addEntity('REGISTRATION_NUMBER', reg, `SEBI Registration Number claimed: "${reg}"`, reg.toUpperCase());
    });
  }

  const rbiMatches = sanitizedText.match(REGEX_PATTERNS.RBI_REG_NO);
  if (rbiMatches) {
    rbiMatches.forEach(reg => {
      addEntity('REGISTRATION_NUMBER', reg, `RBI NBFC Registration claimed: "${reg}"`, reg.toUpperCase());
    });
  }

  // Generic registration claim if not already captured
  let genericRegMatch: RegExpExecArray | null;
  const genericRegex = new RegExp(REGEX_PATTERNS.GENERIC_REG_CLAIM.source, 'gi');
  while ((genericRegMatch = genericRegex.exec(sanitizedText)) !== null) {
    const fullMatch = genericRegMatch[0];
    const extractedNum = genericRegMatch[1];
    if (extractedNum && extractedNum.length >= 4) {
      addEntity('REGISTRATION_NUMBER', fullMatch, `Regulatory claim found: "${fullMatch}"`, extractedNum.toUpperCase());
    }
  }

  // 3. Extract UPI IDs
  const upiMatches = sanitizedText.match(REGEX_PATTERNS.UPI_ID) || sanitizedText.match(REGEX_PATTERNS.GENERIC_UPI);
  if (upiMatches) {
    upiMatches.forEach(upi => {
      addEntity('UPI_ID', upi, `Payment recipient UPI handle: "${upi}"`, upi.toLowerCase());
    });
  }

  // 4. Extract Phone Numbers
  const phoneMatches = sanitizedText.match(REGEX_PATTERNS.PHONE_IN);
  if (phoneMatches) {
    phoneMatches.forEach(ph => {
      addEntity('PHONE', ph, `Phone contact requested: "${ph}"`);
    });
  }

  // 5. Extract URLs & Social Links
  const urlMatches = sanitizedText.match(REGEX_PATTERNS.URL);
  if (urlMatches) {
    urlMatches.forEach(url => {
      addEntity('URL', url, `Link provided in message: "${url}"`);
    });
  }

  const tgMatches = sanitizedText.match(REGEX_PATTERNS.TELEGRAM_LINK);
  if (tgMatches) {
    tgMatches.forEach(tg => {
      addEntity('URL', tg, `Telegram group/channel invite: "${tg}"`, `https://${tg}`);
    });
  }

  const waMatches = sanitizedText.match(REGEX_PATTERNS.WHATSAPP_LINK);
  if (waMatches) {
    waMatches.forEach(wa => {
      addEntity('URL', wa, `WhatsApp contact link: "${wa}"`, `https://${wa}`);
    });
  }

  // 6. Extract Guaranteed Returns
  const returnMatches = sanitizedText.match(REGEX_PATTERNS.GUARANTEED_RETURN);
  if (returnMatches) {
    returnMatches.forEach(ret => {
      addEntity('RETURN_CLAIM', ret, `Guaranteed / assured profit claim: "${ret}"`);
    });
  }

  const pctMatches = sanitizedText.match(REGEX_PATTERNS.RETURN_PERCENTAGE);
  if (pctMatches) {
    pctMatches.forEach(pct => {
      addEntity('RETURN_CLAIM', pct, `Fixed high percentage return promise: "${pct}"`);
    });
  }

  // 7. Extract Urgency Triggers
  const urgencyMatches = sanitizedText.match(REGEX_PATTERNS.URGENCY_TRIGGER);
  if (urgencyMatches) {
    urgencyMatches.forEach(urg => {
      addEntity('URGENCY_TRIGGER', urg, `Urgency pressure cue detected: "${urg}"`);
    });
  }

  // 8. Extract Demanded Amounts
  const amountMatches = sanitizedText.match(REGEX_PATTERNS.AMOUNT);
  if (amountMatches) {
    amountMatches.forEach(amt => {
      addEntity('AMOUNT', amt, `Transaction amount requested: "${amt}"`);
    });
  }

  return entities;
}
