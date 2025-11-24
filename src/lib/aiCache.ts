
const AI_CACHE_KEY = 'email-ext-ai-cache';

interface AICacheEntry {
    category: string | null;
    reminders: { text: string; date?: string }[];
    timestamp: number;
}

export function getAICache(): Record<string, AICacheEntry> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(AI_CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
}

export function getCachedAnalysis(emailId: string): AICacheEntry | null {
    const cache = getAICache();
    return cache[emailId] || null;
}

export function saveCachedAnalysis(emailId: string, category: string | null, reminders: { text: string; date?: string }[]) {
    const cache = getAICache();
    cache[emailId] = {
        category,
        reminders,
        timestamp: Date.now()
    };
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
}
