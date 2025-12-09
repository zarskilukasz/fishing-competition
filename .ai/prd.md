# Product Requirements Document (PRD)

**Nazwa Projektu:** Zarządzanie Zawodami Wędkarskimi (Fishing Competition Manager)  
**Wersja:** 1.0 (MVP)  
**Status:** Draft / Do akceptacji  
**Data:** 09.12.2025  
**Autor:** Senior Product Manager  

---

## 1. Wstęp i Cele

### 1.1. Kontekst
Organizatorzy zawodów wędkarskich, często działający w trudnych warunkach terenowych (brak zasięgu, pośpiech, zmienna pogoda), tracą dużo czasu na manualne procesy: papierowe listy obecności, ręczne losowanie stanowisk i sumowanie wyników w arkuszach kalkulacyjnych. Prowadzi to do opóźnień, pomyłek w obliczeniach i frustracji uczestników.

### 1.2. Wizja Produktu
Stworzenie aplikacji typu PWA (Progressive Web App), która działa jako cyfrowy asystent sędziego. Aplikacja automatyzuje kluczowe etapy zawodów (losowanie, ważenie, rankingi) i jest niezawodna w miejscach bez dostępu do Internetu (Offline-first), synchronizując dane po powrocie do cywilizacji.

### 1.3. Cele Biznesowe
1.  **Redukcja czasu obsługi:** Skrócenie czasu od zakończenia łowienia do ogłoszenia wyników o min. 50%.
2.  **Eliminacja błędów:** Automatyzacja obliczeń sumy wag i sortowania rankingów.
3.  **Dostępność:** Umożliwienie pracy sędziom w strefach "dead-zone" (brak GSM).

---

## 2. User Stories (Epiki)

### Epic 0: Autentykacja i Konta
* **US 0.1:** Jako nowy Organizator chcę założyć konto podając e-mail i hasło, aby rozpocząć korzystanie z aplikacji.
* **US 0.2:** Jako Organizator chcę zalogować się na swoje konto, aby mieć dostęp do swoich zawodów.
* **US 0.3:** Jako Sędzia pomocniczy chcę zalogować się na to samo konto co Organizator na moim telefonie, abyśmy mogli sędziować te same zawody równolegle.
* **US 0.4:** Jako Organizator, który zapomniał hasła, chcę otrzymać link do jego resetu na e-mail, aby odzyskać dostęp do konta.
* **US 0.5:** Jako Użytkownik chcę pozostać zalogowany nawet po utracie zasięgu internetowego, aby móc pracować w trybie offline.

### Epic 1: Konfiguracja Zawodów
* **US 1.1:** Jako Organizator chcę utworzyć nowe zawody podając nazwę, datę i liczbę stanowisk, aby rozpocząć przygotowania.
* **US 1.2:** Jako Organizator chcę zdefiniować kategorie (np. Junior, Senior), aby system mógł generować osobne rankingi.

### Epic 2: Zarządzanie Uczestnikami i Odprawa
* **US 2.1:** Jako Organizator chcę szybko wkleić listę uczestników z notatnika, aby nie tracić czasu na wpisywanie pojedynczych nazwisk.
* **US 2.2:** Jako Sędzia chcę zaznaczyć obecność zawodników na zbiórce, aby dopuścić do losowania tylko osoby fizycznie obecne.
* **US 2.3:** Jako Sędzia chcę automatycznie wylosować stanowiska dla obecnych, z walidacją liczby miejsc, aby proces był uczciwy i szybki.

### Epic 3: Sędziowanie (Ważenie)
* **US 3.1:** Jako Sędzia chcę mieć możliwość pracy w trybie offline, aby ważyć ryby bezpośrednio na stanowisku nad wodą.
* **US 3.2:** Jako Sędzia chcę wprowadzić wynik jako samą wagę lub szczegółowo (gatunek + waga), aby obsłużyć różne formaty zawodów i ranking "Big Fish".
* **US 3.3:** Jako Sędzia chcę oznaczyć zawodnika jako DSQ lub wpisać 0.00 kg, aby poprawnie odwzorować sytuacje regulaminowe.

### Epic 4: Wyniki i Dystrybucja
* **US 4.1:** Jako Uczestnik/Kibic chcę widzieć wyniki na żywo przez link, z poszanowaniem RODO (zanonimizowane nazwiska), aby śledzić rywalizację.
* **US 4.2:** Jako Organizator chcę wygenerować czytelny PDF z wynikami (z podziałem na kategorie), aby go wydrukować lub przesłać uczestnikom.

---

## 3. Wymagania Funkcjonalne

### 3.1. Moduł Autentykacji
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-001** | Rejestracja | Prosty formularz: E-mail, Hasło (min. 8 znaków), Powtórz hasło. Walidacja formatu e-mail. Unikalność adresu e-mail w bazie. | P1 |
| **F-002** | Logowanie | Logowanie przy użyciu E-mail i Hasła. Wymaga połączenia z Internetem (tylko przy pierwszym logowaniu). | P1 |
| **F-003** | Reset hasła | Standardowa procedura: Wpisz e-mail -> Wyślij link resetujący -> Formularz nowego hasła. | P2 |
| **F-004** | Trwałość sesji (Offline auth) | Token autentykacyjny (np. JWT) musi być przechowywany lokalnie (Secure Storage). Aplikacja nie wylogowuje użytkownika przy braku sieci. Token powinien mieć długi czas życia (np. 30 dni). | P1 |
| **F-005** | Współdzielenie konta | System backendowy musi zezwalać na wiele aktywnych sesji (tokenów) dla jednego User ID (Główny sędzia + pomocnicy). | P1 |
| **F-006** | Wylogowanie | Przycisk w ustawieniach. Usuwa lokalny token i czyści dane wrażliwe z pamięci podręcznej. | P2 |

### 3.2. Moduł Zarządzania Zawodami
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-01** | Tworzenie zawodów | Formularz: Nazwa, Data, Liczba stanowisk (int). Walidacja: Liczba stanowisk > 0. | P1 |
| **F-02** | Definiowanie kategorii | Opcjonalne dodanie tagów kategorii (np. "Kobiety", "U-21"). Brak kategorii = kategoria "Open". | P2 |
| **F-03** | Statusy zawodów | Przepływ statusów: **Planowane** (edycja możliwa) -> **W toku** (rozpoczęte ważenie) -> **Zakończone** (blokada edycji, read-only). | P1 |
| **F-04** | Dashboard | Chronologiczna lista zawodów. Brak folderów. Kliknięcie przenosi do panelu zawodów. | P1 |

### 3.3. Moduł Uczestników
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-05** | Dodawanie uczestników | Dwie metody:<br>1. Formularz pojedynczy (Imię, Nazwisko, Wybór kategorii).<br>2. Import masowy ("Szybkie wklejanie"): parsuje tekst (każda linia to nowy uczestnik). | P1 |
| **F-06** | Edycja listy | Możliwość usuwania lub edycji danych uczestnika przed startem zawodów. | P2 |
| **F-07** | Anonimizacja Live | W widoku publicznym (F-15) system automatycznie konwertuje "Jan Kowalski" na "Jan K.". | P1 |

### 3.4. Moduł Przebiegu (Start)
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-08** | Lista obecności | Checkbox przy każdym nazwisku. Domyślnie odznaczone. Licznik obecnych na górze ekranu. | P1 |
| **F-09** | Silnik losowania | Losuje numery stanowisk (1 do N) dla zawodników ze statusem "Obecny".<br>Blokada losowania, jeśli: `Liczba Obecnych > Liczba Stanowisk`. | P1 |
| **F-10** | Korekta losowania | Możliwość ręcznej zmiany wylosowanego numeru przez Sędziego (np. w przypadku pomyłki lub zamiany miejsc). | P2 |

### 3.5. Moduł Sędziowania (Ważenie)
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-11** | Karta zawodnika | Wybór zawodnika z listy (wyszukiwarka po nazwisku/nr stanowiska). Widok historii ważeń. | P1 |
| **F-12** | Wprowadzanie wyników | Dwa przyciski akcji:<br>1. **"Dodaj wagę"**: Tylko pole numeryczne (kg).<br>2. **"Dodaj rybę"**: Pole numeryczne (kg) + Select (Gatunek) + Checkbox "Big Fish". | P1 |
| **F-13** | Obsługa DSQ / 0 | - Przycisk "0.00 kg" (zapisuje wynik zerowy, miejsce ex aequo ostatnie).<br>- Przycisk "DSQ" (wyklucza z rankingu, widoczny na liście jako zdyskwalifikowany). | P1 |
| **F-14** | Edycja wpisów | Możliwość usunięcia błędnego wpisu wagi lub jego edycji (wymaga potwierdzenia w UI). | P1 |

### 3.6. Moduł Wyników i Output
| ID | Funkcjonalność | Opis / Kryteria akceptacji | Priorytet |
|:---|:---|:---|:---|
| **F-15** | Live View (Public) | Dostęp przez unikalny URL. Dane pobierane z serwera (nie działa offline u kibica). Odświeżanie po synchronizacji sędziego. Podział na kategorie. | P1 |
| **F-16** | Algorytm rankingu | 1. Sortowanie: Waga malejąco.<br>2. Ex aequo: Jeśli waga identyczna, przyznawane to samo miejsce (np. 1, 1, 3...).<br>3. Generowanie osobnych tabel dla każdej zdefiniowanej kategorii (F-02). | P1 |
| **F-17** | Sekcja "Big Fish" | Osobna tabela lub wyróżniona sekcja wyświetlająca największą rybę (Waga + Gatunek + Imię zawodnika). | P2 |
| **F-18** | Eksport PDF | Generowanie pliku PDF po stronie klienta. Czysty layout. Zawiera: Nazwę zawodów, Datę, Tabele wyników wg kategorii, Big Fish. | P1 |

---

## 4. Wymagania Niefunkcjonalne

### 4.1. Offline-First & Synchronizacja
* **Architektura:** Aplikacja musi przechowywać pełny stan zawodów lokalnie (IndexedDB/LocalStorage).
* **Zachowanie:** Brak sieci nie blokuje żadnej funkcji sędziowskiej (F-08 do F-14).
* **Sync:** Po wykryciu sieci, aplikacja automatycznie wysyła zmiany na serwer.
* **Konflikty (Concurrency):** W przypadku edycji tych samych danych przez dwóch sędziów:
    * Rekordy dodawane (nowe ważenia) są sumowane (nie nadpisują się).
    * System musi identyfikować wpisy po unikalnym ID nadawanym w momencie utworzenia na urządzeniu (UUID).

### 4.2. UX & Design
* **Mobile-first:** Interfejs zoptymalizowany pod obsługę kciukiem na ekranie smartfona w orientacji pionowej.
* **Warunki zewnętrzne:** Wysoki kontrast (czytelność w pełnym słońcu). Duże przyciski (obsługa mokrymi/brudnymi rękami).
* **Wydajność:** Listy powyżej 50 zawodników muszą korzystać z wirtualizacji (lazy loading).

### 4.3. Bezpieczeństwo i Sesja
* **Long-lived Sessions:** Mechanizm "Refresh Token" działa w tle, gdy jest sieć. Brak możliwości odświeżenia tokena (brak sieci) nie może blokować UI przez minimum 24h.
* **Hasła:** Hashowane (np. bcrypt) po stronie serwera.

---

## 5. Wyłączenia (Out of Scope)
Następujące funkcjonalności **nie wchodzą** w zakres wersji MVP:
* Rejestracja i konta dla uczestników/wędkarzy.
* Płatności online i wpisowe.
* Historia globalna zawodnika (statystyki z wielu zawodów).
* Obsługa wielu sektorów/stref (MVP zakłada jedną strefę dla wszystkich).
* White-labeling (wgrywanie logo organizatora).

---

## 6. Kryteria Sukcesu (KPI)
1.  **Stabilność Offline:** 100% zawodów przeprowadzonych w testach kończy się poprawną synchronizacją danych bez utraty rekordów.
2.  **Czas procesowania:** Średni czas "odklikania" obecności i losowania dla 30 osób nie przekracza 3 minut.
3.  **Adopcja:** Użytkownik, który utworzył pierwsze zawody, utworzy kolejne w ciągu 30 dni (Retencja).

---

## 7. Wskazówki do Makiet (UX Guidelines)

### Ekran Startowy (Onboarding)
* Czysty ekran z jednym głównym przyciskiem CTA: **"Utwórz nowe zawody"**.
* Poniżej lista ostatnich zawodów (jeśli istnieją).

### Ekran Sędziowania (Kluczowy)
* **Góra ekranu:** Nazwisko zawodnika (Duża czcionka) + Nr stanowiska.
* **Środek:** Historia ważeń bieżących zawodów (lista).
* **Dół (Sticky footer):** Dwa duże przyciski obok siebie:
    * `[Dodaj Wagę]` (Szary/Niebieski)
    * `[Dodaj Rybę +]` (Zielony/Akcent) - otwiera modal ze szczegółami.

### Raport PDF
* Minimalistyczny styl czarno-biały (oszczędność tuszu).
* Nagłówek: Nazwa aplikacji (małe), Nazwa zawodów (duże).
* Tabele: Lp., Nazwisko Imię, Stanowisko, Waga Total, Punkty/Miejsce.