
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createCatchSchema = z.object({
  competition_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  weight: z.number().positive("Weight must be positive"),
  species: z.string().optional().nullable(),
  is_big_fish: z.boolean().optional(),
});

export async function POST(request: Request) {
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
    const body = createCatchSchema.parse(json);

    // 1. Verify competition status and ownership (or judge rights)
    // For MVP, owner is the only one who can add catches? Or judges?
    // Plan assumes owner context for now.
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('status, owner_id')
      .eq('id', body.competition_id)
      .single();

    if (compError || !competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    if (competition.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (competition.status === 'FINISHED') {
      return NextResponse.json({ error: 'Competition is finished' }, { status: 400 });
    }

    // 2. Verify participant belongs to competition
    // Could rely on RLS/FK, but validation is nice.
    const { data: participant, error: partError } = await supabase
      .from('participants')
      .select('id, competition_id')
      .eq('id', body.participant_id)
      .single();

    if (partError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (participant.competition_id !== body.competition_id) {
      return NextResponse.json({ error: 'Participant does not belong to this competition' }, { status: 400 });
    }

    // 3. Insert Catch
    const { data, error } = await supabase
      .from('catches')
      .insert({
        competition_id: body.competition_id,
        participant_id: body.participant_id,
        weight: body.weight,
        species: body.species,
        is_big_fish: body.is_big_fish || false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
