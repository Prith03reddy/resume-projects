import { RiskLevel, SupportedLanguage } from './types.js';
export declare const RISK_SCORE_THRESHOLDS: {
    readonly VERIFIED_MAX: 20;
    readonly UNVERIFIED_MAX: 45;
    readonly SUSPICIOUS_MAX: 75;
    readonly HIGH_RISK_MIN: 76;
};
export declare const OFFICIAL_PORTALS: {
    readonly SEBI_INTERMEDIARIES: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13";
    readonly SEBI_SCORES: "https://scores.sebi.gov.in";
    readonly RBI_SACHET: "https://sachet.rbi.org.in";
    readonly RBI_NBFC_LIST: "https://www.rbi.org.in/Scripts/BS_NBFCList.aspx";
    readonly CYBERCRIME_PORTAL: "https://cybercrime.gov.in";
    readonly NATIONAL_CYBER_HELPLINE: "1930";
    readonly NPCI_UPI_SAFETY: "https://www.npci.org.in";
    readonly CHAKSHU_SARATHI: "https://sancharsaathi.gov.in/sfc/";
};
export declare const SUPPORTED_LANGUAGES: Record<SupportedLanguage, {
    code: SupportedLanguage;
    label: string;
    nativeName: string;
    speechLocale: string;
}>;
export declare const RISK_LEVEL_META: Record<RiskLevel, {
    label: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    accentColor: string;
    emoji: string;
    tagline: string;
}>;
export declare const DISCLAIMER_ZERO_SPECULATION = "Chaukanna Bharat does not provide stock recommendations, investment advice, or market forecasts. This platform exclusively verifies the authenticity of claims, registration numbers, and transactional safety against regulatory records.";
export declare const TAGLINE = "Pause. Verify. Then Act.";
//# sourceMappingURL=constants.d.ts.map