import { fetchEmails } from "@/app/actions";
import { RemindersClient } from "@/components/reminders/RemindersClient";
import { authOptions } from "@/lib/auth";
import { Email } from "@/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function RemindersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // @ts-ignore
    const accessToken = session?.accessToken;
    let emails: Email[] = [];

    if (accessToken) {
        try {
            // Fetch recent emails to provide context for the chatbot
            const res = await fetchEmails(accessToken);
            emails = res.emails;
        } catch (error) {
            console.error("Failed to fetch emails for reminders page:", error);
        }
    }

    return <RemindersClient emails={emails} />;
}
