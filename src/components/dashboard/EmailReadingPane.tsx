import { getQuickRepliesAction, sendEmailAction } from "@/app/actions";
import { ReminderReviewModal } from "@/components/email/ReminderReviewModal";
import { Button } from "@/components/ui/button";
import { getCachedAnalysis, saveCachedAnalysis } from "@/lib/aiCache";
import { categorizeEmail, detectReminders, summarizeEmail } from "@/lib/gemini";
import { DEFAULT_PROMPTS, PROMPT_KEYS, getPrompt } from "@/lib/prompts";
import { addReminder } from "@/lib/reminders";
import { isBlocked } from "@/lib/settings";
import { getSummaryForEmail, saveSummary } from "@/lib/summaries";
import { saveTag } from "@/lib/tags";
import { stripHtml } from "@/lib/utils";
import { Email } from "@/types";
import { Bell, FileText, Loader2, Reply, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface EmailReadingPaneProps {
    email: Email | null;
}

export function EmailReadingPane({ email }: EmailReadingPaneProps) {
    const { data: session } = useSession();
    const [isCheckingReminders, setIsCheckingReminders] = useState(false);
    const [reminderModalOpen, setReminderModalOpen] = useState(false);
    const [detectedReminders, setDetectedReminders] = useState<{ text: string; date?: string }[]>([]);

    // Reply State
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [quickReplies, setQuickReplies] = useState<string[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [sending, setSending] = useState(false);

    // Auto-tagging & Reminders State
    const [category, setCategory] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);

    // Reset state when email changes
    useEffect(() => {
        setCategory(null);
        setDetectedReminders([]);
        setSummary(null);
        setQuickReplies([]);
        setIsReplying(false);
        setReplyContent("");

        if (email) {
            // Check cache first
            const cached = getCachedAnalysis(email.id);
            if (cached) {
                setCategory(cached.category);
                setDetectedReminders(cached.reminders);
            } else {
                // If not cached, process
                processEmailAI();
            }

            // Check for saved summary
            const savedSummary = getSummaryForEmail(email.id);
            if (savedSummary) {
                setSummary(savedSummary.summary);
            }
        }
    }, [email?.id]);

    const processEmailAI = async () => {
        if (!email) return;

        // Check privacy rules
        const sender = email.senderEmail || "";
        const domain = sender.split("@")[1] || "";
        if (isBlocked(sender, domain)) {
            console.log("AI processing blocked by privacy rule for:", sender);
            return;
        }

        setAiLoading(true);

        try {
            const actionPrompt = getPrompt(PROMPT_KEYS.ACTION_ITEMS, DEFAULT_PROMPTS.ACTION_ITEMS);
            const catPrompt = getPrompt(PROMPT_KEYS.CATEGORIZATION, DEFAULT_PROMPTS.CATEGORIZATION);

            // Strip HTML to send only text to AI
            const cleanContent = stripHtml(email.body || email.snippet);

            const [cat, reminders] = await Promise.all([
                categorizeEmail(cleanContent),
                detectReminders(cleanContent, actionPrompt)
            ]);

            setCategory(cat);
            setDetectedReminders(reminders);

            // Save to cache
            saveCachedAnalysis(email.id, cat, reminders);

            // Also save tag to global tags list for filtering
            if (cat) {
                saveTag(email.id, cat);
            }

        } catch (error) {
            console.error("Error processing AI:", error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleCheckReminders = async () => {
        if (!email) return;
        setIsCheckingReminders(true);
        try {
            const cleanContent = stripHtml(email.body || email.snippet);
            const reminders = await detectReminders(cleanContent);
            setDetectedReminders(reminders);
            setReminderModalOpen(true);
        } catch (error) {
            console.error("Failed to detect reminders:", error);
            alert("Failed to detect reminders. Please try again.");
        } finally {
            setIsCheckingReminders(false);
        }
    };

    const handleSaveReminders = () => {
        detectedReminders.forEach(r => {
            addReminder({
                emailId: email!.id,
                text: r.text,
                date: r.date
            });
        });
        alert("Reminders saved!");
        // We don't clear detectedReminders here so the user can still see what was found.
        // But maybe we should mark them as saved? For now, just alert is fine.
    };

    const handleSummarize = async () => {
        if (!email) return;
        setSummarizing(true);
        try {
            const cleanContent = stripHtml(email.body || email.snippet);
            const result = await summarizeEmail(cleanContent, email.sender);
            setSummary(result);
            saveSummary(email.id, result);
        } catch (error) {
            console.error("Failed to summarize:", error);
            alert("Failed to generate summary.");
        } finally {
            setSummarizing(false);
        }
    };

    const handleReplyClick = async () => {
        setIsReplying(!isReplying);
        if (!isReplying && quickReplies.length === 0 && email) {
            setLoadingReplies(true);
            const prompt = getPrompt(PROMPT_KEYS.QUICK_REPLY, DEFAULT_PROMPTS.QUICK_REPLY);
            const cleanContent = stripHtml(email.body || email.snippet);
            const replies = await getQuickRepliesAction(cleanContent, prompt);
            setQuickReplies(replies);
            setLoadingReplies(false);
        }
    };

    const handleSendReply = async () => {
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken || !email || !replyContent) return;

        setSending(true);
        try {
            const res = await sendEmailAction(accessToken, email.senderEmail, `Re: ${email.subject}`, replyContent, email.id);
            if (res.success) {
                alert("Reply sent successfully!");
                setIsReplying(false);
                setReplyContent("");
            } else {
                alert("Failed to send reply.");
            }
        } catch (error) {
            console.error("Error sending reply:", error);
            alert("Error sending reply.");
        } finally {
            setSending(false);
        }
    };

    if (!email) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <div className="bg-accent/50 p-4 rounded-full mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Select an email to read</h3>
                <p className="max-w-xs mt-2">
                    Choose an email from the list to view its content and access quick AI actions.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-border p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {category && (
                                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                                    {category}
                                </span>
                            )}
                            {aiLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </div>
                        <h2 className="text-2xl font-bold leading-tight">{email.subject}</h2>
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <span className="font-medium text-foreground">{email.sender}</span>
                            <span>•</span>
                            <span>{email.date}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {detectedReminders.length > 0 && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
                                onClick={() => setReminderModalOpen(true)}
                                title="Reminders detected! Click to review and save."
                            >
                                <Bell className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleReplyClick}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSummarize}
                            disabled={summarizing}
                        >
                            {summarizing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4 mr-2" />
                            )}
                            {summary ? "Re-summarize" : "Summarize"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Summary Section */}
                {summary && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-primary font-medium">
                            <Sparkles className="h-4 w-4" />
                            <h3>AI Summary</h3>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                            {summary}
                        </p>
                    </div>
                )}

                {/* Reply Section */}
                {isReplying && (
                    <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Quick Replies (AI)</h4>
                            {loadingReplies && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                        </div>

                        {quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {quickReplies.map((reply, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setReplyContent(reply)}
                                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-full transition-colors text-left"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}

                        <textarea
                            className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Type your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />

                        <div className="flex justify-end">
                            <Button onClick={handleSendReply} disabled={sending || !replyContent}>
                                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reply
                            </Button>
                        </div>
                    </div>
                )}

                <div className="prose dark:prose-invert max-w-none">
                    <div
                        className="font-sans text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: email.body || email.snippet }}
                    />
                </div>
            </div>
            <ReminderReviewModal
                isOpen={reminderModalOpen}
                onClose={() => setReminderModalOpen(false)}
                reminders={detectedReminders}
                emailId={email.id}
            />
        </div >
    );
}
