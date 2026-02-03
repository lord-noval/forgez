import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/jobs - List active job postings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const employmentTypes = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const remoteOnly = searchParams.get('remote') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('status', 'ACTIVE')
      .order('posted_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (employmentTypes.length > 0) {
      query = query.in('employment_type', employmentTypes);
    }

    if (remoteOnly) {
      query = query.eq('is_remote', true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: jobs || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job posting (employer only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an employer with a company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_employer, employer_company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_employer || !userData?.employer_company_id) {
      return NextResponse.json(
        { error: 'Only employers can create job postings' },
        { status: 403 }
      );
    }

    // Parse request body
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

    // Validate required fields
    if (!title || !description || !employment_type) {
      return NextResponse.json(
        { error: 'Title, description, and employment type are required' },
        { status: 400 }
      );
    }

    // Create job posting
    const { data: job, error: createError } = await supabase
      .from('job_postings')
      .insert({
        company_id: userData.employer_company_id,
        title,
        description,
        location,
        is_remote: is_remote || false,
        employment_type,
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        salary_currency: salary_currency || 'EUR',
        required_skills: required_skills || [],
        preferred_skills: preferred_skills || [],
        status: status || 'DRAFT',
        posted_at: status === 'ACTIVE' ? new Date().toISOString() : null,
      })
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (createError) {
      console.error('Error creating job:', createError);
      return NextResponse.json(
        { error: 'Failed to create job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Create job API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
