import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const industry = searchParams.get('industry');

    let query = supabase
      .from('discord_guilds')
      .select('*')
      .order('member_count', { ascending: false });

    if (industry) {
      query = query.eq('industry', industry);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching discord guilds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch discord guilds' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Discord guilds API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
