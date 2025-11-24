import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_PROMPTS } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function summarizeEmail(content: string, sender?: string): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.warn("Gemini API Key not found");
        return "Summary unavailable (API Key missing)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Summarize the following email from ${sender || 'Unknown'} in 2-3 concise sentences. Focus on the main point and any action items.
    
    Email Content:
    ${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error summarizing email:", error);
        return "Failed to generate summary.";
    }
}

export async function categorizeEmail(content: string): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return "Uncategorized";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // Use custom prompt if available (passed from client or default)
        // Note: Since this runs on server/client, we need to be careful with localStorage.
        // For now, we'll rely on the caller passing the prompt or use default here if running on server.
        // Ideally, prompts should be passed as arguments to these functions.
        // However, to keep it simple for this task, we will use the default here 
        // and rely on the client-side components to pass the custom prompt if needed,
        // OR we can accept the prompt as an argument.
        // Let's update the signature to accept an optional prompt.

        const prompt = `${DEFAULT_PROMPTS.CATEGORIZATION}
    
    Email Content:
    ${content.substring(0, 1000)}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Error categorizing email:", error);
        return "Uncategorized";
    }
}

export async function detectReminders(content: string, customPrompt?: string): Promise<{ text: string; date?: string }[]> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.warn("Gemini API Key not found");
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `${customPrompt || DEFAULT_PROMPTS.ACTION_ITEMS}

    Email Content:
    ${content}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response to find the JSON array
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Error detecting reminders:", error);
        return [];
    }
}

export async function generateQuickReplies(emailContent: string, customPrompt?: string): Promise<string[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
      ${customPrompt || DEFAULT_PROMPTS.QUICK_REPLY}
      
      Email Content:
      "${emailContent.substring(0, 2000)}"
    `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Error generating quick replies:", error);
        return [];
    }
}

export async function chatWithEmails(query: string, emails: any[]): Promise<string> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) return "I can't help with that right now (API Key missing).";

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Simple RAG: Context window is large enough for many emails, but let's limit to recent/relevant ones if needed.
        // For now, we'll dump the snippets/bodies of the provided emails.
        const context = emails.map(e => `
        From: ${e.sender} (${e.senderEmail})
        Subject: ${e.subject}
        Date: ${e.date}
        Content: ${e.body || e.snippet}
        ---
        `).join("\n");

        const prompt = `
    You are a helpful email assistant.
    
    User Query: "${query}"
    
    Context (User's recent emails):
    ${context}
    
    Instructions:
    1. Answer the user's question based ONLY on the provided email context.
    2. If the user greets you (e.g., "hi", "hello"), respond politely and ask how you can help with their emails. Do NOT say you couldn't find information.
    3. If the answer is not in the emails, politely say you couldn't find that information in the loaded emails.
    4. Be concise and helpful. Use markdown for formatting (bold, lists) if needed.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error chatting with emails:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
}
