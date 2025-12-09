# Project Coding Rules & Guidelines

This document serves as a consolidated reference for the coding standards and rules defined in `.agent/rules`.

## 1. Naming Conventions (`naming-conventions-rule.mdc`)
- **Components**: Use `PascalCase` (e.g., `UserProfile.tsx`).
- **Variables & Functions**: Use `camelCase` (e.g., `fetchUserData`, `isLoading`).
- **Files**: Follow convention matching the content (PascalCase for components, camelCase for utils).

## 2. React & TypeScript Best Practices (`react-and-typescript-general-rules.mdc`)
- **Modern Standards**: Use the latest stable versions of React, Next.js (App Router), and TypeScript.
- **Code Quality**: Write clear, readable code. Avoid "lazy" implementations; implement full features.
- **Reasoning**: Provide accurate and thoughtful explanations.

## 3. TypeScript Usage (`typescript-usage-rule.mdc`)
- **Strict Typing**: Avoid `any`. Use strict type safety.
- **Interfaces vs Types**: Prefer `interfaces` for defining object shapes.
- **Generics**: Use generics for reusable components and functions.

## 4. UI & Styling (`ui-and-styling-rule.mdc`)
- **Styling**: Use **Tailwind CSS** utility classes.
- **Components**: Use **Shadcn UI** components and follow their guidelines.
- **UX**: Ensure responsiveness and accessibility (A11y).

## 5. Performance Optimization (`performance-optimization-rule.mdc`)
- **Rendering**: Optimize using `React.memo`, `useMemo`, `useCallback` where appropriate to avoid unnecessary re-renders.
- **Loading**: Use lazy loading for components and images.
- **Efficiency**: Use efficient data structures and algorithms.
