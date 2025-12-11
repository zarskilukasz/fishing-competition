# Plan implementacji widoku Autentykacji (Login & Register)

## 1. Przegląd
Widoki autentykacji umożliwiają użytkownikom (Organizatorom i Sędziom) dostęp do części administracyjnej aplikacji. Kluczowe jest zapewnienie trwałej sesji (specjalnie dla offline) oraz bezpiecznej walidacji danych.

## 2. Routing widoku
*   `/login` - Formularz logowania.
*   `/signup` - Formularz rejestracji.

## 3. Struktura komponentów
```mermaid
graph TD
    AuthLayout --> AuthCard
    AuthCard --> LoginForm
    AuthCard --> RegisterForm
    AuthCard --> AuthFooter (Linki: "Zarejestruj się" / "Zaloguj się")
```

## 4. Szczegóły komponentów

### AuthLayout
- **Opis:** Wrapper dla stron autentykacji. Centruje zawartość na ekranie, zapewnia spójne tło/branding.
- **Główne elementy:** `div` (flex/grid centering).

### LoginForm
- **Opis:** Formularz logowania e-mail/hasło.
- **Pola:**
    - `email`: Email Input.
    - `password`: Password Input.
- **Walidacja (Zod):** Email format, Hasło required.
- **Akcja:** Wywołuje `supabase.auth.signInWithPassword`.

### RegisterForm
- **Opis:** Formularz rejestracji nowego konta.
- **Pola:**
    - `email`: Email Input.
    - `password`: Password Input (min 8 znaków).
    - `confirmPassword`: Password Input.
- **Walidacja (Zod):** Zgodność haseł, siła hasła.
- **Akcja:** Wywołuje `supabase.auth.signUp`.

## 5. Typy

```typescript
// src/features/auth/schema.ts
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła muszą być identyczne",
  path: ["confirmPassword"],
});
```

## 6. Zarządzanie stanem
- **Auth State:** Zarządzany przez Supabase Auth Helpers (`@supabase/ssr`).
- **Session Persistence:** Sesja jest automatycznie persystowana w LocalStorage/Cookies przez klienta Supabase, co zapewnia działanie offline (jeśli token jest ważny).

## 7. Integracja API
- Bezpośrednie użycie Sdk Supabase (`supabase.auth`).
- Nie wymaga customowych endpointów API (Next.js API Routes) do samej logiki logowania (Client-Side Auth).

## 8. Interakcje użytkownika
1.  Użytkownik wypełnia formularz.
2.  Klika "Zaloguj".
3.  Button wchodzi w stan `loading`.
4.  Po sukcesie: Przekierowanie na `/dashboard`.
5.  Po błędzie: Toast z komunikatem (np. "Nieprawidłowe dane").

## 9. Warunki i walidacja
- Walidacja formatu e-mail w czasie rzeczywistym lub onBlur.
- Hasło min. 8 znaków przy rejestracji.

## 10. Obsługa błędów
- Obsługa błędów AuthApiError (np. użytkownik nie istnieje, błędne hasło).
- Wyświetlanie czytelnych komunikatów w Toastach lub Alertach nad formularzem.

## 11. Kroki implementacji
1.  Stworzyć schematy Zod w `src/features/auth/schemas.ts`.
2.  Zaimplementować generyczny layout `AuthLayout`.
<<<<<<< HEAD
3.  Zaimplementować `LoginForm` i `RegisterForm` z użyciem `react-hook-form`.
=======
3.  Zaimplementować `LoginForm` i `RegisterForm` z użyciem `@tanstack/react-form`.
>>>>>>> 028462b (feat: init)
4.  Skonfigurować przekierowania w Middleware (chronione ruty).
