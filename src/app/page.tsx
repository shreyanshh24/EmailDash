import { fetchEmails } from "@/app/actions";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { authOptions } from "@/lib/auth";
import { Email } from "@/types";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // @ts-ignore
  const accessToken = session?.accessToken;

  let emails: Email[] = [];
  let nextPageToken: string | undefined;

  if (accessToken) {
    try {
      const res = await fetchEmails(accessToken);
      emails = res.emails;
      nextPageToken = res.nextPageToken || undefined;
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}
          </p>
        </div>
      </div>

      <StatsCards unreadCount={emails.filter(e => !e.isRead).length} />

      <DashboardClient initialEmails={emails} initialNextPageToken={nextPageToken} />
    </div>
  );
}
