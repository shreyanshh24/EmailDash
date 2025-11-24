"use client";

import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function ProfileSection() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col items-center p-6 bg-card rounded-xl border shadow-sm">
            <div className="relative h-24 w-24 mb-4">
                {session?.user?.image ? (
                    <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover border-4 border-background shadow-md"
                    />
                ) : (
                    <div className="h-full w-full rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                        <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold text-foreground">{session?.user?.name || "User"}</h2>
            <p className="text-muted-foreground mb-6">{session?.user?.email}</p>

            <Button
                variant="destructive"
                className="w-full max-w-xs"
                onClick={() => signOut({ callbackUrl: "/login" })}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
    );
}
