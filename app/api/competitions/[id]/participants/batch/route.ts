
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const batchImportSchema = z.object({
  participants: z.array(z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    category_id: z.string().uuid().optional().nullable(),
  })).min(1).max(100),
});

export async function POST(
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
    const body = batchImportSchema.parse(json);

    // Verify competition ownership
    const { count, error: compError } = await supabase
      .from('competitions')
      .select('*', { count: 'exact', head: true })
      .eq('id', id)
      .eq('owner_id', user.id);

    if (compError) {
      return NextResponse.json({ error: compError.message }, { status: 500 });
    }
    if (count === 0) {
      return NextResponse.json({ error: 'Competition not found or unauthorized' }, { status: 404 });
    }

    // Format data for insert
    const participantsData = body.participants.map(p => ({
      competition_id: id,
      first_name: p.first_name,
      last_name: p.last_name,
      category_id: p.category_id,
      // peg_number: null,
      // is_disqualified: false
    }));

    // Perform bulk insert
    const { data, error } = await supabase
      .from('participants')
      .insert(participantsData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: data.length, participants: data }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
