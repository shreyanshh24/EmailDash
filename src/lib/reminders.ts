
export interface Reminder {
    id: string;
    emailId: string;
    text: string;
    date?: string; // ISO string
    created: number;
}

const REMINDERS_KEY = 'email-ext-reminders';

export function getReminders(): Reminder[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function addReminder(reminder: Omit<Reminder, 'id' | 'created'>) {
    const reminders = getReminders();
    const newReminder: Reminder = {
        ...reminder,
        id: crypto.randomUUID(),
        created: Date.now(),
    };
    reminders.push(newReminder);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    return newReminder;
}

export function removeReminder(id: string) {
    const reminders = getReminders();
    const filtered = reminders.filter(r => r.id !== id);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
}
