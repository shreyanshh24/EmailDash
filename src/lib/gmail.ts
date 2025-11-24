import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export const getGmailClient = (accessToken: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
};

export async function listEmails(accessToken: string, maxResults = 10, query = "", pageToken?: string) {
  const gmail = getGmailClient(accessToken);
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: query,
    pageToken,
  });
  return {
    messages: res.data.messages || [],
    nextPageToken: res.data.nextPageToken,
  };
}

export async function getEmail(accessToken: string, messageId: string) {
  const gmail = getGmailClient(accessToken);
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });
  return res.data;
}

export async function trashEmail(accessToken: string, messageId: string) {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.trash({
    userId: "me",
    id: messageId,
  });
}

export async function markAsRead(accessToken: string, messageId: string) {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: {
      ids: [messageId],
      removeLabelIds: ["UNREAD"],
    },
  });
}

export async function sendEmail(accessToken: string, to: string, subject: string, body: string, replyToId?: string) {
  const gmail = getGmailClient(accessToken);

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
  ];

  if (replyToId) {
    messageParts.push(`In-Reply-To: ${replyToId}`);
    messageParts.push(`References: ${replyToId}`);
  }

  messageParts.push("");
  messageParts.push(body);

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
      threadId: replyToId, // Threading
    },
  });
}

export async function scanEmailsForSubscriptions(accessToken: string, maxResults = 50) {
  const gmail = getGmailClient(accessToken);

  // 1. List recent messages
  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "unsubscribe", // Filter for emails likely to have unsubscribe links
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return [];

  // 2. Fetch details for each message (in parallel)
  // Note: Batching would be better but for 50 items parallel promises is okay for now
  const details = await Promise.all(
    messages.map(async (msg) => {
      try {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["From", "List-Unsubscribe", "Subject"],
        });
        return res.data;
      } catch (e) {
        return null;
      }
    })
  );

  // 3. Extract subscription info
  const subscriptions = new Map<string, { id: string; sender: string; email: string; unsubscribeUrl: string }>();

  details.forEach((msg) => {
    if (!msg) return;

    const headers = msg.payload?.headers;
    if (!headers) return;

    const unsubscribeHeader = headers.find(h => h.name === "List-Unsubscribe")?.value;
    const fromHeader = headers.find(h => h.name === "From")?.value;

    if (unsubscribeHeader && fromHeader) {
      // Parse From header: "Name <email@example.com>" or "email@example.com"
      const match = fromHeader.match(/(.*)<(.*)>/);
      const senderName = match ? match[1].trim().replace(/^"|"$/g, '') : fromHeader;
      const senderEmail = match ? match[2] : fromHeader;

      // Parse Unsubscribe header: <url>, <mailto>
      // We prefer https links
      const urls = unsubscribeHeader.match(/<(https?:\/\/[^>]+)>/g);
      let url = "";
      if (urls && urls.length > 0) {
        url = urls[0].slice(1, -1);
      } else {
        // Fallback to mailto if no http link
        const mailtos = unsubscribeHeader.match(/<(mailto:[^>]+)>/g);
        if (mailtos && mailtos.length > 0) {
          url = mailtos[0].slice(1, -1);
        }
      }

      if (url && senderEmail && !subscriptions.has(senderEmail)) {
        subscriptions.set(senderEmail, {
          id: msg.id!,
          sender: senderName || senderEmail,
          email: senderEmail,
          unsubscribeUrl: url
        });
      }
    }
  });

  return Array.from(subscriptions.values());
}
