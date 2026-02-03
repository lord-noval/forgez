import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('soft_skills')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching soft skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch soft skills' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Soft skills API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
