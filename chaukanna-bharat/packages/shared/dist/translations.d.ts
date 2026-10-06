import { RiskLevel, SupportedLanguage } from './types.js';
export interface TranslationDict {
    tagline: string;
    subtagline: string;
    demoBtn: string;
    tabs: {
        text: string;
        screenshot: string;
        pdf: string;
        url: string;
        voice: string;
    };
    inputPlaceholders: {
        text: string;
        url: string;
        voice: string;
    };
    actions: {
        analyze: string;
        analyzing: string;
        reset: string;
        listen: string;
        stopAudio: string;
        downloadReport: string;
        checkRegistry: string;
    };
    verdictHeadlines: Record<RiskLevel, string>;
    riskLevelLabels: Record<RiskLevel, string>;
    sections: {
        verdictTitle: string;
        evidenceTitle: string;
        entitiesTitle: string;
        actionTitle: string;
        audioTitle: string;
    };
    entityStatus: {
        verified: string;
        notVerified: string;
        couldNotDetermine: string;
    };
    guardrails: {
        otpAlert: string;
        injectionAlert: string;
        zeroSpeculationNotice: string;
        privacyNotice: string;
    };
    recommendedActions: {
        doNotPay: string;
        verifySebi: string;
        verifyRbi: string;
        call1930: string;
        proceedSafely: string;
    };
}
export declare const TRANSLATIONS: Record<SupportedLanguage, TranslationDict>;
//# sourceMappingURL=translations.d.ts.map