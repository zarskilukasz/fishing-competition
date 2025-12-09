
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CompetitionStatus } from '@/src/types/database.types';

const updateCompetitionSchema = z.object({
  name: z.string().min(3).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
  pegs_count: z.number().int().positive().optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'FINISHED'] as [string, ...string[]]).transform(val => val as CompetitionStatus).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Basic validation for UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: competition, error: dbError } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single();

  if (dbError) {
    if (dbError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Optional: Enforce ownership check strictly (if RLS is not enough or for explicit 403)
  if (competition.owner_id !== user.id) {
    // Returning 404 is safer to not leak existence, but 403 is more descriptive. 
    // Given plan mentions RLS, empty result would be returned by Supabase if RLS works, 
    // causing 404 (PGRST116). So specific 403 might not be reachable if RLS is on.
    // We'll stick to RLS behavior (404/Null) or if we fetched it, it means we have access.
  }

  return NextResponse.json(competition);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const body = updateCompetitionSchema.parse(json);

    // 1. Fetch current competition to check status logic
    const { data: currentComp, error: fetchError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (currentComp.owner_id !== user.id) {
      // Should be handled by RLS, but double check
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Status transition validation
    if (body.status) {
      const current = currentComp.status;
      const next = body.status;

      const allowed =
        (current === 'PLANNED' && next === 'IN_PROGRESS') ||
        (current === 'IN_PROGRESS' && next === 'FINISHED'); // Or maybe PLANNED -> FINISHED (cancelled? not specified)

      // Allow same status update? Yes.
      if (current !== next && !allowed) {
        // Let's create a simplified check based on "strict flow"
        // If plan didn't specify strict state machine denial, strictly sticking to plan:
        // "Przejście PLANNED -> IN_PROGRESS... Przejście IN_PROGRESS -> FINISHED"
        // Implies forward movement.
        // If user tries to go back or skip, maybe block?
        // For MVP, warn or block. "Zwalidować czy przejście statusu jest dozwolone"

        // Allow updates if status is not changing, OR if transition is valid
        const isValidTransition = allowed;
        if (!isValidTransition) {
          return NextResponse.json({
            error: `Invalid status transition from ${current} to ${next}`
          }, { status: 400 });
        }
      }
    }

    const { data: updatedComp, error: updateError } = await supabase
      .from('competitions')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedComp);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check ownership
  const { data: competition, error: fetchError } = await supabase
    .from('competitions')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (competition.owner_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { error } = await supabase
    .from('competitions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
