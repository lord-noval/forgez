import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const industry = searchParams.get('industry');
    const level = searchParams.get('level');

    let query = supabase.from('talent_roles').select('*');

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (level) {
      query = query.eq('level', level);
    }

    // Order by market demand
    query = query.order('market_demand', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
