import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

// GET /api/jobs/[jobId] - Get a single job posting
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;
    const supabase = await createClient();

    const { data: job, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count (don't wait for it)
    supabase
      .from('job_postings')
      .update({ views_count: (job.views_count || 0) + 1 })
      .eq('id', jobId)
      .then(() => {});

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Get job API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[jobId] - Update a job posting
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the job's company
    const { data: userData } = await supabase
      .from('users')
      .select('employer_company_id')
      .eq('id', user.id)
      .single();

    const { data: existingJob } = await supabase
      .from('job_postings')
      .select('company_id, posted_at')
      .eq('id', jobId)
      .single();

    if (!existingJob || existingJob.company_id !== userData?.employer_company_id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this job' },
        { status: 403 }
      );
    }

    // Parse and update
    const body = await request.json();
    const {
      title,
      description,
      location,
      is_remote,
      employment_type,
      salary_min,
      salary_max,
      salary_currency,
      required_skills,
      preferred_skills,
      status,
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (is_remote !== undefined) updateData.is_remote = is_remote;
    if (employment_type !== undefined) updateData.employment_type = employment_type;
    if (salary_min !== undefined) updateData.salary_min = salary_min;
    if (salary_max !== undefined) updateData.salary_max = salary_max;
    if (salary_currency !== undefined) updateData.salary_currency = salary_currency;
    if (required_skills !== undefined) updateData.required_skills = required_skills;
    if (preferred_skills !== undefined) updateData.preferred_skills = preferred_skills;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'ACTIVE' && !existingJob.posted_at) {
        updateData.posted_at = new Date().toISOString();
      }
    }

    const { data: job, error: updateError } = await supabase
      .from('job_postings')
      .update(updateData)
      .eq('id', jobId)
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json(
        { error: 'Failed to update job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Update job API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[jobId] - Delete a job posting
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the job's company
    const { data: userData } = await supabase
      .from('users')
      .select('employer_company_id')
      .eq('id', user.id)
      .single();

    const { data: existingJob } = await supabase
      .from('job_postings')
      .select('company_id')
      .eq('id', jobId)
      .single();

    if (!existingJob || existingJob.company_id !== userData?.employer_company_id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this job' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId);

    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
