
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
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

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('competition_id', id)
    .order('created_at', { ascending: true });

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
    const body = createCategorySchema.parse(json);

    // Verify competition ownership
    // Optimization: We can insert directly and let RLS handle it, or check ownership first to be explicit.
    // Given the previous pattern, let's trust RLS or assume 'competition_id' link is enough for now, 
    // but typically we should ensure the user owns the competition before adding categories to it.
    // Let's do a quick check to ensure competition exists and belongs to user.
    const { count, error: compError } = await supabase
      .from('competitions')
      .select('owner_id', { count: 'exact', head: true })
      .eq('id', id)
      .eq('owner_id', user.id); // RLS might already enforce this visibility

    // If RLS is strictly set up, simple select on 'competitions' only returns if owned.
    // If not owned, count is 0 (or null data).
    if (compError) {
      return NextResponse.json({ error: compError.message }, { status: 500 });
    }
    // We can't easily distinguish 404 vs 403 without more queries, 
    // but if count is 0, it means either doesn't exist or not owned.
    if (count === 0) {
      return NextResponse.json({ error: 'Competition not found or unauthorized' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        competition_id: id,
        name: body.name,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Category with this name already exists in this competition' }, { status: 409 });
      }
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
