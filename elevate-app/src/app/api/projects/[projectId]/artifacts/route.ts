import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/artifacts - List artifacts
export async function GET(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Check project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id, visibility')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isOwner = user?.id === project.user_id;
    const isPublic = project.visibility === 'public';

    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data: artifacts, error } = await supabase
      .from('project_artifacts')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artifacts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch artifacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ artifacts });
  } catch (error) {
    console.error('Artifacts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/artifacts - Create artifact record
export async function POST(request: Request, context: RouteContext) {
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

    // Check project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      file_name,
      file_path,
      file_type,
      file_size,
      mime_type,
      storage_bucket,
    } = body;

    // Validation
    if (!file_name || !file_path || !file_type || !file_size || !storage_bucket) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: artifact, error } = await supabase
      .from('project_artifacts')
      .insert({
        project_id: projectId,
        file_name,
        file_path,
        file_type,
        file_size,
        mime_type: mime_type || null,
        storage_bucket,
        upload_status: 'COMPLETED',
        analysis_status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating artifact:', error);
      return NextResponse.json(
        { error: 'Failed to create artifact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ artifact }, { status: 201 });
  } catch (error) {
    console.error('Artifacts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/artifacts - Delete artifact
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const artifactId = searchParams.get('artifactId');

    if (!artifactId) {
      return NextResponse.json(
        { error: 'Artifact ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get artifact info for storage cleanup
    const { data: artifact, error: artifactError } = await supabase
      .from('project_artifacts')
      .select('file_path, storage_bucket')
      .eq('id', artifactId)
      .eq('project_id', projectId)
      .single();

    if (artifactError || !artifact) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    await supabase.storage
      .from(artifact.storage_bucket)
      .remove([artifact.file_path]);

    // Delete record
    const { error } = await supabase
      .from('project_artifacts')
      .delete()
      .eq('id', artifactId);

    if (error) {
      console.error('Error deleting artifact:', error);
      return NextResponse.json(
        { error: 'Failed to delete artifact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Artifacts DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
