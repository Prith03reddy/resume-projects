export type RiskLevel = 'VERIFIED' | 'UNVERIFIED' | 'SUSPICIOUS' | 'HIGH_RISK';

export type EntityType = 
  | 'ORGANIZATION'
  | 'REGISTRATION_NUMBER'
  | 'UPI_ID'
  | 'PHONE'
  | 'URL'
  | 'RETURN_CLAIM'
  | 'URGENCY_TRIGGER'
  | 'BANK_ACCOUNT'
  | 'AMOUNT';

export type EntityVerificationStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'COULD_NOT_DETERMINE';

export interface OfficialMatch {
  registry: string; // e.g. "SEBI Intermediaries Registry", "RBI Authorized NBFCs"
  name: string;
  registrationNo: string;
  category?: string;
  validUntil?: string;
  officialDomain?: string;
  link?: string;
}

export interface ExtractedEntity {
  id: string;
  type: EntityType;
  rawValue: string;
  normalizedValue: string;
  context: string;
  verificationStatus: EntityVerificationStatus;
  verificationDetails?: string;
  officialMatch?: OfficialMatch;
}

export type EvidenceCategory =
  | 'GUARANTEED_RETURNS'
  | 'REGULATORY_IMPERSONATION'
  | 'UNVERIFIED_PAYMENT'
  | 'URGENCY_PRESSURE'
  | 'COMMUNICATION_CHANNEL'
  | 'AUTHENTIC_SIGNAL'
  | 'SUSPICIOUS_DOMAIN'
  | 'CREDENTIAL_HARVESTING';

export type EvidenceSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'POSITIVE';

export interface EvidenceCard {
  id: string;
  category: EvidenceCategory;
  severity: EvidenceSeverity;
  title: string;
  finding: string;
  quote?: string;
  regulationClause?: string;
  recommendedVerificationUrl?: string;
  confidence: number; // 0 to 1
}

export type InputType = 'TEXT' | 'IMAGE' | 'PDF' | 'URL' | 'AUDIO';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr';

export interface GuardrailFlags {
  otpRequested: boolean;
  passwordRequested: boolean;
  promptInjectionAttempted: boolean;
  tradingAdviceRequested: boolean;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputType: InputType;
  originalPreview: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  verdictHeadline: string;
  summaryExplanation: string;
  actionableAdvice: string[];
  evidenceCards: EvidenceCard[];
  entities: ExtractedEntity[];
  guardrailFlags: GuardrailFlags;
  audioScript: Record<SupportedLanguage, string>;
  processingTimeMs: number;
}

export interface AnalysisRequestPayload {
  text?: string;
  url?: string;
  imageBase64?: string;
  imageMimeType?: string;
  pdfBase64?: string;
  pdfFilename?: string;
  audioBase64?: string;
  targetLanguage?: SupportedLanguage;
}

export interface RegistryLookupQuery {
  query: string;
  type?: 'SEBI' | 'RBI' | 'UPI' | 'DOMAIN';
}

export interface RegistryItem {
  id: string;
  category: 'SEBI_RA' | 'SEBI_RIA' | 'SEBI_BROKER' | 'RBI_NBFC' | 'RBI_BANK' | 'KNOWN_FRAUD_PATTERN' | 'OFFICIAL_DOMAIN';
  name: string;
  registrationNo: string;
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED' | 'BLACKLISTED';
  validDomains?: string[];
  verifiedSince?: string;
  description?: string;
  officialPortalUrl?: string;
}

export interface DemoSample {
  id: string;
  title: string;
  category: 'HIGH_RISK_SCAM' | 'TASK_SCAM' | 'UNVERIFIED_LOAN' | 'AUTHENTIC_BANK';
  badge: string;
  expectedRisk: RiskLevel;
  text: string;
  description: string;
}
