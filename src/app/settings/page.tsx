import { UnsubscribePanel } from "@/components/email/UnsubscribePanel";
import { PrivacyFilters } from "@/components/settings/PrivacyFilters";
import { PromptBrain } from "@/components/settings/PromptBrain";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-medium mb-4">Subscriptions</h3>
                        <UnsubscribePanel />
                    </section>
                </div>

                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-medium mb-4">Privacy & AI</h3>
                        <PrivacyFilters />
                    </section>

                    <section>
                        <PromptBrain />
                    </section>

                    <section className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="gemini-key" className="text-sm font-medium">Gemini API Key</label>
                                <input
                                    id="gemini-key"
                                    type="password"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter your API key"
                                />
                                <p className="text-xs text-muted-foreground">Required for AI summarization features.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
