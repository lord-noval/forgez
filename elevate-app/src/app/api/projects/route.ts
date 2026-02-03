import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ProjectType } from '@/lib/supabase/types';

// GET /api/projects - List user's projects
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const visibility = searchParams.get('visibility');
    const type = searchParams.get('type') as ProjectType | null;
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('projects')
      .select('*, project_artifacts(count), project_skills(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    if (type) {
      query = query.eq('project_type', type);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      project_type,
      external_url,
      repository_url,
      start_date,
      end_date,
      is_ongoing,
      visibility = 'public',
      tags,
      metadata,
    } = body;

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!project_type) {
      return NextResponse.json(
        { error: 'Project type is required' },
        { status: 400 }
      );
    }

    // Clean metadata - remove empty arrays and undefined values
    const cleanMetadata = metadata ? Object.fromEntries(
      Object.entries(metadata).filter(([_, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
    ) : null;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        project_type,
        external_url: external_url || null,
        repository_url: repository_url || null,
        start_date: start_date || null,
        end_date: end_date || null,
        is_ongoing: is_ongoing || false,
        visibility,
        tags: tags || [],
        metadata: Object.keys(cleanMetadata || {}).length > 0 ? cleanMetadata : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
