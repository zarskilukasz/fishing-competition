# Implementation Plan - Database Schema (MVP)

## Goal
Design and implement a robust PostgreSQL database schema for the "Fishing Competition Manager" MVP (Offline-first PWA). The schema must support the requirements defined in the PRD, specifically focusing on data integrity, offline synchronization support (UUIDs), and security (RLS).

## Key Design Decisions
- **Primary Keys:** `UUID` used everywhere to support offline generation and sync.
- **Timestamps:** `created_at` and `updated_at` on all tables for sync logic.
- **Status Management:** `competition_status` enum to control write access via RLS.
- **Precision:** `weight` stored as `NUMERIC(8,3)` (grams precision).
- **Categories:** 1:1 relationship for Participants. "Open" ranking calculated dynamically.
- **Photos:** Excluded from MVP.

## Proposed Schema

### Enums
- `competition_status`: `PLANNED`, `IN_PROGRESS`, `FINISHED`
- `species`: stored as `TEXT` in tables (application level logic), no enum in DB to allow flexibility.
- `user_role`: (Optional) might use Supabase built-in auth logic.

### Tables

#### 1. `competitions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, Default gen_random_uuid() | Unique ID |
| `owner_id` | `uuid` | FK -> auth.users.id | Owner of the competition |
| `name` | `text` | NOT NULL | Competition name |
| `date` | `date` | NOT NULL | Event date |
| `pegs_count` | `int` | NOT NULL, CHECK > 0 | Number of pegs |
| `status` | `competition_status` | Default 'PLANNED' | Cycle state |
| `created_at` | `timestamptz` | Default now() | Creation time |
| `updated_at` | `timestamptz` | Default now() | Last update |

#### 2. `categories`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Unique ID |
| `competition_id` | `uuid` | FK -> competitions.id (CASCADE) | Parent competition |
| `name` | `text` | NOT NULL | e.g. "Junior", "Senior" |
| `created_at` | `timestamptz` | | |

#### 3. `participants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Unique ID |
| `competition_id` | `uuid` | FK -> competitions.id (CASCADE) | Parent competition |
| `category_id` | `uuid` | FK -> categories.id (SET NULL) | Assigned category |
| `first_name` | `text` | NOT NULL | Participant First Name |
| `last_name` | `text` | NOT NULL | Participant Last Name |
| `peg_number` | `int` | | Assigned Peg (Null before draw) |
| `is_disqualified`| `boolean` | Default false | DSQ status |
| `created_at` | `timestamptz` | | |
| `updated_at` | `timestamptz` | | |
| **Constraint** | | UNIQUE(competition_id, peg_number) | Unique peg per competition |

#### 4. `catches`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK | Unique ID |
| `competition_id` | `uuid` | FK -> competitions.id (CASCADE) | Denormalized for RLS/Perf |
| `participant_id` | `uuid` | FK -> participants.id (CASCADE) | Owner of the catch |
| `weight` | `numeric(8,3)` | NOT NULL, CHECK >= 0 | Weight in kg (e.g. 12.345) |
| `species` | `text` | | Optional species name |
| `is_big_fish` | `boolean` | Default false | Big Fish candidate |
| `created_at` | `timestamptz` | | |
| `updated_at` | `timestamptz` | | |

*Note: `competition_id` in `catches` is denormalized to simplify RLS policies (avoiding complex joins for every row check).*

## Security (RLS)

### Policies
1.  **Organizator (Owner):**
    -   FULL ACCESS (Select, Insert, Update, Delete) to all tables where `competition.owner_id = auth.uid()`.
2.  **Public (Anon):**
    -   SELECT access to `competitions`, `categories`, `participants` (masked?), `catches` where `competition_id` is known (conceptually).
    -   *Refinement:* Maybe only allow Public Read if `competition.is_public` (if we had that flag) or just open by ID.
    -   For MVP: Allow `SELECT` for everyone on these tables.
3.  **Status Locking:**
    -   Prevent `INSERT/UPDATE/DELETE` on `catches` and `participants` if `competitions.status = 'FINISHED'`.

## Verification Plan
1.  **Schema Check:** Verify all tables and types are created in Supabase.
2.  **RLS Check:**
    -   Create user A and user B.
    -   User A creates competition. User B should NOT be able to edit it.
    -   Anonymous user can READ results.
3.  **Constraint Check:**
    -   Try inserting negative weight -> Fail.
    -   Try duplicate peg number -> Fail.
