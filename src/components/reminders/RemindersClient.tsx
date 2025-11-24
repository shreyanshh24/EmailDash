"use client";

import { addToCalendarAction } from "@/app/actions";
import { Chatbot } from "@/components/email/Chatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getReminders, Reminder, removeReminder } from "@/lib/reminders";
import { Email } from "@/types";
import { Bell, Calendar, CalendarPlus, ExternalLink, Loader2, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RemindersClientProps {
    emails: Email[];
}

export function RemindersClient({ emails }: RemindersClientProps) {
    const { data: session } = useSession();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [addingToCalendar, setAddingToCalendar] = useState<string | null>(null);

    useEffect(() => {
        setReminders(getReminders());
    }, []);

    const handleDelete = (id: string) => {
        removeReminder(id);
        setReminders(getReminders());
    };

    const handleAddToCalendar = async (reminder: Reminder) => {
        // @ts-ignore
        const accessToken = session?.accessToken;
        if (!accessToken || !reminder.date) return;

        setAddingToCalendar(reminder.id);
        try {
            const res = await addToCalendarAction(accessToken, reminder.text, reminder.date);
            if (res.success) {
                alert("Added to calendar successfully!");
                if (res.link) {
                    window.open(res.link, '_blank');
                }
            } else {
                alert("Failed to add to calendar. Please ensure you have granted calendar permissions.");
            }
        } catch (error) {
            console.error("Error adding to calendar:", error);
            alert("Error adding to calendar.");
        } finally {
            setAddingToCalendar(null);
        }
    };

    const filteredReminders = reminders.filter(reminder => {
        const matchesSearch = reminder.text.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "all") return true;

        if (filter === "upcoming") {
            if (!reminder.date) return false;
            return new Date(reminder.date) > new Date();
        }

        if (filter === "past") {
            if (!reminder.date) return false;
            return new Date(reminder.date) < new Date();
        }

        return true;
    });

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reminders</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {reminders.length} total • {filteredReminders.length} visible
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reminders..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past Due</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 flex-1 overflow-y-auto pb-20">
                {filteredReminders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10 flex flex-col items-center justify-center h-64">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p>No reminders found.</p>
                        {reminders.length > 0 && <p className="text-xs mt-2">Try adjusting your search or filters.</p>}
                    </div>
                ) : (
                    filteredReminders.map((reminder) => (
                        <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium leading-snug pr-4">
                                    {reminder.text}
                                </CardTitle>
                                <Bell className="h-4 w-4 text-primary shrink-0 mt-1" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        {reminder.date ? (
                                            <>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span className={new Date(reminder.date) < new Date() ? "text-destructive font-medium" : ""}>
                                                    Due: {new Date(reminder.date).toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <span>No due date</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {reminder.date && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                onClick={() => handleAddToCalendar(reminder)}
                                                disabled={addingToCalendar === reminder.id}
                                            >
                                                {addingToCalendar === reminder.id ? (
                                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                ) : (
                                                    <CalendarPlus className="h-3 w-3 mr-2" />
                                                )}
                                                Add to Calendar
                                            </Button>
                                        )}
                                        <Link href={`/?emailId=${reminder.emailId}`}>
                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                View Email
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                                            onClick={() => handleDelete(reminder.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Chatbot emails={emails} />
        </div>
    );
}
