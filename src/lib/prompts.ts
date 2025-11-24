
export const PROMPT_KEYS = {
    CATEGORIZATION: 'email-ext-prompt-categorization',
    ACTION_ITEMS: 'email-ext-prompt-action-items',
    AUTO_REPLY: 'email-ext-prompt-auto-reply',
    QUICK_REPLY: 'email-ext-prompt-quick-reply',
};

export const DEFAULT_PROMPTS = {
    CATEGORIZATION: `Analyze the following email and assign it exactly one category from this list: [Work, Personal, Newsletter, Finance, Travel, Urgent, Other]. Return only the category name.`,
    ACTION_ITEMS: `Analyze the following email and extract any tasks, appointments, or deadlines that should be set as reminders. 
    Return the result as a JSON array of objects with "text" (description of the task) and "date" (ISO date string if a specific date/time is mentioned, otherwise null).
    If no reminders are found, return an empty array [].
    Do not include any markdown formatting or explanation, just the raw JSON string.`,
    AUTO_REPLY: `Draft a professional and polite reply to this email. The tone should be helpful and concise.`,
    QUICK_REPLY: `Read the following email content and generate exactly 3 professional, complete, and distinct quick reply options. 
    One option should be positive (agreeing/accepting), one should be neutral/inquiry-based, and one should be negative (declining/disagreeing) but polite.
    They should be full sentences or short paragraphs, not just one-word answers.
    Return ONLY a JSON array of strings.`,
};

export function getPrompt(key: string, defaultPrompt: string): string {
    if (typeof window === 'undefined') return defaultPrompt;
    return localStorage.getItem(key) || defaultPrompt;
}

export function savePrompt(key: string, prompt: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, prompt);
}

export function resetPrompt(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
}
