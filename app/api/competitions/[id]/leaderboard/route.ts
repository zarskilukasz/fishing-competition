
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Types for aggregation
interface RankingEntry {
  rank: number;
  participant: {
    id: string;
    first_name: string;
    last_name: string;
    peg_number: number | null;
    category_name: string | null;
  };
  total_weight: number;
  points: number;
  catches_count: number;
  biggest_fish_weight: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
  }

  const supabase = await createClient();

  // Public access? Plan says "Every endpoint (except public Leaderboard) requires Authorization".
  // "2. Authentication: Każdy endpoint (poza publicznym Leaderboard) wymaga nagłówka Authorization".
  // So Leaderboard IS public.
  // We do NOT need to check `auth.getUser()` for strict access control, 
  // BUT we usually want to know if specific permissions apply (maybe draft competitions are hidden?).
  // For MVP "Public Leaderboard" usually means anyone can see it if they have the link/ID.
  // Let's implement it as public for now, as per plan.

  // 1. Fetch competition to ensure existence (and maybe status check?)
  const { data: competition, error: compError } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single();

  if (compError || !competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
  }

  // 2. Fetch participants and catches
  // We need all participants to show even those with 0 catches.
  // We filter out disqualified.
  // "category" is joined to show name.
  // "catches" are joined.

  const { data: participants, error: partError } = await supabase
    .from('participants')
    .select(`
        id,
        first_name,
        last_name,
        peg_number,
        is_disqualified,
        category:categories(name),
        catches(weight, is_big_fish)
      `)
    .eq('competition_id', id)
    .eq('is_disqualified', false);

  if (partError) {
    return NextResponse.json({ error: partError.message }, { status: 500 });
  }

  // 3. Process Data
  const results = participants.map((p) => {
    // Cast catches safely
    // Supabase types might be inferred differently, generally array of objects
    const catches = p.catches as unknown as { weight: number, is_big_fish: boolean }[];

    const totalWeight = catches.reduce((sum, c) => sum + c.weight, 0);
    const catchesCount = catches.length;
    const biggestFish = Math.max(0, ...catches.map(c => c.weight)); // Simple max weight

    return {
      participant: {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        peg_number: p.peg_number,
        // Supabase join returns object or array, generally object for single relation if setup correctly
        // Here we used `category:categories(...)` which usually hints singular if it's a FK relation.
        // Assuming singular object or null.
        category_name: Array.isArray(p.category) ? p.category[0]?.name : (p.category as { name: string } | null)?.name
      },
      total_weight: totalWeight,
      catches_count: catchesCount,
      biggest_fish_weight: biggestFish
    };
  });

  // 4. Sort
  results.sort((a, b) => b.total_weight - a.total_weight);

  // 5. Assign Ranks
  const distinctRankings: RankingEntry[] = [];
  const currentRank = 1;

  for (let i = 0; i < results.length; i++) {
    const entry = results[i];
    let rank = currentRank;

    // Check previous for tie
    if (i > 0 && entry.total_weight === results[i - 1].total_weight) {
      rank = distinctRankings[i - 1].rank;
    } else {
      rank = i + 1;
    }

    distinctRankings.push({
      ...entry,
      rank,
      points: rank, // Simple points = rank
    });
  }

  // Big Fish (Global for competition)
  // Find max weight in all results
  const maxWeight = Math.max(0, ...results.map(r => r.biggest_fish_weight));
  let bigFishEntry = null;
  if (maxWeight > 0) {
    // Find who caught it. Could be multiple?
    // Just take first one or specific logic? 
    // Usually "Big Fish" is a single valid catch record flagged `is_big_fish`?
    // Or just heaviest fish?
    // Plan says: "big_fish: { ... }" in response.
    // Let's return the simplified biggest fish info.
    const winner = results.find(r => r.biggest_fish_weight === maxWeight);
    if (winner) {
      bigFishEntry = {
        participant_id: winner.participant.id,
        participant_name: `${winner.participant.first_name} ${winner.participant.last_name}`,
        weight: maxWeight
      };
    }
  }

  return NextResponse.json({
    competition_id: id,
    rankings: distinctRankings,
    big_fish: bigFishEntry
  });
}
