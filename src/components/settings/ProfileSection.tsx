"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Check, LogOut, Pencil, User, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function ProfileSection() {
    const { name, email, image, updateName } = useUserProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(name);

    const handleSave = () => {
        updateName(newName);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setNewName(name);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-card rounded-xl border shadow-sm">
            <div className="relative h-24 w-24 mb-4">
                {image ? (
                    <img
                        src={image}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover border-4 border-background shadow-md"
                    />
                ) : (
                    <div className="h-full w-full rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                        <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-8 w-40 text-center font-bold"
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => {
                            setNewName(name);
                            setIsEditing(true);
                        }}>
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </>
                )}
            </div>

            <p className="text-muted-foreground mb-6">{email}</p>

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
