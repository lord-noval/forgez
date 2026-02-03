import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supported audio types for voice recordings
const AUDIO_CONFIGS: Record<string, { maxSize: number }> = {
  'audio/webm': { maxSize: 100 * 1024 * 1024 }, // 100MB
  'audio/mp4': { maxSize: 100 * 1024 * 1024 },
  'audio/mpeg': { maxSize: 100 * 1024 * 1024 },
  'audio/ogg': { maxSize: 100 * 1024 * 1024 },
  'audio/wav': { maxSize: 100 * 1024 * 1024 },
};

const BUCKET_NAME = 'feedback-recordings';

// POST /api/feedback/upload - Get signed upload URL for voice recording
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const body = await request.json();
    const { token, fileName, fileType, fileSize } = body;

    // Validation
    if (!token || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: token, fileName, fileType, fileSize' },
        { status: 400 }
      );
    }

    // Validate respondent by token
    const { data: respondent, error: respondentError } = await supabase
      .from('feedback_respondents')
      .select(`
        id,
        status,
        request_id,
        request:feedback_requests(
          status,
          expires_at
        )
      `)
      .eq('access_token', token)
      .single();

    if (respondentError || !respondent) {
      return NextResponse.json(
        { error: 'Invalid or expired feedback link' },
        { status: 404 }
      );
    }

    // Type assertion for the nested request (Supabase returns nested relations as arrays)
    const requestData = respondent.request as unknown;
    const feedbackRequest = (Array.isArray(requestData) ? requestData[0] : requestData) as {
      status: string;
      expires_at: string;
    };

    // Check if already responded
    if (respondent.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this request' },
        { status: 409 }
      );
    }

    // Check if request expired
    if (new Date(feedbackRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This feedback request has expired' },
        { status: 410 }
      );
    }

    // Get audio configuration
    const config = AUDIO_CONFIGS[fileType];
    if (!config) {
      return NextResponse.json(
        { error: `Unsupported audio type: ${fileType}. Supported: webm, mp4, mpeg, ogg, wav` },
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
    const filePath = `${respondent.request_id}/${respondent.id}/${timestamp}_${sanitizedFileName}`;

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (uploadError) {
      console.error('Error creating signed URL:', uploadError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      uploadToken: uploadData.token,
      filePath,
      publicUrl: publicUrlData.publicUrl,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error('Feedback upload POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
