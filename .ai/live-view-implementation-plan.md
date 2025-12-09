# Plan implementacji widoku Live (Public Results)

## 1. Przegląd
Widok publiczny dostępny dla każdego (bez logowania) pod unikalnym linkiem. Służy do śledzenia wyników zawodów na żywo. Musi być czytelny na mobile i automatycznie odświeżać dane.

## 2. Routing widoku
*   `/live/[id]` - Główny widok wyników dla zawodów o danym ID.

## 3. Struktura komponentów
```mermaid
graph TD
    LivePage --> LiveHeader (Nazwa, Status, RefreshIndicator)
    LivePage --> CategoryTabs (Przełączanie kategorii)
    CategoryTabs --> LiveLeaderboardTable
    LivePage --> BigFishWidget (Osobna sekcja/karta)
```

## 4. Szczegóły komponentów

### LiveHeader
- **Opis:** Nagłówek z nazwą zawodów i informacją o statusie (W toku / Zakończone).
- **Elementy:** Tytuł (H1), Badge statusu.

### LiveLeaderboardTable
- **Opis:** Tabela wyników dla wybranej kategorii.
- **Kolumny:** Lp., Zawodnik (Zanonimizowany, np. "Jan K."), Stanowisko, Waga (Razem), Punkty.
- **Cechy:** Podświetlenie TOP 3.

### BigFishWidget
- **Opis:** Komponent wyróżniający największą rybę zawodów.
- **Dane:** Waga, Gatunek, Imię zawodnika.

## 5. Typy
```typescript
interface LeaderboardEntry {
  rank: number;
  participant_name: string; // "Jan K."
  peg_number: number;
  total_weight: number;
  points: number;
}
```

## 6. Zarządzanie stanem
- **Dane:** `useQuery` pobierający dane z `/api/competitions/[id]/leaderboard`.
- **Realtime:**
    - Opcja A (Prostsza): `refetchInterval` co 30-60 sekund.
    - Opcja B (Better UX): Subskrypcja Supabase Realtime na tabelę `catches` -> inwalidacja query. W MVP Opcja A jest wystarczająca i bezpieczniejsza dla limitów bazy.

## 7. Integracja API
- `GET /api/competitions/[id]/leaderboard` (Publiczny endpoint).
- Endpoint musi zwracać dane już posortowane i zanonimizowane.

## 8. Interakcje użytkownika
- Zmiana zakładki (Kategorii).
- Pull-to-refresh (opcjonalnie, jeśli auto-refresh nie zadziała).

## 9. Warunki i walidacja
- Jeśli zawody są w statusie `PLANNED`, wyświetlić komunikat "Zawody jeszcze się nie rozpoczęły".

## 10. Obsługa błędów
- 404 Not Found: "Zawody nie istnieją".
- Error state: "Błąd pobierania wyników".

## 11. Kroki implementacji
1.  API Endpoint: Upewnić się, że endpoint `/leaderboard` działa dla anonimów i anonimizuje nazwiska.
2.  Komponent Tabeli: Stylowanie tabeli responsywnej.
3.  Podpięcie danych: React Query z `refetchInterval`.
