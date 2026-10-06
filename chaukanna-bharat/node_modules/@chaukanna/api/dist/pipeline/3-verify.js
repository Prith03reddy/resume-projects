import { PERMITTED_REGISTRY_DATABASE, LEGITIMATE_OFFICIAL_DOMAINS, } from '@chaukanna/shared';
export function verifyExtractedEntities(entities) {
    return entities.map(entity => {
        let isRedFlag = false;
        let isGreenSignal = false;
        let riskWeight = 0;
        switch (entity.type) {
            case 'REGISTRATION_NUMBER': {
                const queryNorm = entity.normalizedValue.toUpperCase().trim();
                const found = PERMITTED_REGISTRY_DATABASE.find(item => item.registrationNo.toUpperCase() === queryNorm);
                if (found) {
                    if (found.status === 'ACTIVE') {
                        entity.verificationStatus = 'VERIFIED';
                        entity.officialMatch = {
                            registry: found.category.startsWith('SEBI') ? 'SEBI Official Intermediary Directory' : 'RBI Master Registry',
                            name: found.name,
                            registrationNo: found.registrationNo,
                            category: found.category,
                            officialDomain: found.validDomains?.[0],
                            link: found.officialPortalUrl,
                        };
                        entity.verificationDetails = `Verified active registration for '${found.name}'.`;
                        isGreenSignal = true;
                        riskWeight = -15; // Reduces risk
                    }
                    else {
                        entity.verificationStatus = 'NOT_VERIFIED';
                        entity.verificationDetails = `Registration '${queryNorm}' is ${found.status} or blacklisted in official database.`;
                        isRedFlag = true;
                        riskWeight = 30;
                    }
                }
                else {
                    // If entity claims to be SEBI/RBI registered but number is fake or absent from registry
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `Registration number '${entity.rawValue}' does not match any active intermediary in official SEBI/RBI records.`;
                    isRedFlag = true;
                    riskWeight = 25;
                }
                break;
            }
            case 'ORGANIZATION': {
                const orgQuery = entity.rawValue.toLowerCase();
                // Check for blacklisted entities or known scam patterns
                const blacklistedMatch = PERMITTED_REGISTRY_DATABASE.find(item => item.status === 'BLACKLISTED' && orgQuery.includes(item.name.toLowerCase().split(' ')[0]));
                if (blacklistedMatch) {
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `Matches known illicit syndicate / fraud pattern: ${blacklistedMatch.name}.`;
                    isRedFlag = true;
                    riskWeight = 35;
                    break;
                }
                // Check for genuine regulated entities
                const legitMatch = PERMITTED_REGISTRY_DATABASE.find(item => item.status === 'ACTIVE' && item.name.toLowerCase().includes(orgQuery));
                if (legitMatch) {
                    entity.verificationStatus = 'VERIFIED';
                    entity.officialMatch = {
                        registry: legitMatch.category.startsWith('SEBI') ? 'SEBI Intermediary Registry' : 'RBI Authorized Entities',
                        name: legitMatch.name,
                        registrationNo: legitMatch.registrationNo,
                        category: legitMatch.category,
                        officialDomain: legitMatch.validDomains?.[0],
                        link: legitMatch.officialPortalUrl,
                    };
                    entity.verificationDetails = `Organization recognized in permitted regulatory registry.`;
                    isGreenSignal = true;
                    riskWeight = -10;
                }
                else if (orgQuery.includes('vip') || orgQuery.includes('telegram') || orgQuery.includes('channel')) {
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `Unregulated messaging group channel. High correlation with pump-and-dump operations.`;
                    isRedFlag = true;
                    riskWeight = 25;
                }
                else {
                    // Transparent uncertainty
                    entity.verificationStatus = 'COULD_NOT_DETERMINE';
                    entity.verificationDetails = `Organization '${entity.rawValue}' is not recorded in our permitted official directory. Transparent uncertainty.`;
                    riskWeight = 5;
                }
                break;
            }
            case 'RETURN_CLAIM': {
                entity.verificationStatus = 'NOT_VERIFIED';
                entity.verificationDetails = `Illegal under SEBI regulations. Promising guaranteed returns on stock market or investment schemes is unlawful in India.`;
                isRedFlag = true;
                riskWeight = 40; // Heavy fraud signal
                break;
            }
            case 'UPI_ID': {
                const upiHandle = entity.rawValue.toLowerCase();
                // Personal handle suffixes:
                const personalHandles = ['@ybl', '@okaxis', '@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@upi', '@apl'];
                const isPersonalVpa = personalHandles.some(h => upiHandle.endsWith(h));
                if (isPersonalVpa) {
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `Personal UPI handle detected ('${entity.rawValue}'). Legitimate investment firms and banks never request deposits into personal VPAs.`;
                    isRedFlag = true;
                    riskWeight = 30;
                }
                else {
                    entity.verificationStatus = 'COULD_NOT_DETERMINE';
                    entity.verificationDetails = `VPA authenticity could not be verified with clearing corporation registry.`;
                    riskWeight = 10;
                }
                break;
            }
            case 'URL': {
                const urlLower = entity.rawValue.toLowerCase();
                if (urlLower.includes('t.me') || urlLower.includes('telegram.me')) {
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `Encrypted Telegram link used for financial solicitation. SEBI prohibits unregistered stock tipping on Telegram.`;
                    isRedFlag = true;
                    riskWeight = 25;
                }
                else if (urlLower.includes('wa.me') || urlLower.includes('chat.whatsapp.com')) {
                    entity.verificationStatus = 'NOT_VERIFIED';
                    entity.verificationDetails = `WhatsApp group link. High risk of impersonation and investment syndicate trap.`;
                    isRedFlag = true;
                    riskWeight = 20;
                }
                else {
                    // Check if domain is in legitimate list
                    const matchedDomain = LEGITIMATE_OFFICIAL_DOMAINS.find(d => urlLower.includes(d));
                    if (matchedDomain) {
                        entity.verificationStatus = 'VERIFIED';
                        entity.verificationDetails = `URL domain matches whitelisted official portal: ${matchedDomain}.`;
                        isGreenSignal = true;
                        riskWeight = -10;
                    }
                    else {
                        entity.verificationStatus = 'COULD_NOT_DETERMINE';
                        entity.verificationDetails = `Domain is not part of permitted official banking/regulatory portals.`;
                        riskWeight = 10;
                    }
                }
                break;
            }
            case 'URGENCY_TRIGGER': {
                entity.verificationStatus = 'NOT_VERIFIED';
                entity.verificationDetails = `Artificial urgency tactic designed to compel immediate fund transfer before victim can verify.`;
                isRedFlag = true;
                riskWeight = 15;
                break;
            }
            case 'AMOUNT': {
                entity.verificationStatus = 'COULD_NOT_DETERMINE';
                entity.verificationDetails = `Payment amount request extracted for transaction audit.`;
                riskWeight = 0;
                break;
            }
            case 'PHONE': {
                entity.verificationStatus = 'COULD_NOT_DETERMINE';
                entity.verificationDetails = `Unregistered mobile number extracted. Verify caller credentials before sharing details.`;
                riskWeight = 5;
                break;
            }
        }
        return {
            entity,
            isRedFlag,
            isGreenSignal,
            riskWeight,
        };
    });
}
