
const SUMMARIES_KEY = 'email-ext-summaries';

export interface EmailSummary {
    emailId: string;
    summary: string;
    created: number;
}

export function getSummaries(): Record<string, EmailSummary> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(SUMMARIES_KEY);
    return stored ? JSON.parse(stored) : {};
}

export function getSummaryForEmail(emailId: string): EmailSummary | null {
    const summaries = getSummaries();
    return summaries[emailId] || null;
}

export function saveSummary(emailId: string, summary: string) {
    const summaries = getSummaries();
    summaries[emailId] = {
        emailId,
        summary,
        created: Date.now()
    };
    localStorage.setItem(SUMMARIES_KEY, JSON.stringify(summaries));
}
