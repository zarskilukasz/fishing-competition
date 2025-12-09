
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createParticipantSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  category_id: z.string().uuid().optional().nullable(),
});

export async function GET(
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

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'name'; // 'name' or 'peg'

  let query = supabase
    .from('participants')
    .select('*, category:categories(name)')
    .eq('competition_id', id);

  if (sort === 'peg') {
    // Sort by peg_number, putting nulls last usually, or first.
    query = query.order('peg_number', { ascending: true, nullsFirst: false });
  } else {
    query = query.order('last_name', { ascending: true })
      .order('first_name', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

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
    const body = createParticipantSchema.parse(json);

    // Verify competition ownership/existence
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

    // Verify category if provided
    if (body.category_id) {
      const { count: catCount, error: catError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('id', body.category_id)
        .eq('competition_id', id);

      if (catError) {
        return NextResponse.json({ error: catError.message }, { status: 500 });
      }
      if (catCount === 0) {
        return NextResponse.json({ error: 'Invalid category ID for this competition' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('participants')
      .insert({
        competition_id: id,
        first_name: body.first_name,
        last_name: body.last_name,
        category_id: body.category_id,
        // peg_number: null, // default
        // is_disqualified: false // default
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
