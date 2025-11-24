"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Email } from "@/types";
import { useState } from "react";

interface EmailDetailModalProps {
    email: Email | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EmailDetailModal({ email, isOpen, onClose }: EmailDetailModalProps) {
    const [isReplying, setIsReplying] = useState(false);

    if (!email) return null;

    const handleReply = () => {
        window.open(`https://mail.google.com/mail/u/0/#inbox/${email.id}?compose=new`, '_blank');
        setIsReplying(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{email.subject}</DialogTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                        <span>{email.sender}</span>
                        <span>{email.date}</span>
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{email.snippet}</p>
                        {/* In a real app, we would fetch and render the full HTML body here */}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button onClick={handleReply}>Reply in Gmail</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
