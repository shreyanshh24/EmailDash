export interface Email {
    id: string;
    sender: string;
    senderEmail: string;
    subject: string;
    snippet: string;
    date: string;
    isRead: boolean;
    labels: string[];
    summary?: string;
    body?: string;
}

export interface PrivacyRule {
    type: 'sender' | 'domain';
    value: string;
    action: 'block_ai';
}
