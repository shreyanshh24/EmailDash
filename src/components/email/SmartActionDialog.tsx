"use client";

import { addToCalendarAction, detectRemindersAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Email } from "@/types";
import { CalendarPlus, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface SmartActionDialogProps {
    email: Email | null;
    isOpen: boolean;
    onClose: () => void;
}

interface ReminderItem {
    text: string;
    date: string | null;
}

export function SmartActionDialog({ email, isOpen, onClose }: SmartActionDialogProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [reminders, setReminders] = useState<ReminderItem[]>([]);
    const [analyzed, setAnalyzed] = useState(false);
    const [addingToCalendar, setAddingToCalendar] = useState<number | null>(null);

    // State for editing reminder details
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDate, setEditDate] = useState("");
    const [reminderOffset, setReminderOffset] = useState("30"); // Default 30 mins

    useEffect(() => {
        if (isOpen && email) {
            analyzeEmail();
        } else {
            // Reset state on close
            setReminders([]);
            setAnalyzed(false);
            setEditIndex(null);
        }
    }, [isOpen, email]);

    const analyzeEmail = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const content = `Subject: ${email.subject}\n\n${email.body || email.snippet}`;
            const res = await detectRemindersAction(content);
            if (res.success && res.reminders) {
                setReminders(res.reminders.map((r: any) => ({
                    text: r.text,
                    date: r.date || null
                })));
            }
        } catch (error) {
            console.error("Error analyzing email:", error);
        } finally {
            setLoading(false);
            setAnalyzed(true);
        }
    };



    const handleAddToCalendar = async (index: number, reminder: ReminderItem) => {
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken) return;

        setAddingToCalendar(index);

        try {
            // Use edited values if this item is being edited, otherwise calculate from default
            let title = reminder.text;
            let dateStr = reminder.date;

            if (editIndex === index) {
                title = editTitle;
                // editDate is from datetime-local input (local time), convert to ISO (UTC) for server
                dateStr = new Date(editDate).toISOString();
            } else if (dateStr) {
                // Use detected date directly
            } else {
                // Fallback if no date detected
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(9, 0, 0, 0);
                dateStr = tomorrow.toISOString();
            }

            const res = await addToCalendarAction(accessToken, title, dateStr!, parseInt(reminderOffset));

            if (res.success) {
                alert("Added to calendar successfully!");
                if (res.link) {
                    window.open(res.link, '_blank');
                }
                onClose();
            } else {
                alert("Failed to add to calendar.");
            }
        } catch (error) {
            console.error("Error adding to calendar:", error);
            alert("Error adding to calendar.");
        } finally {
            setAddingToCalendar(null);
        }
    };

    const startEditing = (index: number, reminder: ReminderItem) => {
        setEditIndex(index);
        setEditTitle(reminder.text);

        if (reminder.date) {
            const eventDate = new Date(reminder.date);
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            // Adjust for local timezone offset to show correct local time in input
            const offset = eventDate.getTimezoneOffset() * 60000;
            const localDate = new Date(eventDate.getTime() - offset);
            setEditDate(localDate.toISOString().slice(0, 16));
        } else {
            setEditDate("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Smart Actions
                    </DialogTitle>
                    <DialogDescription>
                        AI-detected events and tasks from this email.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analyzing email content...</p>
                    </div>
                ) : analyzed && reminders.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No specific events or tasks detected.
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Default Reminder:</label>
                            <Select value={reminderOffset} onValueChange={setReminderOffset}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">At time of event</SelectItem>
                                    <SelectItem value="15">15 mins before</SelectItem>
                                    <SelectItem value="30">30 mins before</SelectItem>
                                    <SelectItem value="60">1 hour before</SelectItem>
                                    <SelectItem value="1440">1 day before</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {reminders.map((reminder, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-3 bg-card/50">
                                    {editIndex === index ? (
                                        <div className="space-y-2">
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Event Title"
                                            />
                                            <Input
                                                type="datetime-local"
                                                value={editDate}
                                                onChange={(e) => setEditDate(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setEditIndex(null)}>Cancel</Button>
                                                <Button size="sm" onClick={() => handleAddToCalendar(index, reminder)}>
                                                    {addingToCalendar === index && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-medium text-sm">{reminder.text}</div>
                                                {reminder.date && (
                                                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                        {new Date(reminder.date).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => startEditing(index, reminder)}>
                                                    Edit
                                                </Button>
                                                <Button size="sm" onClick={() => handleAddToCalendar(index, reminder)} disabled={addingToCalendar === index}>
                                                    {addingToCalendar === index ? (
                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CalendarPlus className="mr-2 h-3 w-3" />
                                                    )}
                                                    Add Reminder
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
