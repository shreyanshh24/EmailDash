"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addReminder } from "@/lib/reminders";
import { Calendar, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DetectedReminder {
    text: string;
    date?: string;
}

interface ReminderReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reminders: DetectedReminder[];
    emailId: string;
}

export function ReminderReviewModal({ isOpen, onClose, reminders: initialReminders, emailId }: ReminderReviewModalProps) {
    const [reminders, setReminders] = useState(initialReminders);

    // Update local state when props change
    useEffect(() => {
        setReminders(initialReminders);
    }, [initialReminders, isOpen]);

    const handleRemove = (index: number) => {
        setReminders(reminders.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        reminders.forEach(r => {
            addReminder({
                emailId,
                text: r.text,
                date: r.date
            });
        });
        onClose();
        // Ideally show a toast here
        alert("Reminders saved!");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Reminders</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {reminders.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No reminders detected.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reminders.map((reminder, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium">{reminder.text}</p>
                                        {reminder.date && (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {new Date(reminder.date).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={reminders.length === 0}>
                        <Check className="mr-2 h-4 w-4" />
                        Save Reminders
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
