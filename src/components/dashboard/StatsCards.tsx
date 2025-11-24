"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, ShieldAlert } from "lucide-react";

export function StatsCards({
    unreadCount = 0,
    spamCount = 0,
    reminderCount = 0
}: {
    unreadCount?: number;
    spamCount?: number;
    reminderCount?: number;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{unreadCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Current inbox
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Spam Blocked</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{spamCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Total blocked
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reminders</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{reminderCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Active reminders
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
