"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCachedSummary, setCachedSummary } from "@/lib/cache";
import { categorizeEmail, detectReminders, summarizeEmail } from "@/lib/gemini";
import { DEFAULT_PROMPTS, PROMPT_KEYS, getPrompt } from "@/lib/prompts";
import { addReminder } from "@/lib/reminders";
import { Email } from "@/types";
import { Clock, ShieldBan, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface EmailSummaryProps {
    email: Email;
    fullContent: string; // In a real app, this would be fetched
}

export function EmailSummary({ email, fullContent }: EmailSummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<string | null>(null);
    const [reminders, setReminders] = useState<{ text: string; date?: string }[]>([]);

    useEffect(() => {
        // Only load from cache initially, do NOT auto-fetch from API
        const cached = getCachedSummary(email.id);
        if (cached) {
            setSummary(cached);
        }

        // Auto-trigger categorization and reminders if content is available
        // In a real app, we might want to debounce this or wait for user action, 
        // but the requirement says "When mail is opened... automatically send"
        if (fullContent) {
            processEmailAI();
        }
    }, [email.id, fullContent]);

    const processEmailAI = async () => {
        // We can run these in parallel
        const catPrompt = getPrompt(PROMPT_KEYS.CATEGORIZATION, DEFAULT_PROMPTS.CATEGORIZATION);
        const actionPrompt = getPrompt(PROMPT_KEYS.ACTION_ITEMS, DEFAULT_PROMPTS.ACTION_ITEMS);

        // 1. Categorize
        categorizeEmail(fullContent).then(cat => setCategory(cat));

        // 2. Detect Reminders
        detectReminders(fullContent, actionPrompt).then(detected => {
            setReminders(detected);
            // Auto-save reminders
            detected.forEach(r => {
                addReminder({
                    emailId: email.id,
                    text: r.text,
                    date: r.date
                });
            });
        });
    };

    const handleSummarize = async () => {
        if (!fullContent) return;
        setLoading(true);
        try {
            const result = await summarizeEmail(fullContent, email.sender);
            setSummary(result);
            setCachedSummary(email.id, result);
        } catch (error) {
            console.error("Failed to summarize:", error);
            setSummary("Failed to generate summary. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg text-primary">
                            <Sparkles className="h-5 w-5" />
                            AI Insights
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {category && (
                                <span className="text-xs font-medium bg-background px-2 py-1 rounded border">
                                    {category}
                                </span>
                            )}
                            <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors">
                                <ShieldBan className="h-3 w-3" />
                                Block {email.sender}
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Summary Section */}
                    <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            Summary
                        </h4>
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-4 bg-muted rounded w-1/2"></div>
                            </div>
                        ) : summary ? (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {summary}
                            </p>
                        ) : (
                            <Button onClick={handleSummarize} variant="secondary" size="sm" className="w-full">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Summary
                            </Button>
                        )}
                    </div>

                    {/* Reminders Section */}
                    {reminders.length > 0 && (
                        <div className="pt-2 border-t">
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                <Clock className="h-4 w-4" />
                                Detected Reminders
                            </h4>
                            <ul className="space-y-2">
                                {reminders.map((r, i) => (
                                    <li key={i} className="text-sm bg-background p-2 rounded border flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                        <div className="flex-1">
                                            <p>{r.text}</p>
                                            {r.date && <p className="text-xs text-muted-foreground mt-0.5">Due: {new Date(r.date).toLocaleString()}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg">{email.subject}</h3>
                        <p className="text-sm text-muted-foreground">From: {email.sender} • {email.date}</p>
                    </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{fullContent}</p>
                </div>
            </div>
        </div>
    );
}
