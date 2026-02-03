import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const country = searchParams.get('country');
    const industry = searchParams.get('industry');
    const featured = searchParams.get('featured') === 'true';

    let query = supabase.from('forge_companies').select('*');

    if (country) {
      query = query.eq('country', country);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Order by featured first, then name
    query = query.order('is_featured', { ascending: false }).order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
