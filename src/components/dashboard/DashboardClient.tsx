"use client";

import { fetchEmails } from "@/app/actions";
import { Chatbot } from "@/components/email/Chatbot";
import { EmailList } from "@/components/email/EmailList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllUniqueTags, getTagForEmail } from "@/lib/tags";
import { Email } from "@/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { EmailReadingPane } from "./EmailReadingPane";

interface DashboardClientProps {
    initialEmails: Email[];
    initialNextPageToken?: string;
}

export function DashboardClient({ initialEmails, initialNextPageToken }: DashboardClientProps) {
    const { data: session } = useSession();
    const [emails, setEmails] = useState<Email[]>(initialEmails);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(initialNextPageToken);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [tagFilter, setTagFilter] = useState<string | null>(null);
    const [uniqueTags, setUniqueTags] = useState<string[]>([]);

    // Get unique tags for filter dropdown (Client-side only to avoid hydration mismatch)
    useEffect(() => {
        setUniqueTags(getAllUniqueTags());
    }, [emails]); // Re-fetch tags when emails change (or just on mount if tags don't change often)

    // Check for emailId in URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailId = params.get("emailId");
        if (emailId && emails.length > 0) {
            const found = emails.find(e => e.id === emailId);
            if (found) {
                setSelectedEmail(found);
            }
        }
    }, [emails]);

    const loadMore = async () => {
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken || !nextPageToken) return;

        setLoading(true);
        try {
            let query = "";
            if (activeTab === "unread") query = "is:unread";
            if (activeTab === "starred") query = "is:starred";

            const res = await fetchEmails(accessToken, nextPageToken, query);
            setEmails((prev) => [...prev, ...res.emails]);
            setNextPageToken(res.nextPageToken || undefined);
        } catch (error) {
            console.error("Failed to load more emails:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = async (value: string) => {
        setActiveTab(value);
        setTagFilter(null); // Reset tag filter when changing tabs
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken) return;

        setLoading(true);
        try {
            let query = "";
            if (value === "unread") query = "is:unread";
            if (value === "starred") query = "is:starred";

            // Reset pagination and emails when filter changes
            const res = await fetchEmails(accessToken, undefined, query);
            setEmails(res.emails);
            setNextPageToken(res.nextPageToken || undefined);
            setSelectedEmail(null); // Deselect on filter change
        } catch (error) {
            console.error("Failed to filter emails:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter emails by tag if selected
    const filteredEmails = tagFilter
        ? emails.filter(e => getTagForEmail(e.id) === tagFilter)
        : emails;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            {/* Email List Panel - Hidden on mobile if email selected */}
            <div className={`lg:col-span-5 xl:col-span-4 flex flex-col rounded-xl border bg-card text-card-foreground shadow overflow-hidden ${selectedEmail ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-4 border-b border-border bg-muted/40 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold leading-none tracking-tight">Inbox</h3>
                        <span className="text-xs text-muted-foreground">{filteredEmails.length} messages</span>
                    </div>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unread">Unread</TabsTrigger>
                            <TabsTrigger value="starred">Starred</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Tag Filter */}
                    {uniqueTags.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <Button
                                variant={tagFilter === null ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs whitespace-nowrap"
                                onClick={() => setTagFilter(null)}
                            >
                                All Tags
                            </Button>
                            {uniqueTags.map(tag => (
                                <Button
                                    key={tag}
                                    variant={tagFilter === tag ? "secondary" : "outline"}
                                    size="sm"
                                    className="h-7 text-xs whitespace-nowrap"
                                    onClick={() => setTagFilter(tag)}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto">
                    <EmailList
                        emails={filteredEmails}
                        onSelect={setSelectedEmail}
                        selectedId={selectedEmail?.id}
                    />
                    {nextPageToken && !tagFilter && (
                        <div className="p-4 flex justify-center border-t border-border">
                            <Button
                                variant="ghost"
                                onClick={loadMore}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reading Pane - Hidden on mobile if no email selected */}
            <div className={`lg:col-span-7 xl:col-span-8 rounded-xl border bg-card text-card-foreground shadow overflow-hidden ${!selectedEmail ? 'hidden lg:block' : 'block'}`}>
                {selectedEmail && (
                    <div className="lg:hidden p-2 border-b border-border bg-muted/20">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Inbox
                        </Button>
                    </div>
                )}
                <EmailReadingPane email={selectedEmail} />
            </div>

            <Chatbot emails={emails} />
        </div>
    );
}
