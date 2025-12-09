# API Implementation Plan: Fishing Competition Manager

Ten dokument zawiera szczegółowe plany wdrożenia dla wszystkich endpointów wymaganych przez PRD i specyfikację API. Endpointy zostały pogrupowane według zasobów.

---

<analysis>
Analiza wymagań na podstawie `prd.md` i `api-plan.md`:

1.  **Zasoby**: Competitions, Categories, Participants, Catches, Leaderboard.
2.  **Flow Danych**:
    *   Klient (Next.js/PWA) <-> Supabase Edge Functions / Next.js API Routes <-> Supabase DB.
    *   Ze względu na wymóg "Offline-first", krytyczne jest użycie UUID po stronie klienta i idempotentność operacji (szczególnie `POST`).
3.  **Kluczowe Logiki do Wdrożenia**:
    *   **Walidacja statusów**: Zmiany danych (uczestnicy, połowy) możliwe tylko gdy status zawodów nie jest `FINISHED`.
    *   **Losowanie stanowisk**: Specjalna akcja (RPC lub endpoint) do przydzielania losowych numerów stanowisk.
    *   **Ranking**: Skomplikowana logika agregacji i sortowania (ex aequo).
4.  **Bezpieczeństwo**:
    *   Restrykcyjny RLS w bazie danych (zgodnie z `db-plan.md`).
    *   Walidacja po stronie API (Zod) jako druga warstwa obrony.
5.  **Błędy**: Standardowe mapowanie błędów HTTP (400, 404, 403, 500).

</analysis>

---

## Spis Treści
1. [Infrastruktura Wspólna](#1-infrastruktura-wspólna)
2. [Competitions (Zawody)](#2-competitions-zawody)
3. [Categories (Kategorie)](#3-categories-kategorie)
4. [Participants (Uczestnicy)](#4-participants-uczestnicy)
5. [Catches (Połowy)](#5-catches-połowy)
6. [Leaderboard (Ranking)](#6-leaderboard-ranking)

---

## 1. Infrastruktura Wspólna

Zanim przystąpimy do implementacji poszczególnych endpointów, należy przygotować wspólne komponenty.

### 1.1 Stack Technologiczny
*   **Framework**: Next.js 16 App Router (Route Handlers).
*   **Baza Danych**: Supabase (PostgreSQL).
*   **Auth**: Supabase Auth (SSR).
*   **Walidacja**: Zod.

### 1.2 Struktura Kodów Błędów

Implementacja centralnego mechanizmu obsługi błędów (`catchError` middleware lub utility), zwracającego spójne odpowiedzi JSON:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Peg number must be unique",
    "details": [...]
  }
}
```

---

## 2. Competitions (Zawody)

### 2.1 GET /competitions
**Cel**: Pobranie listy zawodów należących do zalogowanego użytkownika (organizatora).

#### Szczegóły żądania
*   **Metoda**: `GET`
*   **URL**: `/api/competitions`
*   **Parametry**: brak (opcjonalnie ?status=PLANNED)

#### DTO i Typy
*   Response: `Competition[]` (z `database.types.ts`)

#### Krok implementacji
1.  Stworzyć `app/api/competitions/route.ts`.
2.  Pobrać sesję użytkownika z `supabase.auth.getUser()`.
3.  Dla `GET`: Wykonać zapytanie `supabase.from('competitions').select('*').eq('owner_id', user.id)`.
4.  Zwrócić listę.

### 2.2 POST /competitions
**Cel**: Utworzenie nowych zawodów.

#### Szczegóły żądania
*   **Metoda**: `POST`
*   **URL**: `/api/competitions`
*   **Body (Zod)**:
    ```typescript
    z.object({
      name: z.string().min(3),
      date: z.string().date(), // ISO checks
      pegs_count: z.number().int().positive()
    })
    ```

#### Szczegóły odpowiedzi
*   **201 Created**: Zwraca utworzony obiekt `Competition`.
*   **400 Bad Request**: Błędy walidacji.

#### Krok implementacji
1.  W `app/api/competitions/route.ts` (POST).
2.  Zwalidować body używając Zod.
3.  Wykonać `supabase.from('competitions').insert({...body, owner_id: user.id}).select().single()`.
4.  Obsłużyć błędy bazy danych.

### 2.3 GET /competitions/[id]
**Cel**: Pobranie szczegółów pojedynczych zawodów.

#### Szczegóły żądania
*   **Metoda**: `GET`
*   **URL**: `/api/competitions/[id]`

#### Krok implementacji
1.  Stworzyć `app/api/competitions/[id]/route.ts`.
2.  Sprawdzić czy podane ID jest poprawnym UUID.
3.  Wykonać `select('*').eq('id', id).single()`.
4.  Jeśli brak wyników -> **404 Not Found**.

### 2.4 PATCH /competitions/[id]
**Cel**: Aktualizacja statusu lub danych zawodów.

#### Szczegóły żądania
*   **Metoda**: `PATCH`
*   **Body**: `Partial<Competition>`

#### Logika Biznesowa (Status Flow)
*   Przejście `PLANNED` -> `IN_PROGRESS` (Rozpoczęcie): Zablokuj edycję listy uczestników (opcjonalnie).
*   Przejście `IN_PROGRESS` -> `FINISHED` (Koniec): Zablokuj dodawanie połowów.

#### Krok implementacji
1.  W `app/api/competitions/[id]/route.ts` (PATCH).
2.  Pobrać aktualny stan zawodów.
3.  Zwalidować czy przejście statusu jest dozwolone.
4.  Wykonać `update(body).eq('id', id)`.

---

## 3. Categories (Kategorie)

### 3.1 GET /competitions/[id]/categories
**Cel**: Lista kategorii dla danych zawodów.

### 3.2 POST /competitions/[id]/categories
**Cel**: Dodanie nowej kategorii.

#### Szczegóły żądania
*   **Body**: `{ "name": "Junior" }`
*   **Walidacja**: Unikalność nazwy w ramach zawodów (może być obsłużone constraintem DB `UNIQUE(competition_id, name)`).

#### Krok implementacji
1.  `app/api/competitions/[id]/categories/route.ts`.
2.  Insert do tabeli `categories`.

---

## 4. Participants (Uczestnicy)

### 4.1 GET /competitions/[id]/participants
**Cel**: Pobranie listy uczestników.

#### Szczegóły żądania
*   **Sortowanie**: Domyślnie po nazwisku, opcjonalnie po numerze stanowiska.

#### Response
*   Zawiera pole `category` (join).

#### Krok implementacji
1.  `app/api/competitions/[id]/participants/route.ts`.
2.  `select('*, category:categories(name)')`.

### 4.2 POST /competitions/[id]/participants
**Cel**: Dodanie jednego uczestnika.

#### Body
```typescript
{
  first_name: string,
  last_name: string,
  category_id?: string
}
```

### 4.3 POST /competitions/[id]/participants/batch
**Cel**: Masowy import uczestników (US 2.1).

#### Szczegóły żądania
*   **URL**: `/api/competitions/[id]/participants/batch`
*   **Body**: `{ "participants": [{ "first_name": "...", "last_name": "..." }, ...] }`
*   **Limit**: Max 100 rekordów na request.

#### Krok implementacji
1.  `app/api/competitions/[id]/participants/batch/route.ts`.
2.  Przygotować tablicę obiektów do insertu.
3.  Użyć `supabase.from('participants').insert([...])`.
4.  Obsługa błędów (częściowy sukces vs transakcja). Supabase API domyślnie jest atomowe dla pojedynczego requestu insert.

### 4.4 PATCH /participants/[id]
**Cel**: Edycja uczestnika (przypisanie stanowiska, zmiana obecności, DSQ).

#### Logika
*   Jeśli `peg_number` jest ustawiany -> sprawdzić unikalność w ramach `competition_id`. (Constraint DB `unique_peg_per_competition` powinien to złapać, API musi obsłużyć błąd Postgresa `23505`).
*   Jeśli `is_present` jest `false` -> `peg_number` musi być `NULL`.

#### Krok implementacji
1.  `app/api/participants/[id]/route.ts`. (Zwróć uwagę, że ścieżka jest poza /competitions, co jest OK, bo ID uczestnika jest unikalne).

---

## 5. Catches (Połowy)

### 5.1 GET /competitions/[id]/catches
**Cel**: Pobranie dziennika połowów.

### 5.2 POST /catches
**Cel**: Dodanie połowu.

#### Szczegóły żądania
*   **Body**:
    ```typescript
    {
      competition_id: string, // dla ułatwienia RLS
      participant_id: string,
      weight: number,
      species?: string,
      is_big_fish?: boolean
    }
    ```

#### Walidacja
*   `weight` > 0.
*   `competition_id` musi pasować do `competition_id` uczestnika.
*   Status zawodów != `FINISHED`.

#### Krok implementacji
1.  `app/api/catches/route.ts`.
2.  Sprawdzić status zawodów (dodatkowe zapytanie lub funkcja DB).
3.  Wykonać insert.

### 5.3 PATCH /catches/[id]
**Cel**: Korekta błędnego wpisu.

---

## 6. Leaderboard (Ranking)

### 6.1 GET /competitions/[id]/leaderboard
**Cel**: Obliczenie i zwrócenie rankingu. To jest endpoint "Read-Heavy", zawierający główną logikę biznesową.

#### Szczegóły odpowiedzi
```json
{
  "competition_id": "...",
  "rankings": [
    {
       "rank": 1,
       "participant": { "id": "...", "name": "Jan K." },
       "total_weight": 12.500,
       "points": 1,
       "catches_count": 5
    }
  ],
  "big_fish": { ... }
}
```

#### Logika (Algorytm)
1.  Pobierz wszystkich uczestników (`is_disqualified = false`) i ich połowy.
2.  Zgrupuj połowy po `participant_id`.
3.  Zsumuj wagi (`total_weight`).
4.  Posortuj malejąco po `total_weight`.
5.  **Obsługa Ex aequo**:
    *   Iteruj po posortowanej liście.
    *   Jeśli waga obecnego == waga poprzedniego -> ten sam `rank`.
    *   W przeciwnym wypadku -> `rank` = bieżący indeks + 1.
6.  Zwróć JSON.

#### Wydajność
*   Dla małej skali (50 uczestników) obliczenia po stronie API (Node.js) są wystarczające i szybkie.
*   W przyszłości: Przenieść do SQL View lub Materialized View.

#### Krok implementacji
1.  `app/api/competitions/[id]/leaderboard/route.ts`.
2.  Pobierz dane relacyjne: `competitions -> participants -> catches`.
3.  Zaimplementuj funkcję pomocniczą `calculateRanking(participants)`.
4.  Zwróć wynik.

---

## 7. Względy bezpieczeństwa (Podsumowanie)

1.  **Authentication**: Każdy endpoint (poza publicznym Leaderboard) wymaga nagłówka `Authorization: Bearer <token>`.
2.  **Authorization**: Sprawdzenie czy `competition.owner_id == auth.user.id`. Najlepiej zaimplementować to przez RLS w bazie, wtedy API po prostu dostanie pusty wynik lub błąd przy próbie dostępu do cudzych danych.
3.  **Input Sanitation**: Zod odrzuca nadmiarowe pola i sprawdza typy, zapobiegając SQL Injection (choć Supabase Client też to robi).

## 8. Etapy Wdrożenia (Plan działania)

1.  **Baza Danych**: Upewnić się, że schemat i RLS są wdrożone (zgodnie z `db-plan.md`).
2.  **Typy**: Wygenerować typy TypeScript z bazy (`supabase gen types`).
3.  **Service Layer**: Stworzyć `services/competitions.ts`, `services/participants.ts` etc. z funkcjami wrapperami na Supabase Client.
4.  **API Routes**: Implementować endpointy po kolei:
    *   Krok 1: CRUD Competitions.
    *   Krok 2: Participants (Basic).
    *   Krok 3: Catches Logic.
    *   Krok 4: Leaderboard logic.
5.  **Testy**: Manualne testy CURL / Postman dla każdego endpointu.
