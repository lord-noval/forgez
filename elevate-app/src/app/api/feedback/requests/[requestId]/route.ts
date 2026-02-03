import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

// GET /api/feedback/requests/[requestId] - Get single feedback request with respondents and responses
export async function GET(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch request with respondents and their responses
    const { data: feedbackRequest, error } = await supabase
      .from('feedback_requests')
      .select(`
        *,
        respondents:feedback_respondents(
          *,
          responses:feedback_responses(*)
        )
      `)
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single();

    if (error || !feedbackRequest) {
      return NextResponse.json(
        { error: 'Feedback request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: feedbackRequest });
  } catch (error) {
    console.error('Feedback request GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/feedback/requests/[requestId] - Update feedback request
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
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
      .from('feedback_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Feedback request not found' },
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
      context: requestContext,
      status,
      expires_at,
    } = body;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title.trim();
    if (requestContext !== undefined) updates.context = requestContext?.trim() || null;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (expires_at !== undefined) updates.expires_at = expires_at;

    const { data: feedbackRequest, error } = await supabase
      .from('feedback_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback request:', error);
      return NextResponse.json(
        { error: 'Failed to update feedback request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: feedbackRequest });
  } catch (error) {
    console.error('Feedback request PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/requests/[requestId] - Delete feedback request
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
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
      .from('feedback_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Feedback request not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete request (cascades to respondents and responses)
    const { error } = await supabase
      .from('feedback_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting feedback request:', error);
      return NextResponse.json(
        { error: 'Failed to delete feedback request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback request DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
