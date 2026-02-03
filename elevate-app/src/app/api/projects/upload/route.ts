import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// File type configurations
const FILE_CONFIGS: Record<string, { maxSize: number; bucket: string }> = {
  // Code files
  'application/zip': { maxSize: 100 * 1024 * 1024, bucket: 'project-files' },
  'application/x-zip-compressed': { maxSize: 100 * 1024 * 1024, bucket: 'project-files' },
  'text/javascript': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },
  'application/javascript': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },
  'text/typescript': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },
  'text/x-python': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },
  'text/x-java': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },

  // Documents
  'application/pdf': { maxSize: 50 * 1024 * 1024, bucket: 'project-files' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    maxSize: 50 * 1024 * 1024,
    bucket: 'project-files',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    maxSize: 50 * 1024 * 1024,
    bucket: 'project-files',
  },
  'text/markdown': { maxSize: 10 * 1024 * 1024, bucket: 'project-files' },

  // Videos
  'video/mp4': { maxSize: 500 * 1024 * 1024, bucket: 'project-files' },
  'video/quicktime': { maxSize: 500 * 1024 * 1024, bucket: 'project-files' },
  'video/webm': { maxSize: 500 * 1024 * 1024, bucket: 'project-files' },

  // Images
  'image/png': { maxSize: 20 * 1024 * 1024, bucket: 'project-files' },
  'image/jpeg': { maxSize: 20 * 1024 * 1024, bucket: 'project-files' },
  'image/webp': { maxSize: 20 * 1024 * 1024, bucket: 'project-files' },
  'image/svg+xml': { maxSize: 5 * 1024 * 1024, bucket: 'project-files' },

  // 3D Models
  'model/stl': { maxSize: 200 * 1024 * 1024, bucket: 'project-files' },
  'application/octet-stream': { maxSize: 200 * 1024 * 1024, bucket: 'project-files' },
};

// POST /api/projects/upload - Get signed upload URL
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
    const { projectId, fileName, fileType, fileSize } = body;

    // Validation
    if (!projectId || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, fileName, fileType, fileSize' },
        { status: 400 }
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

    // Get file configuration
    const config = FILE_CONFIGS[fileType];
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 400 }
      );
    }

    // Check file size
    if (fileSize > config.maxSize) {
      const maxMB = config.maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/${projectId}/${timestamp}_${sanitizedFileName}`;

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(config.bucket)
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error('Error creating signed URL:', uploadError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      token: uploadData.token,
      filePath,
      bucket: config.bucket,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error('Upload POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
