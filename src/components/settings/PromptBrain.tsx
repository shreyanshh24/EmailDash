"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_PROMPTS, PROMPT_KEYS, getPrompt, resetPrompt, savePrompt } from "@/lib/prompts";
import { BrainCircuit, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";

export function PromptBrain() {
    const [categorizationPrompt, setCategorizationPrompt] = useState(DEFAULT_PROMPTS.CATEGORIZATION);
    const [actionItemsPrompt, setActionItemsPrompt] = useState(DEFAULT_PROMPTS.ACTION_ITEMS);
    const [autoReplyPrompt, setAutoReplyPrompt] = useState(DEFAULT_PROMPTS.AUTO_REPLY);
    const [quickReplyPrompt, setQuickReplyPrompt] = useState(DEFAULT_PROMPTS.QUICK_REPLY);

    useEffect(() => {
        setCategorizationPrompt(getPrompt(PROMPT_KEYS.CATEGORIZATION, DEFAULT_PROMPTS.CATEGORIZATION));
        setActionItemsPrompt(getPrompt(PROMPT_KEYS.ACTION_ITEMS, DEFAULT_PROMPTS.ACTION_ITEMS));
        setAutoReplyPrompt(getPrompt(PROMPT_KEYS.AUTO_REPLY, DEFAULT_PROMPTS.AUTO_REPLY));
        setQuickReplyPrompt(getPrompt(PROMPT_KEYS.QUICK_REPLY, DEFAULT_PROMPTS.QUICK_REPLY));
    }, []);

    const handleSave = () => {
        savePrompt(PROMPT_KEYS.CATEGORIZATION, categorizationPrompt);
        savePrompt(PROMPT_KEYS.ACTION_ITEMS, actionItemsPrompt);
        savePrompt(PROMPT_KEYS.AUTO_REPLY, autoReplyPrompt);
        savePrompt(PROMPT_KEYS.QUICK_REPLY, quickReplyPrompt);
        alert("Prompts saved successfully!");
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset all prompts to default?")) {
            resetPrompt(PROMPT_KEYS.CATEGORIZATION);
            resetPrompt(PROMPT_KEYS.ACTION_ITEMS);
            resetPrompt(PROMPT_KEYS.AUTO_REPLY);
            resetPrompt(PROMPT_KEYS.QUICK_REPLY);

            setCategorizationPrompt(DEFAULT_PROMPTS.CATEGORIZATION);
            setActionItemsPrompt(DEFAULT_PROMPTS.ACTION_ITEMS);
            setAutoReplyPrompt(DEFAULT_PROMPTS.AUTO_REPLY);
            setQuickReplyPrompt(DEFAULT_PROMPTS.QUICK_REPLY);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5" />
                    Prompt Brain
                </CardTitle>
                <CardDescription>Customize the AI instructions for various features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Categorization Prompt</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={categorizationPrompt}
                        onChange={(e) => setCategorizationPrompt(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Action Item & Reminder Prompt</label>
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={actionItemsPrompt}
                        onChange={(e) => setActionItemsPrompt(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Quick Reply Generation Prompt</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={quickReplyPrompt}
                        onChange={(e) => setQuickReplyPrompt(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-Reply Draft Prompt</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={autoReplyPrompt}
                        onChange={(e) => setAutoReplyPrompt(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Defaults
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Prompts
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
