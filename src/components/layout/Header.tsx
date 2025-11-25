"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Bell, LogOut, Search, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";

export function Header() {
    const { data: session } = useSession();
    const { name } = useUserProfile();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search emails..."
                        className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Notifications</h4>
                                    <p className="text-sm text-muted-foreground">
                                        You have 3 unread messages.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">New Login Detected</p>
                                            <p className="text-xs text-muted-foreground">Just now</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">Weekly Summary Ready</p>
                                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                                        <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500" />
                                        <div>
                                            <p className="text-sm font-medium">Storage 80% Full</p>
                                            <p className="text-xs text-muted-foreground">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <ThemeToggle />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white overflow-hidden ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4" />
                        )}
                    </button>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50 animate-in fade-in-0 zoom-in-95">
                                <div className="px-2 py-1.5 text-sm font-semibold">
                                    <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="hover:underline">
                                        {name || "My Account"}
                                    </Link>
                                    <div className="text-xs font-normal text-muted-foreground truncate">
                                        {session?.user?.email}
                                    </div>
                                </div>
                                <div className="h-px bg-muted my-1" />
                                <Link
                                    href="/settings"
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                                <div className="h-px bg-muted my-1" />
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
