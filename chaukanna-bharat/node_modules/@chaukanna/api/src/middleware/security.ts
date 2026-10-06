import { Request, Response, NextFunction } from 'express';
import { GuardrailFlags } from '@chaukanna/shared';

// Regular expressions to detect prompt injection attempts
const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /you are now a helpful/i,
  /set (the )?risk (level|score) to (0|zero|verified)/i,
  /override (verification|verdict)/i,
  /bypass (filter|safety|guardrail)/i,
  /<script\b[^>]*>/i,
  /javascript:/i,
];

// Regular expressions to detect OTP / Password / PIN / CVV extraction attempts
const CREDENTIAL_HARVEST_PATTERNS = [
  /\b(otp|one[- ]time[- ]password|pin|mpin|cvv|password|passcode)\b/i,
  /\b(share|send|forward|enter|submit|provide)\b.*\b(otp|pin|password|cvv)\b/i,
];

// Regular expressions to detect stock / crypto trading advice requests
const TRADING_ADVICE_PATTERNS = [
  /\b(which stock should i buy|should i buy|best stock to invest|target price for|crypto tip|recommend a share)\b/i,
];

export interface SanitizedInputResult {
  sanitizedText: string;
  guardrails: GuardrailFlags;
  injectionWarnings: string[];
}

export function sanitizeAndInspectInput(rawInput: string): SanitizedInputResult {
  let text = String(rawInput || '');
  const warnings: string[] = [];

  let promptInjectionAttempted = false;
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      promptInjectionAttempted = true;
      warnings.push(`Potential prompt injection phrase detected and neutralized: ${pattern.source}`);
      // Neutralize matched pattern
      text = text.replace(pattern, '[SANITIZED_UNTRUSTED_CONTENT]');
    }
  }

  // Check for OTP / Password theft attempt in the suspicious message
  let otpRequested = false;
  let passwordRequested = false;
  if (CREDENTIAL_HARVEST_PATTERNS[0].test(text) || CREDENTIAL_HARVEST_PATTERNS[1].test(text)) {
    otpRequested = true;
    passwordRequested = true;
  }

  // Check for trading advice demand
  let tradingAdviceRequested = false;
  for (const pattern of TRADING_ADVICE_PATTERNS) {
    if (pattern.test(text)) {
      tradingAdviceRequested = true;
      break;
    }
  }

  // Basic HTML entity sanitization
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return {
    sanitizedText: text,
    guardrails: {
      otpRequested,
      passwordRequested,
      promptInjectionAttempted,
      tradingAdviceRequested,
    },
    injectionWarnings: warnings,
  };
}

/**
 * Ephemeral Storage and Privacy Middleware:
 * Enforces strictly zero caching and zero persistence headers.
 */
export function ephemeralSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Privacy-Policy', 'Zero-Data-Retention-Ephemeral');
  next();
}
