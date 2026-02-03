import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('leader_insights')
      .select('*')
      .order('is_featured', { ascending: false });

    if (error) {
      console.error('Error fetching leader insights:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leader insights' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Leader insights API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
