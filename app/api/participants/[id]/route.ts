
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const schema = z.object({
  peg_number: z.number().int().optional().nullable(),
  is_disqualified: z.boolean().optional(),
});

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
    const body = schema.parse(json);

    // 1. Fetch participant to get competition_id for ownership check
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('competition_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 2. Check ownership of competition
    // Optimization: Join in step 1? 
    // `select('competition_id, competitions!inner(owner_id)')` could work if relationship is defined perfectly
    const { count, error: compError } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })
      .eq('id', participant.competition_id)
      .eq('owner_id', user.id);

    // OR simpler:
    // We can assume RLS protects updates if we had policies on participants based on competition owner.
    // If not, we must check manually.
    if (compError || count === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // or 403
    }

    // 3. Update
    const { data: updated, error: updateError } = await supabase
      .from('participants')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json({ error: 'Peg number already assigned in this competition' }, { status: 409 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
