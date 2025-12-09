# Fishing Competition Manager

**Fishing Competition Manager** (Zarządzanie Zawodami Wędkarskimi) is a Progressive Web App (PWA) designed to act as a digital assistant for fishing competition organizers and judges. It automates key processes such as participant management, spot drawing, weighing, and ranking calculations, significantly reducing manual work and errors.

## Project Description

Organizers of fishing competitions often struggle with manual processes in challenging field conditions—paper lists, manual drawings, and spreadsheet calculations—leading to delays and errors.

This application solves these problems by providing:
*   **Offline-first capability:** Works reliably in "dead-zones" without GSM coverage.
*   **Automation:** Streamlines drawing, weighing, and ranking calculations.
*   **Efficiency:** Reduces the time from "rods out" to results announcement by ~50%.
*   **Live Results:** Allows spectators to follow results in real-time (when internet is available).

## Tech Stack

### Core Framework
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **UI Library:** React 19

### Styling & UI
*   **CSS:** Tailwind CSS 4
*   **Components:** shadcn/ui (Radix UI based)
*   **Icons:** Lucide React
*   **Animations:** tw-animate-css

### Data & Backend
*   **State Management:** TanStack Query v5
*   **Backend & Auth:** Supabase (PostgreSQL)
*   **Forms:** React Hook Form + Zod configuration

## Getting Started Locally

### Prerequisites
*   Node.js (v20+ recommended)
*   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd fishing-journal
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in the development mode.
*   `npm run build`: Builds the app for production to the `.next` folder.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Runs ESLint to check for code quality issues.

## Project Scope

The current version (MVP) covers the following key functionalities:

*   **Authentication:**
    *   Organizer & Assistant login/registration.
    *   Offline authentication support.
*   **Competition Management:**
    *   Creating and configuring competitions (Date, Spots, Categories).
*   **Participant Management:**
    *   Bulk import of participants.
    *   Attendance checking.
    *   Automated spot drawing.
*   **Judging (Weighing):**
    *   Offline-first weighing interface.
    *   Support for "Big Fish" and Disqualifications (DSQ).
*   **Results:**
    *   Real-time live view for spectators.
    *   PDF Export.
    *   Automated ranking algorithms.

**Out of Scope (MVP):** Participant accounts, online payments, global history, multi-sector support.

## Project Status

*   **Version:** 1.0 (MVP)
*   **Status:** Draft / In Development

## License

This project is currently marked as **Private**.
