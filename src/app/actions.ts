"use server";

import { createCalendarEvent } from "@/lib/calendar";
import { generateQuickReplies } from "@/lib/gemini";
import { getEmail, listEmails, markAsRead, scanEmailsForSubscriptions, sendEmail } from "@/lib/gmail";
import { Email } from "@/types";

export async function fetchEmails(accessToken: string, pageToken?: string, query: string = "") {
    try {
        const { messages, nextPageToken } = await listEmails(accessToken, 10, query, pageToken);

        const emailPromises = messages.map((msg) => getEmail(accessToken, msg.id!));
        const emailsData = await Promise.all(emailPromises);

        const emails: Email[] = emailsData.map((email: any) => {
            const headers = email.payload.headers;
            const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No Subject)";
            const sender = headers.find((h: any) => h.name === "From")?.value || "(Unknown)";
            const date = headers.find((h: any) => h.name === "Date")?.value || "";

            // Try to get body content
            let body = email.snippet;
            if (email.payload.body?.data) {
                body = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
            } else if (email.payload.parts) {
                // Prioritize HTML content for better rendering
                const htmlPart = email.payload.parts.find((p: any) => p.mimeType === 'text/html');
                if (htmlPart?.body?.data) {
                    body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
                } else {
                    // Fallback to plain text if HTML is missing
                    const textPart = email.payload.parts.find((p: any) => p.mimeType === 'text/plain');
                    if (textPart?.body?.data) {
                        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                    }
                }
            }

            const fromHeader = headers.find((h: any) => h.name === "From")?.value || "(Unknown)";
            const senderName = fromHeader.replace(/<.*>/, "").trim();
            const senderEmailMatch = fromHeader.match(/<(.+)>/);
            const senderEmail = senderEmailMatch ? senderEmailMatch[1] : fromHeader;

            return {
                id: email.id,
                sender: senderName || senderEmail, // Fallback to email if name is empty
                senderEmail: senderEmail,
                subject: subject,
                snippet: email.snippet,
                body: body,
                date: new Date(date).toLocaleDateString(),
                isRead: !email.labelIds.includes("UNREAD"),
                labels: email.labelIds,
            };
        });

        return { emails, nextPageToken };
    } catch (error) {
        console.error("Failed to fetch emails:", error);
        throw new Error("Failed to fetch emails");
    }
}

export async function sendEmailAction(accessToken: string, to: string, subject: string, body: string, replyToId?: string) {
    try {
        await sendEmail(accessToken, to, subject, body, replyToId);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: "Failed to send email" };
    }
}

export async function markAsReadAction(accessToken: string, messageId: string) {
    try {
        await markAsRead(accessToken, messageId);
        return { success: true };
    } catch (error) {
        console.error("Failed to mark email as read:", error);
        return { success: false, error: "Failed to mark email as read" };
    }
}

export async function getQuickRepliesAction(content: string, customPrompt?: string) {
    return await generateQuickReplies(content, customPrompt);
}

export async function getSubscriptionsAction(accessToken: string) {
    try {
        const subscriptions = await scanEmailsForSubscriptions(accessToken);
        return { success: true, subscriptions };
    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        return { success: false, error: "Failed to fetch subscriptions" };
    }
}

export async function addToCalendarAction(accessToken: string, title: string, date: string) {
    try {
        const result = await createCalendarEvent(accessToken, title, date);
        return { success: true, link: result.link };
    } catch (error) {
        console.error("Failed to add to calendar:", error);
        return { success: false, error: "Failed to add to calendar" };
    }
}
