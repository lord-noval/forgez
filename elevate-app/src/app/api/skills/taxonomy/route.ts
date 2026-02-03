import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SkillFramework, SkillCategory } from '@/lib/supabase/types';

// GET /api/skills/taxonomy - List skills taxonomy
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const framework = searchParams.get('framework') as SkillFramework | null;
    const category = searchParams.get('category') as SkillCategory | null;
    const search = searchParams.get('search');
    const parentId = searchParams.get('parentId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('skills_taxonomy')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + limit - 1);

    if (framework) {
      query = query.eq('framework', framework);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,alt_labels.cs.{${search}}`);
    }

    if (parentId) {
      query = query.eq('parent_skill_id', parentId);
    } else if (parentId === 'root') {
      query = query.is('parent_skill_id', null);
    }

    const { data: skills, error, count } = await query;

    if (error) {
      console.error('Error fetching taxonomy:', error);
      return NextResponse.json(
        { error: 'Failed to fetch skills taxonomy' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      skills,
      pagination: {
        offset,
        limit,
        total: count,
        hasMore: skills.length === limit,
      },
    });
  } catch (error) {
    console.error('Taxonomy GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
