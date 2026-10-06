"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAGLINE = exports.DISCLAIMER_ZERO_SPECULATION = exports.RISK_LEVEL_META = exports.SUPPORTED_LANGUAGES = exports.OFFICIAL_PORTALS = exports.RISK_SCORE_THRESHOLDS = void 0;
exports.RISK_SCORE_THRESHOLDS = {
    VERIFIED_MAX: 20,
    UNVERIFIED_MAX: 45,
    SUSPICIOUS_MAX: 75,
    HIGH_RISK_MIN: 76,
};
exports.OFFICIAL_PORTALS = {
    SEBI_INTERMEDIARIES: 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13',
    SEBI_SCORES: 'https://scores.sebi.gov.in',
    RBI_SACHET: 'https://sachet.rbi.org.in',
    RBI_NBFC_LIST: 'https://www.rbi.org.in/Scripts/BS_NBFCList.aspx',
    CYBERCRIME_PORTAL: 'https://cybercrime.gov.in',
    NATIONAL_CYBER_HELPLINE: '1930',
    NPCI_UPI_SAFETY: 'https://www.npci.org.in',
    CHAKSHU_SARATHI: 'https://sancharsaathi.gov.in/sfc/',
};
exports.SUPPORTED_LANGUAGES = {
    en: { code: 'en', label: 'English', nativeName: 'English', speechLocale: 'en-IN' },
    hi: { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', speechLocale: 'hi-IN' },
    bn: { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
    ta: { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
    te: { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
    mr: { code: 'mr', label: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
};
exports.RISK_LEVEL_META = {
    HIGH_RISK: {
        label: 'HIGH RISK',
        badgeBg: 'bg-red-500/15',
        badgeText: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-500/40',
        accentColor: '#EF4444',
        emoji: '🔴',
        tagline: 'Severe threat detected. Strong indicators of financial fraud or illegal solicitation.',
    },
    SUSPICIOUS: {
        label: 'SUSPICIOUS',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-500/40',
        accentColor: '#F59E0B',
        emoji: '🟠',
        tagline: 'Warning signs present. Unverified claims, pressure tactics, or unknown recipients.',
    },
    UNVERIFIED: {
        label: 'UNVERIFIED',
        badgeBg: 'bg-yellow-500/15',
        badgeText: 'text-yellow-700 dark:text-yellow-300',
        borderColor: 'border-yellow-500/40',
        accentColor: '#EAB308',
        emoji: '🟡',
        tagline: 'Transparent uncertainty. Entity claims could not be corroborated in official registries.',
    },
    VERIFIED: {
        label: 'VERIFIED',
        badgeBg: 'bg-emerald-500/15',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-500/40',
        accentColor: '#10B981',
        emoji: '🟢',
        tagline: 'Signals align with official channels and standard verified transaction notifications.',
    },
};
exports.DISCLAIMER_ZERO_SPECULATION = "Chaukanna Bharat does not provide stock recommendations, investment advice, or market forecasts. This platform exclusively verifies the authenticity of claims, registration numbers, and transactional safety against regulatory records.";
exports.TAGLINE = "Pause. Verify. Then Act.";
