
const TAGS_KEY = 'email-ext-tags';

export interface EmailTag {
    emailId: string;
    tag: string;
}

export function getTags(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(TAGS_KEY);
    return stored ? JSON.parse(stored) : {};
}

export function getTagForEmail(emailId: string): string | null {
    const tags = getTags();
    return tags[emailId] || null;
}

export function saveTag(emailId: string, tag: string) {
    const tags = getTags();
    tags[emailId] = tag;
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

export function getAllUniqueTags(): string[] {
    const tags = getTags();
    const unique = new Set(Object.values(tags));
    return Array.from(unique);
}
