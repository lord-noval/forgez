import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const industry = searchParams.get('industry');
    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    let query = supabase.from('epic_objects').select('*');

    // Filter by slug (single item lookup)
    if (slug) {
      const { data, error } = await supabase
        .from('epic_objects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Epic object not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    }

    // Filter by industry
    if (industry) {
      query = query.eq('industry', industry);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    // Filter by featured
    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Order by difficulty
    query = query.order('difficulty_level', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching epic objects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch epic objects' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Epic objects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
