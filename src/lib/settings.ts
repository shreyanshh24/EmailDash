import { PrivacyRule } from "@/types";

const STORAGE_KEY_PRIVACY = "email_ext_privacy_rules";

export const getPrivacyRules = (): PrivacyRule[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY_PRIVACY);
    return stored ? JSON.parse(stored) : [];
};

export const savePrivacyRule = (rule: PrivacyRule) => {
    const rules = getPrivacyRules();
    // Avoid duplicates
    if (!rules.some(r => r.value === rule.value && r.type === rule.type)) {
        const newRules = [...rules, rule];
        localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(newRules));
        return newRules;
    }
    return rules;
};

export const removePrivacyRule = (value: string) => {
    const rules = getPrivacyRules();
    const newRules = rules.filter(r => r.value !== value);
    localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(newRules));
    return newRules;
};

export const isBlocked = (sender: string, domain: string): boolean => {
    const rules = getPrivacyRules();
    return rules.some(rule => {
        if (rule.type === "sender" && sender.includes(rule.value)) return true;
        if (rule.type === "domain" && (domain === rule.value || sender.endsWith(`@${rule.value}`))) return true;
        return false;
    });
};
