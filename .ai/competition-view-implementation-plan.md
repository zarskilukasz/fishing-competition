# Plan implementacji widoku Kontekstu Zawodów (Szczegóły)

## 1. Przegląd
Jest to główny obszar roboczy Sędziego. Zawiera trzy główne moduły przełączane dolnym paskiem nawigacji: Lista Uczestników (Odprawa), Ważenie (Sędziowanie) oraz Wyniki (Podgląd).

## 2. Routing widoku
*   `/competitions/[id]` - Layout (z dolnym paskiem).
*   `/competitions/[id]/participants` - Tab 1: Uczestnicy.
*   `/competitions/[id]/weighing` - Tab 2: Ważenie (Lista).
*   `/competitions/[id]/weighing/[participantId]` - Szczegóły ważenia zawodnika.
*   `/competitions/[id]/results` - Tab 3: Wyniki i Zamykanie.

## 3. Struktura komponentów
```mermaid
graph TD
    CompetitionLayout --> TopBar (SyncIndicator, BackButton)
    CompetitionLayout --> ContentArea
    CompetitionLayout --> BottomNav
    
    ContentArea --> ParticipantsView
    ParticipantsView --> ImportDrawer
    ParticipantsView --> VirtualParticipantList
    
    ContentArea --> WeighingListView
    WeighingListView --> ParticipantSearch
    WeighingListView --> WeighingList
    
    ContentArea --> WeighingDetailView
    WeighingDetailView --> WeighInForm
    WeighingDetailView --> CatchHistoryList
```

## 4. Szczegóły komponentów

### CompetitionLayout & BottomNav
- **Opis:** App Shell dla kontekstu zawodów.
- **BottomNav:** Sticky footer z linkami do podstron. Używa ikon (Users, Scale, Trophy). Aktywny stan na podstawie `usePathname`.

### VirtualParticipantList
- **Opis:** Lista uczestników zoptymalizowana wirtualizacją (`@tanstack/react-virtual`).
- **Funkcje:**
    - Wyświetlanie uczestników zgrupowanych po kategoriach (Sticky Headers).
    - Checkbox obecności (tylko w statusie PLANNED).
    - Wyświetlanie wylosowanego stanowiska.
- **Interakcje:** Kliknięcie wiersza w trybie PLANNED otwiera edycję.

### ImportDrawer
- **Opis:** Szuflada do masowego importu.
- **Elementy:** Textarea. Przycisk "Importuj". Logika parsowania tekstu po nowych liniach.

### WeighingListView
- **Opis:** Lista do wyboru zawodnika do ważenia.
- **Elementy:** Wyszukiwarka (Input). Lista kart zawodników z podsumowaniem (Suma wagi, Ilość ryb).
- **Sortowanie:** Po nr stanowiska.

### WeighInForm
- **Opis:** Formularz dodawania wyniku.
- **Pola:** Waga (Decimal), Gatunek (Select - opcja), Big Fish (Checkbox).
- **Input Mode:** `decimal` dla mobile.

### SyncIndicator
- **Opis:** Ikona w TopBar.
- **Stany:**
    - Online (Zielona kropka / Cloud).
    - Syncing (Spinner / Żółta).
    - Offline (Przekreślona chmura / Czerwona).

## 5. Typy
(Zgodne z `database.types.ts`, rozszerzone o lokalne stany UI np. `isSyncing`).

## 6. Zarządzanie stanem

### Offline-First Logic
To jest najbardziej krytyczna część.
- **Odczyt:** Dane muszą być ładowane z lokalnego cache (TanStack Query `networkMode: 'offlineFirst'`).
- **Zapis (Mutacje):**
    - Użycie `useMutation` z `onMutate` (Optimistic Updates).
    - Jeśli brak sieci -> TanStack Query automatycznie kolejkuje (przy odpowiedniej konfiguracji `mutationCache` i persistera).
    - *Alternatywa (Prostsza w MVP):* Jeśli brak sieci, zapisz w `localStorage` w kolejce "pending_catches" i spróbuj wysłać gdy `online`.

### State Hooki
- `useCompetition(id)`
- `useParticipants(id)`
- `useCatches(id)`
- `useNetworkStatus()`

## 7. Integracja API
- Endpointy CRUD dla Participants i Catches.
- Specjalny endpoint `POST /api/competitions/[id]/draw` do losowania stanowisk.

## 8. Interakcje użytkownika
- **Szybkie ważenie:** Wybór z listy -> Wpisanie wagi -> Enter -> Toast -> Powrót do listy (lub następny).

## 9. Warunki i walidacja
- Blokada edycji obecności po rozpoczęciu zawodów.
- Blokada dodawania wagi po zakończeniu.
- Losowanie możliwe tylko gdy wszyscy obecni mają odznaczoną obecność (lub warning).

## 10. Obsługa błędów
- Konflikty synchronizacji: W MVP strategia "Last Write Wins" lub "Addtive" (dla wag - dodajemy rekordy, nie nadpisujemy, więc konflikty są rzadsze).

## 11. Kroki implementacji
1.  **Layout:** Stworzenie `CompetitionLayout` z nawigacją.
2.  **Lista Uczestników:** Implementacja wirtualizacji i importu.
3.  **Logika Losowania:** Podpięcie endpointu losowania.
4.  **Ważenie:** Implementacja formularza z walidacją i optymistycznym update.
5.  **Offline:** Konfiguracja `TanStack Query Persist` (np. z `idb-keyval`).
