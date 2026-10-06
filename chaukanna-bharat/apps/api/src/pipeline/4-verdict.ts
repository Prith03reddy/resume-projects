import {
  AnalysisResult,
  EvidenceCard,
  ExtractedEntity,
  GuardrailFlags,
  InputType,
  RiskLevel,
  RISK_SCORE_THRESHOLDS,
  SupportedLanguage,
  TRANSLATIONS,
  OFFICIAL_PORTALS,
} from '@chaukanna/shared';
import { VerifiedEntityResult } from './3-verify.js';

export function compileVerdict(
  inputType: InputType,
  originalPreview: string,
  verifiedResults: VerifiedEntityResult[],
  guardrails: GuardrailFlags,
  startTimeMs: number
): AnalysisResult {
  const entities: ExtractedEntity[] = verifiedResults.map(r => r.entity);
  const evidenceCards: EvidenceCard[] = [];
  let cardCounter = 1;

  // 1. Calculate raw risk score
  let baseScore = 10;

  // If OTP / Credential harvesting is detected
  if (guardrails.otpRequested || guardrails.passwordRequested) {
    baseScore += 50;
    evidenceCards.push({
      id: `ev-${cardCounter++}`,
      category: 'CREDENTIAL_HARVESTING',
      severity: 'CRITICAL',
      title: 'Credential Harvesting / OTP Request Detected',
      finding: 'The message solicits or mentions one-time passwords (OTP) or PINs. Legitimate banks and regulators never solicit OTPs or credentials.',
      regulationClause: 'RBI Master Direction on Digital Payment Security Controls, 2021',
      recommendedVerificationUrl: OFFICIAL_PORTALS.CYBERCRIME_PORTAL,
      confidence: 0.99,
    });
  }

  // Evaluate entities
  let guaranteedReturnFound = false;
  let sebiClaimWithoutActiveReg = false;
  let personalUpiFound = false;
  let telegramChannelFound = false;
  let urgencyPressureFound = false;
  let verifiedOfficialSignal = false;

  for (const item of verifiedResults) {
    baseScore += item.riskWeight;
    const e = item.entity;

    if (e.type === 'RETURN_CLAIM') {
      guaranteedReturnFound = true;
      evidenceCards.push({
        id: `ev-${cardCounter++}`,
        category: 'GUARANTEED_RETURNS',
        severity: 'CRITICAL',
        title: 'Illegal Guaranteed Return Claim',
        finding: `Message claims "${e.rawValue}". SEBI regulations strictly prohibit promising fixed or guaranteed returns on securities and investments.`,
        quote: e.rawValue,
        regulationClause: 'SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations, 2003, Regulation 4(2)(k)',
        recommendedVerificationUrl: OFFICIAL_PORTALS.SEBI_SCORES,
        confidence: 0.98,
      });
    }

    if (e.type === 'ORGANIZATION' && e.rawValue.toUpperCase().includes('SEBI') && e.verificationStatus !== 'VERIFIED') {
      sebiClaimWithoutActiveReg = true;
    }

    if (e.type === 'UPI_ID' && item.isRedFlag) {
      personalUpiFound = true;
      evidenceCards.push({
        id: `ev-${cardCounter++}`,
        category: 'UNVERIFIED_PAYMENT',
        severity: 'CRITICAL',
        title: 'Unverified Personal UPI Payment Handle',
        finding: `Payment requested to private VPA "${e.rawValue}". Regulated financial institutions never receive investment capital through personal retail UPI handles.`,
        quote: e.rawValue,
        regulationClause: 'SEBI Circular on Direct Payout to Client Accounts & NPCI Safety Directives',
        recommendedVerificationUrl: OFFICIAL_PORTALS.NPCI_UPI_SAFETY,
        confidence: 0.95,
      });
    }

    if (e.type === 'URL' && item.isRedFlag) {
      telegramChannelFound = true;
      evidenceCards.push({
        id: `ev-${cardCounter++}`,
        category: 'COMMUNICATION_CHANNEL',
        severity: 'WARNING',
        title: 'Unregulated Messaging Channel Invite',
        finding: `Invitation to Telegram/WhatsApp channel "${e.rawValue}". Fraudulent operators use encrypted private groups to evade market surveillance.`,
        quote: e.rawValue,
        regulationClause: 'SEBI Circular on Unregistered Financial Influencers & Advisory via Social Media',
        recommendedVerificationUrl: OFFICIAL_PORTALS.SEBI_INTERMEDIARIES,
        confidence: 0.92,
      });
    }

    if (e.type === 'URGENCY_TRIGGER') {
      urgencyPressureFound = true;
      evidenceCards.push({
        id: `ev-${cardCounter++}`,
        category: 'URGENCY_PRESSURE',
        severity: 'WARNING',
        title: 'Psychological Urgency & Pressure Tactics',
        finding: `Message pressures victim with phrases like "${e.rawValue}". Scammers use urgency to hinder independent verification.`,
        quote: e.rawValue,
        confidence: 0.88,
      });
    }

    if (item.isGreenSignal) {
      verifiedOfficialSignal = true;
      evidenceCards.push({
        id: `ev-${cardCounter++}`,
        category: 'AUTHENTIC_SIGNAL',
        severity: 'POSITIVE',
        title: `Verified Official Entity: ${e.rawValue}`,
        finding: e.verificationDetails || 'Entity verified in official regulator registry.',
        regulationClause: e.officialMatch?.registry,
        recommendedVerificationUrl: e.officialMatch?.link || OFFICIAL_PORTALS.SEBI_INTERMEDIARIES,
        confidence: 0.95,
      });
    }
  }

  // Check if SEBI endorsement was claimed without genuine registered analyst number
  if (sebiClaimWithoutActiveReg && !verifiedOfficialSignal) {
    evidenceCards.push({
      id: `ev-${cardCounter++}`,
      category: 'REGULATORY_IMPERSONATION',
      severity: 'CRITICAL',
      title: 'False Regulatory Endorsement Claim',
      finding: 'The message states or implies SEBI approval, but does not provide a valid SEBI registration number (e.g. INH/INA/INZ) matching an active license.',
      regulationClause: 'Section 12(1) of Securities and Exchange Board of India Act, 1992',
      recommendedVerificationUrl: OFFICIAL_PORTALS.SEBI_INTERMEDIARIES,
      confidence: 0.96,
    });
    baseScore += 25;
  }

  // Adjust score constraints
  let finalScore = Math.min(Math.max(baseScore, 0), 100);

  // If guaranteed returns or OTP theft are present, risk is at least 82
  if (guaranteedReturnFound || guardrails.otpRequested) {
    finalScore = Math.max(finalScore, 86);
  }

  // Determine Risk Level
  let riskLevel: RiskLevel = 'UNVERIFIED';
  if (finalScore >= RISK_SCORE_THRESHOLDS.HIGH_RISK_MIN) {
    riskLevel = 'HIGH_RISK';
  } else if (finalScore > RISK_SCORE_THRESHOLDS.UNVERIFIED_MAX) {
    riskLevel = 'SUSPICIOUS';
  } else if (finalScore > RISK_SCORE_THRESHOLDS.VERIFIED_MAX) {
    riskLevel = 'UNVERIFIED';
  } else {
    riskLevel = 'VERIFIED';
  }

  // Generate actionable advice
  const actionableAdvice: string[] = [];
  if (riskLevel === 'HIGH_RISK') {
    actionableAdvice.push('DO NOT transfer any money or deposit funds to the provided UPI handle or bank account.');
    actionableAdvice.push('Do not click any unknown links or join private Telegram/WhatsApp VIP groups.');
    actionableAdvice.push('Report this message immediately to the National Cyber Crime Portal at cybercrime.gov.in or dial Helpline 1930.');
    actionableAdvice.push('If a broker or adviser contacted you, verify their SEBI Registration Number directly on sebi.gov.in.');
  } else if (riskLevel === 'SUSPICIOUS') {
    actionableAdvice.push('Pause immediately. Do not rush into payment under artificial time limits or deadline pressure.');
    actionableAdvice.push('Contact the institution through their official customer support number from their verified website, not from this message.');
    actionableAdvice.push('Check the entity on RBI Sachet portal (sachet.rbi.org.in) before giving any consent.');
  } else if (riskLevel === 'UNVERIFIED') {
    actionableAdvice.push('This entity cannot be confirmed in public regulatory registries. Proceed with extreme caution.');
    actionableAdvice.push('Request their complete registration certificate and verify the exact legal entity name with regulatory portals.');
  } else {
    actionableAdvice.push('The message pattern matches recognized official communications.');
    actionableAdvice.push('Always ensure you are using the official banking app or portal and never share your MPIN or OTP with anyone.');
  }

  // Generate multilingual audio scripts for Text-to-Speech
  const audioScript: Record<SupportedLanguage, string> = {
    en: generateSpeechScript('en', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
    hi: generateSpeechScript('hi', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
    bn: generateSpeechScript('bn', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
    ta: generateSpeechScript('ta', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
    te: generateSpeechScript('te', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
    mr: generateSpeechScript('mr', riskLevel, finalScore, guaranteedReturnFound, personalUpiFound),
  };

  const processingTimeMs = Date.now() - startTimeMs;

  return {
    id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    inputType,
    originalPreview,
    riskLevel,
    riskScore: finalScore,
    verdictHeadline: TRANSLATIONS.en.verdictHeadlines[riskLevel],
    summaryExplanation: getSummaryExplanation(riskLevel, guaranteedReturnFound, personalUpiFound, verifiedOfficialSignal),
    actionableAdvice,
    evidenceCards,
    entities,
    guardrailFlags: guardrails,
    audioScript,
    processingTimeMs,
  };
}

function getSummaryExplanation(
  riskLevel: RiskLevel,
  guaranteedReturn: boolean,
  personalUpi: boolean,
  verifiedOfficial: boolean
): string {
  if (riskLevel === 'HIGH_RISK') {
    return `Critical risk indicators detected based on concrete regulatory evidence. ${
      guaranteedReturn ? 'Promising guaranteed investment returns is illegal under SEBI regulations. ' : ''
    }${
      personalUpi ? 'Demanding payment to private retail UPI handles is a characteristic signature of financial fraud. ' : ''
    }Do not proceed with any transaction. Pause. Verify. Then Act.`;
  }
  if (riskLevel === 'SUSPICIOUS') {
    return 'Multiple suspicious signals identified including unverified links or urgency pressure. Legitimate financial bodies do not compel instantaneous payments.';
  }
  if (riskLevel === 'UNVERIFIED') {
    return 'The entity claims could not be corroborated with official regulatory registries (SEBI / RBI). We report transparent uncertainty.';
  }
  return verifiedOfficial
    ? 'The communication exhibits standard characteristics of verified official banking or registered regulatory intermediary notifications.'
    : 'No overt high-risk scam markers detected. Continue exercising normal financial vigilance.';
}

function generateSpeechScript(
  lang: SupportedLanguage,
  risk: RiskLevel,
  score: number,
  guaranteedReturn: boolean,
  personalUpi: boolean
): string {
  switch (lang) {
    case 'hi':
      if (risk === 'HIGH_RISK') {
        return `चेतावनी! चौंकन्ना भारत सुरक्षा सलाह: यह संदेश अत्यंत उच्च जोखिम वाला है। जोखिम स्कोर ${score} है। ${
          guaranteedReturn ? 'सेबी नियमों के अनुसार कोई भी गारंटीड रिटर्न का वादा नहीं कर सकता। ' : ''
        }${personalUpi ? 'किसी भी निजी यूपीआई आईडी पर पैसे न भेजें। ' : ''}रुकिए। परखिए। फिर कदम उठाइए। किसी भी मदद के लिए 1930 पर संपर्क करें।`;
      }
      return `चौंकन्ना भारत सुरक्षा अपडेट: जोखिम स्तर ${score} प्रतिशत है। कृपया आधिकारिक पोर्टल पर पुष्टि के बाद ही कोई निर्णय लें।`;

    case 'bn':
      if (risk === 'HIGH_RISK') {
        return `সতর্কতা! চৌকন্না ভারত নিরাপত্তা পরামর্শ: এই বার্তাটিতে মারাত্মক ঝুঁকি রয়েছে। ঝুঁকি স্কোর ${score} শতাংশ। কোনো ব্যক্তিগত ইউপিআই বা অচেনা অ্যাকাউন্টে টাকা পাঠাবেন না। থামুন। যাচাই করুন। তারপর সিদ্ধান্ত নিন। সাইবার প্রতারণার ক্ষেত্রে ১৯৩০ নম্বরে কল করুন।`;
      }
      return `চৌকন্না ভারত নিরাপত্তা আপডেট: ঝুঁকি স্কোর ${score} শতাংশ। লেনদেনের আগে অফিসিয়ালভাবে যাচাই করে নিন।`;

    case 'ta':
      if (risk === 'HIGH_RISK') {
        return `எச்சரிக்கை! சௌகன்னா பாரத் பாதுகாப்பு ஆலோசனை: இந்த செய்தி மிக அதிக ஆபத்து நிறைந்தது. அபாய அளவு ${score} சதவீதம். எந்தவொரு தனிநபர் UPI கணக்கிற்கும் பணத்தை அனுப்ப வேண்டாம். நிறுத்துங்கள். சரிபாருங்கள். பிறகு செயல்படுங்கள். தேவைப்பட்டால் 1930 என்ற எண்ணை தொடர்பு கொள்ளவும்.`;
      }
      return `சௌகன்னா பாரத் பாதுகாப்பு தகவல்: அபாய அளவு ${score} சதவீதம். அதிகாரப்பூர்வ விவரங்களை சரிபார்த்து முடிவெடுக்கவும்.`;

    case 'te':
      if (risk === 'HIGH_RISK') {
        return `హెచ్చరిక! చౌకన్నా భారత్ భద్రతా సలహా: ఈ సందేశంలో తీవ్రమైన మోసం సంకేతాలు ఉన్నాయి. రిస్క్ స్కోర్ ${score} శాతం. వ్యక్తిగత యూపీఐ ఖాతాలకు ఎటువంటి డబ్బు పంపవద్దు. ఆగండి. సరిచూడండి. ఆపై అడుగు వేయండి. అత్యవసరమైతే 1930 కి కాల్ చేయండి.`;
      }
      return `చౌకన్నా భారత్ భద్రతా సమాచారం: రిస్క్ స్కోర్ ${score} శాతం. అధికారిక రిజిస్ట్రీ ద్వారా నిర్ధారించుకున్న తర్వాతే చర్య తీసుకోండి.`;

    case 'mr':
      if (risk === 'HIGH_RISK') {
        return `इशारा! चौंकन्ना भारत सुरक्षा सल्ला: हा संदेश अतिधोकादायक आहे. जोखीम स्कोअर ${score} टक्के आहे. खाजगी यूपीआय आयडीवर कोणतेही पैसे पाठवू नका. सेबी कधीही हमी परताव्याचे वचन देत नाही. थांबा. खात्री करा. मग निर्णय घ्या. मदतीसाठी १९३० वर संपर्क साधा.`;
      }
      return `चौंकन्ना भारत सुरक्षा माहिती: जोखीम स्कोअर ${score} टक्के आहे. अधिकृत माहिती तपासल्यानंतरच व्यवहार करा.`;

    case 'en':
    default:
      if (risk === 'HIGH_RISK') {
        return `Warning! Chaukanna Bharat Safety Advisory: This message carries severe financial risk with a score of ${score} out of 100. ${
          guaranteedReturn ? 'Guaranteed returns are strictly illegal under SEBI regulations. ' : ''
        }${personalUpi ? 'Do not transfer money to personal UPI handles. ' : ''}Remember: Pause. Verify. Then Act. In case of fraud, dial 1930 immediately.`;
      }
      return `Chaukanna Bharat Safety Assessment: Risk score is ${score} out of 100. Ensure independent verification on official portals before taking action. Pause. Verify. Then Act.`;
  }
}
