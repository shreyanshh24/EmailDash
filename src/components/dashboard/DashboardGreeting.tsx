"use client";

import { useUserProfile } from "@/hooks/use-user-profile";

export function DashboardGreeting() {
    const { name, isLoaded } = useUserProfile();

    if (!isLoaded) {
        return (
            <div>
                <h2 className="text-3xl font-bold tracking-tight h-9 w-64 bg-muted animate-pulse rounded"></h2>
                <p className="text-muted-foreground mt-2 h-5 w-48 bg-muted animate-pulse rounded"></p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h2>
            <p className="text-muted-foreground">
                Here's what's happening with your emails today.
            </p>
        </div>
    );
}
