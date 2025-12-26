# Namaz & Qaza Tracker

A spiritual-themed web application to help you track your daily prayers and calculate/manage your Qaza-e-Umri (Missed Prayers).

## Features

- **Daily Prayer Checklist**: Track your 5 daily prayers + Witr.
- **Qaza-e-Umri Calculator**: Automatically estimates missed prayers based on Date of Birth and Puberty Age.
- **Qaza Management**: Easily decrement your Qaza count as you perform them.
- **Progress Tracking**: Visualize your journey towards clearing your debt.
- **Privacy Focused**: Works locally by default.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open the App**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## "Demo Mode" vs Real Backend

By default, this application runs in **Demo Mode**. It uses your browser's `localStorage` to save your data (Profile, Prayer History, Qaza counts). This means:
- You don't need to set up a database to try it out.
- Your data is private to your browser.
- If you clear your browser cache, you lose the data.

### Enabling Supabase (Optional)

To persist data to the cloud:
1.  Create a project on [Supabase](https://supabase.com).
2.  Create a `.env.local` file in the root directory.
3.  Add your Supabase keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  Run the provided SQL migration scripts (not included in this prototype) to create `profiles`, `qaza_logs`, and `daily_logs` tables.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Context + LocalStorage (Fallback)