# Architektura UI dla Fishing Competition Manager (MVP)

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika została zaprojektowana zgodnie z podejściem **Mobile-First** oraz **Offline-First**, aby wspierać pracę sędziów w trudnych warunkach terenowych.

Główna koncepcja opiera się na dwóch oddzielnych kontekstach routingu:
1.  **Globalny Dashboard (`/dashboard`)**: Zarządzanie listą zawodów i kontem użytkownika.
2.  **Kontekst Zawodów (`/competitions/[id]/*`)**: W pełni immersyjny tryb pracy nad konkretnymi zawodami z nawigacją dolną (Bottom Bar), zoptymalizowany pod obsługę kciukiem.

Technologia opiera się na **Next.js 16 (App Router)**, **Tailwind CSS 4**, komponentach **shadcn/ui** oraz **TanStack Query** (z IndexedDB) do zarządzania stanem offline.

---

## 2. Lista widoków

### 2.1. Strefa Publiczna i Autoryzacja

#### A. Logowanie / Rejestracja
*   **Ścieżka:** `/auth/login`, `/auth/register`
*   **Cel:** Uwierzytelnienie organizatora lub sędziego.
*   **Kluczowe informacje:** Formularz E-mail/Hasło.
*   **Kluczowe komponenty:** `Form` (React Hook Form), `Input`, `Button` (z loading state).
*   **UX/Bezpieczeństwo:** Walidacja inline (Zod). Po zalogowaniu token zapisywany w bezpiecznym storage. Dostępny link "Zapomniałem hasła".

#### B. Live View (Widok Kibica)
*   **Ścieżka:** `/live/[id]`
*   **Cel:** Podgląd wyników online dla publiczności (Read-only).
*   **Kluczowe informacje:** Nazwa zawodów, Tabela wyników per kategoria, wyróżnienie "Big Fish".
*   **Kluczowe komponenty:** `Tabs` (przewijalne poziomo kategorie), `Table` (ranking), `Badge` (status).
*   **UX/Dostępność:** Automatyczne odświeżanie (Supabase Realtime). Ekran "Brak połączenia" w przypadku utraty sieci (nie korzysta z cache sędziego).

---

### 2.2. Strefa Organizatora (Dashboard)

#### C. Dashboard Główny
*   **Ścieżka:** `/dashboard`
*   **Cel:** Lista wszystkich zawodów organizatora i tworzenie nowych.
*   **Kluczowe informacje:** Lista kart zawodów (Nazwa, Data, Status, Liczba uczestników). Stan synchronizacji.
*   **Kluczowe komponenty:** `Card` (zawody), `Button` (Floating Action Button lub duży przycisk na górze "Utwórz"), `Avatar` (Menu profilu).
*   **UX/Bezpieczeństwo:** Pełne nazwy zawodów (wielowierszowe). Wskaźnik "Offline/Online" w nagłówku.

#### D. Kreator Zawodów
*   **Ścieżka:** `/competitions/new` (lub Modal na `/dashboard`)
*   **Cel:** Definicja parametrów nowych zawodów.
*   **Kluczowe informacje:** Nazwa, Data, Liczba stanowisk, Definicja kategorii (tagi).
*   **Kluczowe komponenty:** `Form`, `Calendar` (DatePicker w Popover), `InputTags` (custom component dla kategorii).
*   **UX:** Walidacja `onBlur`.

---

### 2.3. Kontekst Zawodów (Sędziowanie)
*Wspólny Layout: Nagłówek ze wskaźnikiem synchronizacji + Dolny pasek nawigacji.*

#### E. Lista Uczestników / Losowanie (Tab 1)
*   **Ścieżka:** `/competitions/[id]/participants`
*   **Cel:** Rejestracja obecności, import listy i losowanie stanowisk.
*   **Kluczowe informacje:** Lista zawodników z podziałem na kategorie, Status obecności, Nr stanowiska.
*   **Kluczowe komponenty:** `VirtualList` (TanStack Virtual), `Checkbox` (obecność), `Button` ("Losuj stanowiska"), `Textarea` (Import masowy w Drawerze).
*   **UX:** Sticky Headers dla sekcji kategorii. Przycisk "Losuj" otwiera Modal ostrzegawczy (zmiana statusu na "W toku"). Sortowanie: Nazwisko (przed losowaniem) -> Stanowisko (po losowaniu).

#### F. Lista Ważenia (Tab 2)
*   **Ścieżka:** `/competitions/[id]/weighing`
*   **Cel:** Wybór zawodnika do wprowadzenia wyniku.
*   **Kluczowe informacje:** Wyszukiwarka, Lista zawodników ze statusem (Suma wagi, Ilość ryb).
*   **Kluczowe komponenty:** `Input` (Search - szukanie po nr lub nazwisku), `ListItem` z Badgem kategorii.
*   **UX:** Klawiatura numeryczna priorytetyzowana w wyszukiwarce (szybkie wybieranie po nr stanowiska).

#### G. Karta Zawodnika & Ważenie (Szczegóły)
*   **Ścieżka:** `/competitions/[id]/weighing/[participantId]`
*   **Cel:** Wprowadzenie wyniku połowu i podgląd historii.
*   **Kluczowe informacje:** Nazwisko, Nr stanowiska, Formularz dodawania (Szybki/Pełny), Historia ważeń.
*   **Kluczowe komponenty:** 
    *   *Nawigacja:* `Button` ("Poprzedni", "Następny" stanowisko).
    *   *Formularz:* `Input` (Waga - type="decimal", autofocus), `Combobox` (Gatunek - opcjonalnie), `Checkbox` (Big Fish - tylko w trybie pełnym).
    *   *Historia:* Lista z menu kontekstowym (`DropdownMenu`) do edycji/usuwania.
*   **UX/Bezpieczeństwo:** Haptic feedback przy zapisie. Modal przy próbie wyjścia bez zapisu.

#### H. Wyniki / Ustawienia (Tab 3)
*   **Ścieżka:** `/competitions/[id]/results`
*   **Cel:** Podgląd rankingu, zamknięcie zawodów, eksport.
*   **Kluczowe informacje:** Tabela wyników, Przycisk "Zakończ zawody", Przycisk "Pobierz PDF".
*   **Kluczowe komponenty:** `Table` (wirtualizowana), `AlertDialog` (Potwierdzenie zakończenia). Sekcja "Ustawienia" dostępna jako podstrona lub dolna sekcja tego widoku (edycja, usuwanie zawodów).
*   **UX:** PDF generowany kliencko (`@react-pdf/renderer`).

---

## 3. Mapa podróży użytkownika (User Journey)

### Scenariusz Główny: Sędziowanie Zawodów

1.  **Start:** Sędzia loguje się (dane offline zapisane) i wybiera zawody ze statusu "Planowane" na Dashboardzie.
2.  **Odprawa:**
    *   Przechodzi do zakładki **Uczestnicy**.
    *   Używa "Import Masowy" wklejając listę z notatnika.
    *   Odznacza obecnych (Checkbox).
    *   Klika "Losuj stanowiska". -> **System:** Losuje numery, zmienia status na "W toku", blokuje edycję listy, sortuje listę po numerach stanowisk.
3.  **Ważenie:**
    *   Sędzia przechodzi do zakładki **Ważenie**.
    *   Podchodzi do stanowiska nr 1. Wpisuje "1" w wyszukiwarkę -> Wybiera zawodnika.
    *   **Ekran Ważenia:**
        *   Kursor automatycznie w polu wagi.
        *   Wpisuje "2.540".
        *   Klika "Zapisz" (Enter). -> **System:** Wibracja, Toast "Zapisano", dodanie do historii lokalnej + sync w tle.
    *   Sędzia klika "Następny" -> System przenosi do zawodnika ze stanowiska nr 2.
4.  **Korekta:**
    *   Sędzia zauważa błąd u zawodnika nr 2.
    *   Na liście historii klika "..." -> "Usuń".
    *   Potwierdza w Modalu.
5.  **Finał:**
    *   Po zważeniu wszystkich, przechodzi do zakładki **Wyniki**.
    *   Sprawdza ranking.
    *   Klika "Zakończ zawody".
    *   Klika "Pobierz PDF" i przesyła go na grupę WhatsApp koła.

---

## 4. Układ i struktura nawigacji

### 4.1. Layout Globalny (App Shell)
*   **Providers:** `QueryClientProvider` (TanStack Query), `AuthProvider` (Supabase), `ToastProvider` (Sonner - pozycjonowany `top-center`).
*   **Offline Indicator:** Subtelny pasek lub ikona w nagłówku informująca o stanie synchronizacji (Zielony/Żółty/Czerwony).

### 4.2. Nawigacja Wewnętrzna (Kontekst Zawodów)
Wykorzystuje **Bottom Navigation Bar** przypięty do dołu ekranu (`fixed bottom-0`).

| Ikona (Lucide) | Etykieta | Trasa | Uwagi |
|:---|:---|:---|:---|
| `Users` | Uczestnicy | `/competitions/[id]/participants` | Widok domyślny dla "Planowane". |
| `Scale` | Ważenie | `/competitions/[id]/weighing` | Widok domyślny dla "W toku". Aktywny badge z liczbą oczekujących sync? |
| `Trophy` | Wyniki | `/competitions/[id]/results` | Zawiera też sekcję ustawień/zamykania. |

*Nawigacja wewnątrz karty zawodnika (Ekran G)*:
Używa schematu "Stack Navigation" – posiada przycisk "Wstecz" w nagłówku (powrót do listy) oraz przyciski "Poprzedni/Następny" (nawigacja boczna po liście).

---

## 5. Kluczowe komponenty

1.  **`OfflineWrapper`**: Komponent HOC (Higher Order Component) lub Hook, który zarządza odczytem z IndexedDB gdy brak sieci i kolejkowaniem mutacji (`useMutation` z `retry` i persist).
2.  **`VirtualParticipantList`**: Wysoce wydajna lista oparta o `TanStack Virtual`. Obsługuje:
    *   Renderowanie tylko widocznych elementów.
    *   Sticky Headers dla sekcji kategorii (używając `sticky` CSS na elementach grupujących).
    *   Różne tryby wyświetlania wiersza (Tryb obecności vs Tryb ważenia).
3.  **`WeighInForm`**: Formularz zoptymalizowany pod "Speed Input".
    *   `inputMode="decimal"`.
    *   Obsługa przecinka jako separatora (auto-replace na kropkę).
    *   Blokada "Double Submit".
4.  **`SyncIndicator`**: Wizualny komponent stanu danych.
    *   Ikona chmury z animacją (Pending) / Przekreślona (Offline) / "Check" (Synced).
5.  **`ResultPDF`**: Komponent React (`@react-pdf/renderer`), który nie renderuje się do DOM, ale generuje Blob do pobrania. Zawiera logikę dodawania stopki "Offline generation warning".
6.  **`ActionsMenu`**: Reużywalny komponent `DropdownMenu` (trzy kropki) dla operacji na wierszach (Edytuj, Usuń, DSQ).
