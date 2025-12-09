-- Enable UUID extension
create extension if not exist "pgcrypto";

-- Create Enum Types
create type competition_status as enum ('PLANNED', 'IN_PROGRESS', 'FINISHED');

-- Create Tables

-- 1. Competitions
create table competitions (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid references auth.users(id) not null,
    name text not null,
    date date not null,
    pegs_count int not null check (pegs_count > 0),
    status competition_status not null default 'PLANNED',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Categories
create table categories (
    id uuid primary key default gen_random_uuid(),
    competition_id uuid references competitions(id) on delete cascade not null,
    name text not null,
    created_at timestamptz not null default now()
);

-- 3. Participants
create table participants (
    id uuid primary key default gen_random_uuid(),
    competition_id uuid references competitions(id) on delete cascade not null,
    category_id uuid references categories(id) on delete set null,
    first_name text not null,
    last_name text not null,
    peg_number int,
    is_disqualified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    constraint unique_peg_per_competition unique (competition_id, peg_number)
);

-- 4. Catches
create table catches (
    id uuid primary key default gen_random_uuid(),
    competition_id uuid references competitions(id) on delete cascade not null,
    participant_id uuid references participants(id) on delete cascade not null,
    weight numeric(8,3) not null check (weight >= 0),
    species text,
    is_big_fish boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for Performance
create index idx_competitions_owner_id on competitions(owner_id);
create index idx_categories_competition_id on categories(competition_id);
create index idx_participants_competition_id on participants(competition_id);
create index idx_catches_competition_id on catches(competition_id);
create index idx_catches_participant_id on catches(participant_id);

-- Enable RLS
alter table competitions enable row level security;
alter table categories enable row level security;
alter table participants enable row level security;
alter table catches enable row level security;

-- RLS Policies

-- 1. Competitions
-- Owner can do everything
create policy "Owner can manage own competitions"
    on competitions
    for all
    using (auth.uid() = owner_id);

-- Everyone can view (MVP requirement for Public access, refinable later)
create policy "Public can view competitions"
    on competitions
    for select
    using (true);

-- 2. Categories
-- Owner managed via competition ownership
create policy "Owner can manage categories"
    on categories
    for all
    using (
        exists (
            select 1 from competitions
            where competitions.id = categories.competition_id
            and competitions.owner_id = auth.uid()
        )
    );

create policy "Public can view categories"
    on categories
    for select
    using (true);

-- 3. Participants
-- Owner managed
create policy "Owner can manage participants"
    on participants
    for all
    using (
        exists (
            select 1 from competitions
            where competitions.id = participants.competition_id
            and competitions.owner_id = auth.uid()
        )
    );

-- Block modifications if competition FINISHED (Optional constraint, good practice)
-- Note: 'for all' includes select, so we need separate policies for modification vs selection to be precise about the Status check logic.
-- However, the Owner policy above grants 'ALL'. Policies are permissive (OR). We generally need a stricter approach if we want to BLOCK.
-- RLS in Postgres is permissive. To BLOCK, we usually need to ensure the permissive policy includes the check, OR use a Trigger.
-- For MVP RLS simplicity: we trust the App logic + the policy. 
-- Let's stick to the basic "Owner has full access" for simplicity, but we can prevent INSERT/UPDATE if status is FINISHED by adding that condition to the USING/WITH CHECK clause.

-- Refined Owner policy for Participants:
-- Allow ALL if Owner AND Status != FINISHED (for updates/inserts).
-- Actually, let's keep it simple: Owner is trusted. The status check is an app logic requirement mostly. 
-- But if we want DB level safety:
-- We can add a CHECK constraint on the TABLE itself or a Trigger. RLS is often enough.
-- Let's stick to standard RLS for ownership now.

create policy "Public can view participants"
    on participants
    for select
    using (true);

-- 4. Catches
-- Owner managed
create policy "Owner can manage catches"
    on catches
    for all
    using (
        exists (
            select 1 from competitions
            where competitions.id = catches.competition_id
            and competitions.owner_id = auth.uid()
        )
    );

create policy "Public can view catches"
    on catches
    for select
    using (true);
