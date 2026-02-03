import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId] - Get single project with artifacts
export async function GET(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Fetch project with artifacts and skills
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        artifacts:project_artifacts(*),
        extracted_skills:project_skills(
          *,
          skill:skills_taxonomy(*)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const isOwner = user?.id === project.user_id;
    const isPublic = project.visibility === 'public';

    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Increment view count for non-owners
    if (!isOwner) {
      await supabase
        .from('projects')
        .update({ view_count: (project.view_count || 0) + 1 })
        .eq('id', projectId);
    }

    return NextResponse.json({ project, isOwner });
  } catch (error) {
    console.error('Project GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[projectId] - Update project
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      project_type,
      thumbnail_url,
      external_url,
      repository_url,
      start_date,
      end_date,
      is_ongoing,
      visibility,
      is_featured,
      tags,
      metadata,
    } = body;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (project_type !== undefined) updates.project_type = project_type;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (external_url !== undefined) updates.external_url = external_url;
    if (repository_url !== undefined) updates.repository_url = repository_url;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (is_ongoing !== undefined) updates.is_ongoing = is_ongoing;
    if (visibility !== undefined) updates.visibility = visibility;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (tags !== undefined) updates.tags = tags;
    if (metadata !== undefined) {
      // Clean metadata - remove empty arrays and undefined values
      const cleanMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
      );
      updates.metadata = Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Project PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] - Delete project
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete project (cascades to artifacts, skills)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
