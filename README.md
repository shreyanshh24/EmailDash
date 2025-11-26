# EmailDash - AI-Powered Email Dashboard

EmailDash is a modern, AI-enhanced email client built with Next.js. It integrates with Gmail and Google Calendar to provide a seamless productivity experience, featuring AI-powered summarization, smart replies, and automated task detection.

## Features

-   **AI-Powered Email Management**:
    -   **Smart Summaries**: Get concise summaries of long emails using Google Gemini.
    -   **Quick Replies**: Generate context-aware replies with AI assistance.
    -   **Action Item Detection**: Automatically detect tasks and reminders from email content.
-   **Gmail Integration**:
    -   View, send, and manage emails directly from the dashboard.
    -   Mark emails as read/unread.
    -   Subscription management (scan and unsubscribe).
-   **Calendar Integration**:
    -   Add events and reminders directly to Google Calendar.
-   **Modern UI/UX**:
    -   Clean, responsive interface built with Tailwind CSS and Radix UI.
    -   Dark mode support.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS, Radix UI, Lucide React
-   **AI**: Google Generative AI (Gemini)
-   **Authentication**: NextAuth.js (Google Provider)
-   **APIs**: Gmail API, Google Calendar API

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   A Google Cloud Project with the following APIs enabled:
    -   Gmail API
    -   Google Calendar API
-   Google OAuth credentials (Client ID and Client Secret)
-   Google Gemini API Key

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/shreyanshh24/EmailDash.git
    cd EmailDash
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXTAUTH_SECRET=your_nextauth_secret
    NEXTAUTH_URL=http://localhost:3000
    GOOGLE_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploy on Render

1.  Push your code to a GitHub repository.
2.  Create a new Web Service on [Render](https://render.com/).
3.  Connect your repository.
4.  Add the environment variables in the Render dashboard.
5.  Render will automatically build and deploy your application using the `render.yaml` configuration if present, or you can configure it manually.

## Usage

-   **Login**: Sign in with your Google account.
-   **Dashboard**: View your latest emails.
-   **Smart Actions**: Click on an email to view details, generate summaries, or add reminders.
-   **Compose**: Draft and send new emails.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
