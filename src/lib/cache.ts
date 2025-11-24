
type CacheEntry = {
    summary: string;
    timestamp: number;
};

const summaryCache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedSummary(emailId: string): string | null {
    const entry = summaryCache[emailId];
    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_DURATION) {
        delete summaryCache[emailId];
        return null;
    }

    return entry.summary;
}

export function setCachedSummary(emailId: string, summary: string) {
    summaryCache[emailId] = {
        summary,
        timestamp: Date.now(),
    };
}
