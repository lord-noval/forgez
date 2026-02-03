import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/achievements - Get all achievement definitions
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const id = searchParams.get('id');

    // Single achievement lookup
    if (id) {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Achievement not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    }

    // Build query
    let query = supabase.from('achievement_definitions').select('*');

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by rarity
    if (rarity) {
      query = query.eq('rarity', rarity);
    }

    // Order by category then rarity
    query = query.order('category').order('rarity');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching achievements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
