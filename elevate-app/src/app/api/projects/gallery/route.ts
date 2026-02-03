import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ProjectType } from '@/lib/supabase/types';

// GET /api/projects/gallery - Public project search
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const type = searchParams.get('type') as ProjectType | null;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    let query = supabase
      .from('projects')
      .select(`
        *,
        user:users(id, username, avatar_url, headline),
        artifact_count:project_artifacts(count),
        skill_count:project_skills(count)
      `)
      .eq('visibility', 'public')
      .range(offset, offset + limit - 1);

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Search in title and description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by project type
    if (type) {
      query = query.eq('project_type', type);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Sorting
    const validSortColumns = ['created_at', 'view_count', 'title'];
    const column = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(column, { ascending: sortOrder === 'asc' });

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error fetching gallery:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projects,
      pagination: {
        offset,
        limit,
        total: count,
        hasMore: projects.length === limit,
      },
    });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
