import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ token: string }>;
}

// GET /api/feedback/respond/[token] - Get feedback request info by respondent token (public)
export async function GET(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const supabase = await createClient();

    // Fetch respondent and associated request by token
    // Using service role or direct query since this is public access
    const { data: respondent, error: respondentError } = await supabase
      .from('feedback_respondents')
      .select(`
        id,
        respondent_email,
        respondent_name,
        relationship,
        status,
        request:feedback_requests(
          id,
          title,
          context,
          prompt_questions,
          status,
          expires_at,
          is_anonymous,
          user:users(
            username,
            avatar_url
          )
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
      id: string;
      title: string;
      context: string | null;
      prompt_questions: { questions: string[] };
      status: string;
      expires_at: string;
      is_anonymous: boolean;
      user: { username: string | null; avatar_url: string | null }[] | { username: string | null; avatar_url: string | null };
    };

    // Handle nested user which may also be an array
    const userData = Array.isArray(feedbackRequest.user) ? feedbackRequest.user[0] : feedbackRequest.user;

    // Check if request is expired
    if (new Date(feedbackRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This feedback request has expired' },
        { status: 410 }
      );
    }

    // Check if already responded
    if (respondent.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this request' },
        { status: 409 }
      );
    }

    // Check if request is still accepting responses
    if (feedbackRequest.status === 'COMPLETED' || feedbackRequest.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'This feedback request is no longer accepting responses' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.respondent_name,
        email: respondent.respondent_email,
        relationship: respondent.relationship,
        status: respondent.status,
      },
      request: {
        id: feedbackRequest.id,
        title: feedbackRequest.title,
        context: feedbackRequest.context,
        questions: feedbackRequest.prompt_questions?.questions || [],
        expiresAt: feedbackRequest.expires_at,
        isAnonymous: feedbackRequest.is_anonymous,
        requesterName: userData?.username || 'A colleague',
        requesterAvatar: userData?.avatar_url,
      },
    });
  } catch (error) {
    console.error('Feedback respond GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feedback/respond/[token] - Submit feedback response (public)
export async function POST(request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const supabase = await createClient();

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

    // Check if request is still accepting
    if (feedbackRequest.status === 'COMPLETED' || feedbackRequest.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'This feedback request is no longer accepting responses' },
        { status: 410 }
      );
    }

    const body = await request.json();
    const {
      feedback_type,
      content,
      audio_url,
      duration_seconds,
    } = body;

    // Validation
    if (!feedback_type || !['VOICE', 'TEXT', 'VIDEO'].includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Valid feedback type is required (VOICE, TEXT, or VIDEO)' },
        { status: 400 }
      );
    }

    if (feedback_type === 'TEXT' && (!content || content.trim().length < 10)) {
      return NextResponse.json(
        { error: 'Text feedback must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (feedback_type === 'VOICE' && !audio_url) {
      return NextResponse.json(
        { error: 'Audio URL is required for voice feedback' },
        { status: 400 }
      );
    }

    // Create the response
    const { data: response, error: responseError } = await supabase
      .from('feedback_responses')
      .insert({
        respondent_id: respondent.id,
        feedback_type,
        content: content?.trim() || null,
        audio_url: audio_url || null,
        duration_seconds: duration_seconds || null,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error creating feedback response:', responseError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    // Update respondent status to COMPLETED
    const { error: updateError } = await supabase
      .from('feedback_respondents')
      .update({
        status: 'COMPLETED',
        responded_at: new Date().toISOString(),
      })
      .eq('id', respondent.id);

    if (updateError) {
      console.error('Error updating respondent status:', updateError);
      // Response was created, so we still return success
    }

    return NextResponse.json(
      { success: true, response },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback respond POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
