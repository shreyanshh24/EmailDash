"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useUserProfile() {
    const { data: session, status } = useSession();
    const [name, setName] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Function to load name from storage or session
        const loadName = () => {
            const storedName = localStorage.getItem("user_display_name");
            if (storedName) {
                setName(storedName);
            } else if (session?.user?.name) {
                setName(session.user.name);
            }
        };

        // Initial load
        if (status !== "loading") {
            loadName();
            setIsLoaded(true);
        }

        // Listen for local updates (custom event) and cross-tab updates (storage event)
        const handleNameUpdate = () => {
            const storedName = localStorage.getItem("user_display_name");
            if (storedName) {
                setName(storedName);
            }
        };

        window.addEventListener("user_display_name_updated", handleNameUpdate);
        window.addEventListener("storage", handleNameUpdate);

        return () => {
            window.removeEventListener("user_display_name_updated", handleNameUpdate);
            window.removeEventListener("storage", handleNameUpdate);
        };
    }, [session, status]);

    const updateName = (newName: string) => {
        setName(newName);
        localStorage.setItem("user_display_name", newName);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("user_display_name_updated"));
    };

    return {
        name: name || session?.user?.name || "User",
        email: session?.user?.email,
        image: session?.user?.image,
        updateName,
        isLoaded
    };
}
