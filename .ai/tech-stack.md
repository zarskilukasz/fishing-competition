# Tech Stack

This document outlines the technology stack used in the Fishing Competition project, generated based on `package.json`.

## Core Framework
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://react.dev/)

## Styling & Components
- **CSS Framework:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Primitives:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI based)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Theming:** `next-themes`
- **Toasts:** `sonner`
- **Drawers:** `vaul`
- **Carousel:** `embla-carousel-react`
- **OTP Input:** `input-otp`
- **Layout:** `react-resizable-panels`
- **Utilities:**
  - `clsx` & `tailwind-merge` for class name management
  - `class-variance-authority` (CVA) for component variants
  - `tw-animate-css` for animations

## State Management & Data Fetching
- **Server State:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query)

## Backend & Database
- **Platform:** [Supabase](https://supabase.com/)
- **Database:** PostgreSQL
- **Client:** `@supabase/supabase-js`
- **SSR Helper:** `@supabase/ssr`

## Forms & Validation
- **Form Management:** 
  - [`@tanstack/react-form`](https://tanstack.com/form/latest)
- **Schema Validation:** [Zod](https://zod.dev/)

## PDF Generation
- **Library:** `@react-pdf/renderer`

## Virtualization
- **Library:** `@tanstack/react-virtual`

## Utilities
- **Date Handling:** [date-fns](https://date-fns.org/)
- **Linting:** ESLint 9
- **Environment:** `dotenv`

## Configuration
- **Shadcn Config:** `new-york` style, `neutral` base color, CSS variables enabled.
