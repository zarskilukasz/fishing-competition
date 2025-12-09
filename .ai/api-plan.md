# REST API Plan

## 1. Resources

| Resource | Related Table | Description |
|---|---|---|
| **Competitions** | `competitions` | Guidelines the main event entity including dates, status, and settings. |
| **Categories** | `categories` | Sub-groups within a competition (e.g., "Junior", "Senior"). |
| **Participants** | `participants` | Anglers registered for a competition. |
| **Catches** | `catches` | Individual weight measurements or specific fish entries. |
| **Leaderboard** | N/A (Derived) | Calculated rankings and statistics (Read-only). |

## 2. Endpoints

### 2.1 Competitions

#### `GET /competitions`
*   **Description:** List all competitions. Supports filtering by status.
*   **Query Params:**
    *   `status` (optional): `PLANNED`, `IN_PROGRESS`, `FINISHED`
    *   `limit`, `offset`: Pagination
*   **Response:** `200 OK`
    ```json
    [
      {
        "id": "uuid",
        "name": "Spring Cup 2025",
        "date": "2025-05-20",
        "pegs_count": 50,
        "status": "PLANNED",
        "owner_id": "uuid"
      }
    ]
    ```

#### `POST /competitions`
*   **Description:** Create a new competition.
*   **Request:**
    ```json
    {
      "name": "Spring Cup 2025",
      "date": "2025-05-20",
      "pegs_count": 50
    }
    ```
*   **Response:** `201 Created` (Returns created object)
*   **Validation:** `pegs_count > 0`, `date` must be valid ISO date.

#### `GET /competitions/{id}`
*   **Description:** Get details of a specific competition.
*   **Response:** `200 OK`

#### `PATCH /competitions/{id}`
*   **Description:** Update competition details or status.
*   **Request:** `{"status": "IN_PROGRESS"}`
*   **Response:** `200 OK`
*   **Logic:** Status transition validation (PLANNED -> IN_PROGRESS -> FINISHED).

### 2.2 Categories

#### `GET /competitions/{id}/categories`
*   **Description:** List categories for a competition.
*   **Response:** `200 OK`
    ```json
    [{ "id": "uuid", "name": "Seniors" }]
    ```

#### `POST /competitions/{id}/categories`
*   **Description:** Create a category.
*   **Request:** `{"name": "Juniors"}`
*   **Response:** `201 Created`

### 2.3 Participants

#### `GET /competitions/{id}/participants`
*   **Description:** List participants for a competition.
*   **Query Params:**
    *   `category_id` (optional)
    *   `sort`: `peg_number` | `name`
*   **Response:** `200 OK`
    ```json
    [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "category_id": "uuid",
        "peg_number": 12,
        "is_disqualified": false,
        "is_present": true 
      }
    ]
    ```
    *(Note: `is_present` is required by PRD F-08 but missing in initial schema, presumed handling via app logic or future migration).*

#### `POST /competitions/{id}/participants`
*   **Description:** Add a single participant.
*   **Request:**
    ```json
    {
      "first_name": "John",
      "last_name": "Doe",
      "category_id": "uuid" (optional)
    }
    ```
*   **Response:** `201 Created`

#### `POST /competitions/{id}/participants/batch`
*   **Description:** Bulk import participants (PRD F-05).
*   **Request:**
    ```json
    {
      "participants": [
        { "first_name": "John", "last_name": "Doe" },
        { "first_name": "Alice", "last_name": "Smith" }
      ]
    }
    ```
*   **Response:** `201 Created` (Count of added records)

#### `PATCH /participants/{id}`
*   **Description:** Update participant (e.g., assign peg, mark DSQ, mark present).
*   **Request:** `{"peg_number": 5}` or `{"is_disqualified": true}`
*   **Response:** `200 OK`
*   **Validation:** Unique `peg_number` in scope of competition.

### 2.4 Catches

#### `GET /competitions/{id}/catches`
*   **Description:** List all catches for a competition.
*   **Response:** `200 OK`

#### `POST /catches`
*   **Description:** Record a catch.
*   **Request:**
    ```json
    {
      "competition_id": "uuid",
      "participant_id": "uuid",
      "weight": 12.500,
      "species": "Carp",
      "is_big_fish": true
    }
    ```
*   **Response:** `201 Created`
*   **Validation:** `weight >= 0`.

#### `PATCH /catches/{id}`
*   **Description:** Update a catch record (correction).
*   **Request:** `{"weight": 10.5}`
*   **Response:** `200 OK`

### 2.5 Leaderboard (Business Logic)

#### `GET /competitions/{id}/leaderboard`
*   **Description:** distinct endpoint to fetch calculated results (PRD F-15, F-16).
*   **Query Params:**
    *   `category_id` (optional): Filter to specific category ranking.
    *   `format`: `json` (default) | `pdf` (if server-generated, though PRD says client-side).
*   **Response:** `200 OK`
    ```json
    {
      "competition_id": "uuid",
      "rankings": [
        {
          "rank": 1,
          "participant_name": "John Doe", 
          "peg_number": 5,
          "total_weight": 25.400,
          "points": 1,
          "big_fish": 12.500
        }
      ]
    }
    ```
*   **Logic:** Aggregates `catches` by `participant_id`, sorts by `total_weight` desc. Handles tie-breaking logic (ex aequo).

## 3. Authentication and Authorization

### Mechanism
*   **Protocol:** Bearer Token (JWT) via Supabase Auth.
*   **Offline Access:** Long-lived tokens (refresh tokens) stored in secure local storage.

### Authorization Scopes
*   **Organizer (Owner):**
    *   Full `CRUD` on resources where `owner_id = auth.uid()`.
    *   Can perform `POST /draw`, `POST /participants/batch`.
*   **Judge (Assistant):**
    *   Ideally shares `Organizer` permissions or uses Shared Account (PRD F-005).
    *   Access to `POST /catches` and `PATCH /participants`.
*   **Public (Anonymous):**
    *   `READ ONLY` access to `GET /competitions/{id}/leaderboard`.
    *   `READ ONLY` access to `GET /competitions/{id}` (if public).
    *   Restricted from `participants` details unless anonymized (PRD F-07: "Jan K.").

## 4. Validation and Business Logic

### Validation Rules
1.  **Competition:**
    *   `pegs_count`: Must be positive integer.
    *   `status`: Transitions must follow workflow (`PLANNED` -> `IN_PROGRESS` -> `FINISHED`).
2.  **Participants:**
    *   `peg_number`: Must be unique per competition.
    *   `peg_number`: Cannot be assigned if `is_present` is false (Business Rule).
    *   `peg_number`: Cannot exceed `pegs_count`.
3.  **Catches:**
    *   `weight`: Non-negative with 3 decimal places logic (grams).
    *   `participant_id`: Must belong to the `competition_id`.

### Business Logic
*   **Peg Draw:**
    *   Automatic assignment of random numbers 1..N to present participants.
    *   Respects `pegs_count`.
*   **Ranking Calculation:**
    *   Sum of `weight` from `catches`.
    *   Sort descending.
    *   Ex aequo logic: Identical weights get same rank (e.g., 1, 2, 2, 4).
*   **Offline Synchronization:**
    *   API must handle idempotent requests (UUID primary keys generated on client) to prevent duplicates during sync.
