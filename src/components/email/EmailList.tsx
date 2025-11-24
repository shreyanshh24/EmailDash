"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { getTags } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { Email } from "@/types";
import { Archive, MoreVertical, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EmailListProps {
    emails: Email[];
    onSelect?: (email: Email) => void;
    selectedId?: string;
}

export function EmailList({ emails, onSelect, selectedId }: EmailListProps) {
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
    const [tags, setTags] = useState<Record<string, string>>({});

    useEffect(() => {
        setTags(getTags());
    }, [emails]);

    const toggleSelectAll = () => {
        if (selectedEmails.size === emails.length) {
            setSelectedEmails(new Set());
        } else {
            setSelectedEmails(new Set(emails.map((e) => e.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedEmails);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEmails(newSelected);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between border-b border-border p-4 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={selectedEmails.size === emails.length && emails.length > 0}
                        onChange={toggleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                        {selectedEmails.size} selected
                    </span>
                </div>
                <div className="flex items-center gap-2">

                    {selectedEmails.size > 0 && (
                        <>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                <Archive className="h-4 w-4" />
                            </button>
                        </>
                    )}
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MoreVertical className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="divide-y divide-border">
                {emails.map((email) => (
                    <div
                        key={email.id}
                        className={cn(
                            "group flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer border-l-4",
                            email.isRead ? "opacity-70" : "font-medium",
                            selectedId === email.id ? "bg-accent border-primary" : "border-transparent"
                        )}
                        onClick={() => onSelect?.(email)}
                    >
                        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                                checked={selectedEmails.has(email.id)}
                                onChange={() => toggleSelect(email.id)}
                            />
                            <button className="text-muted-foreground hover:text-yellow-400 transition-colors">
                                <Star className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4">
                            <div className="col-span-3 truncate font-semibold text-foreground flex items-center gap-2">
                                {email.sender}
                                {tags[email.id] && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-medium">
                                        {tags[email.id]}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-7 truncate text-muted-foreground">
                                <span className="text-foreground mr-2">{email.subject}</span>
                                - {email.snippet}
                            </div>
                            <div className="col-span-2 text-right text-xs text-muted-foreground group-hover:hidden">
                                {email.date}
                            </div>
                            <div className="col-span-2 hidden group-hover:flex items-center justify-end gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}?compose=new`, '_blank');
                                    }}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20"
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
