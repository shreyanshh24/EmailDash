import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export const getCalendarClient = (accessToken: string) => {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: "v3", auth });
};

export async function createCalendarEvent(accessToken: string, title: string, date: string) {
    const calendar = getCalendarClient(accessToken);

    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    const event = {
        summary: title,
        start: {
            dateTime: startDate.toISOString(),
        },
        end: {
            dateTime: endDate.toISOString(),
        },
    };

    try {
        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return { success: true, link: res.data.htmlLink };
    } catch (error) {
        console.error("Error creating calendar event:", error);
        throw error;
    }
}
