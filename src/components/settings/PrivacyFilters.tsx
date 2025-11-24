"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrivacyRules, removePrivacyRule, savePrivacyRule } from "@/lib/settings";
import { PrivacyRule } from "@/types";
import { Plus, ShieldBan, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function PrivacyFilters() {
    const [rules, setRules] = useState<PrivacyRule[]>([]);
    const [newValue, setNewValue] = useState("");
    const [newType, setNewType] = useState<'sender' | 'domain'>('sender');

    useEffect(() => {
        setRules(getPrivacyRules());
    }, []);

    const handleAddRule = () => {
        if (!newValue) return;
        const updated = savePrivacyRule({ type: newType, value: newValue, action: 'block_ai' });
        setRules(updated);
        setNewValue("");
    };

    const handleRemoveRule = (value: string) => {
        const updated = removePrivacyRule(value);
        setRules(updated);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldBan className="h-5 w-5" />
                    Privacy Filters
                </CardTitle>
                <CardDescription>Block specific senders or domains from being processed by AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as 'sender' | 'domain')}
                    >
                        <option value="sender">Sender Email</option>
                        <option value="domain">Domain</option>
                    </select>
                    <input
                        type="text"
                        placeholder={newType === 'sender' ? "example@spam.com" : "example.com"}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                    <Button onClick={handleAddRule}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>

                <div className="space-y-2">
                    {rules.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No privacy rules set.</p>
                    ) : (
                        rules.map((rule, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium uppercase bg-primary/10 text-primary px-2 py-1 rounded">
                                        {rule.type}
                                    </span>
                                    <span className="text-sm font-medium">{rule.value}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveRule(rule.value)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
