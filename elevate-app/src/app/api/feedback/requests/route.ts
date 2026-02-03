import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// GET /api/feedback/requests - List user's feedback requests
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
    const status = searchParams.get('status');

    let query = supabase
      .from('feedback_requests')
      .select(`
        *,
        respondents:feedback_respondents(
          *,
          responses:feedback_responses(count)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching feedback requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Feedback requests GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feedback/requests - Create new feedback request
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
      context,
      prompt_questions,
      expires_in_days = 14,
      min_respondents = 3,
      max_respondents = 10,
      is_anonymous = true,
      respondents,
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!prompt_questions || !Array.isArray(prompt_questions) || prompt_questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one prompt question is required' },
        { status: 400 }
      );
    }

    if (!respondents || !Array.isArray(respondents) || respondents.length < min_respondents) {
      return NextResponse.json(
        { error: `At least ${min_respondents} respondents are required` },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expires_in_days);

    // Create feedback request
    const { data: feedbackRequest, error: requestError } = await supabase
      .from('feedback_requests')
      .insert({
        user_id: user.id,
        title,
        context: context || null,
        prompt_questions: { questions: prompt_questions },
        expires_at: expires_at.toISOString(),
        min_respondents,
        max_respondents,
        is_anonymous,
        status: 'PENDING',
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating feedback request:', requestError);
      return NextResponse.json(
        { error: 'Failed to create feedback request' },
        { status: 500 }
      );
    }

    // Create respondents with access tokens
    const respondentRecords = respondents.slice(0, max_respondents).map(
      (r: { email: string; name?: string; relationship?: string }) => ({
        request_id: feedbackRequest.id,
        respondent_email: r.email,
        respondent_name: r.name || null,
        relationship: r.relationship || null,
        access_token: crypto.randomBytes(32).toString('hex'),
        status: 'PENDING',
      })
    );

    const { data: createdRespondents, error: respondentError } = await supabase
      .from('feedback_respondents')
      .insert(respondentRecords)
      .select();

    if (respondentError) {
      console.error('Error creating respondents:', respondentError);
      // Clean up the request
      await supabase.from('feedback_requests').delete().eq('id', feedbackRequest.id);
      return NextResponse.json(
        { error: 'Failed to create respondents' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        request: {
          ...feedbackRequest,
          respondents: createdRespondents,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Feedback requests POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
