"use client";

import { getSubscriptionsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Loader2, Mail, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Subscription {
    id: string;
    sender: string;
    email: string;
    unsubscribeUrl: string;
}

export function UnsubscribePanel() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [unsubscribed, setUnsubscribed] = useState<Set<string>>(new Set());

    const fetchSubscriptions = async () => {
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken) return;

        setLoading(true);
        try {
            const res = await getSubscriptionsAction(accessToken);
            if (res.success && res.subscriptions) {
                setSubscriptions(res.subscriptions);
            }
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchSubscriptions();
        }
    }, [session]);

    const handleUnsubscribe = (sub: Subscription) => {
        setUnsubscribed((prev) => new Set(prev).add(sub.id));

        // Open unsubscribe link in new tab
        if (sub.unsubscribeUrl.startsWith("http")) {
            window.open(sub.unsubscribeUrl, "_blank");
        } else if (sub.unsubscribeUrl.startsWith("mailto:")) {
            window.location.href = sub.unsubscribeUrl;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Manage Subscriptions</CardTitle>
                        <CardDescription>Easily unsubscribe from unwanted newsletters and mailing lists.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchSubscriptions} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading && subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-50" />
                            <p>Scanning your emails for subscriptions...</p>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
                            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No active subscriptions found in recent emails.</p>
                        </div>
                    ) : (
                        subscriptions.map((sub) => (
                            <div
                                key={sub.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="overflow-hidden mr-4">
                                    <h4 className="font-medium truncate">{sub.sender}</h4>
                                    <p className="text-sm text-muted-foreground truncate">{sub.email}</p>
                                </div>
                                {unsubscribed.has(sub.id) ? (
                                    <div className="flex items-center text-green-500 text-sm font-medium shrink-0">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Opened
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUnsubscribe(sub)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Unsubscribe
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
