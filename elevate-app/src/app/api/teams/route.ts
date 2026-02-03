import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TeamWithMembers {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  max_members: number;
  skill_requirements: { skills: string[]; experience_level?: string } | null;
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  members: {
    id: string;
    user_id: string;
    role: string;
    user: {
      id: string;
      username: string | null;
      avatar_url: string | null;
    };
  }[];
  creator: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

// GET /api/teams - List all public teams or user's teams
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const myTeams = searchParams.get('my') === 'true';
    const search = searchParams.get('search');
    const skill = searchParams.get('skill');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let query = supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          user_id,
          role,
          user:users(id, username, avatar_url)
        ),
        creator:users!teams_created_by_fkey(id, username, avatar_url)
      `)
      .eq('is_active', true);

    if (myTeams && user) {
      // Get teams where user is a member
      const { data: memberTeamIds } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const teamIds = memberTeamIds?.map(t => t.team_id) || [];

      if (teamIds.length > 0) {
        query = query.in('id', teamIds);
      } else {
        // No teams, return empty
        return NextResponse.json({ teams: [], total: 0 });
      }
    } else {
      // Public teams only
      query = query.eq('is_public', true);
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Skill filter
    if (skill) {
      query = query.contains('skill_requirements', { skills: [skill] });
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: teams, error, count } = await query;

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedTeams = (teams || []).map((team: TeamWithMembers) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      purpose: team.purpose,
      maxMembers: team.max_members,
      memberCount: team.members?.length || 0,
      skillRequirements: team.skill_requirements,
      isPublic: team.is_public,
      createdAt: team.created_at,
      creator: team.creator,
      members: team.members?.map(m => ({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        user: m.user,
      })) || [],
      isOwner: user?.id === team.created_by,
      isMember: team.members?.some(m => m.user_id === user?.id) || false,
    }));

    return NextResponse.json({
      teams: transformedTeams,
      total: count || transformedTeams.length,
    });
  } catch (error) {
    console.error('Teams GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
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
      name,
      description,
      purpose,
      maxMembers = 5,
      skillRequirements,
      isPublic = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create team
    const { data: team, error: createError } = await supabase
      .from('teams')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        purpose: purpose?.trim() || null,
        max_members: Math.min(Math.max(2, maxMembers), 10),
        skill_requirements: skillRequirements || null,
        is_public: isPublic,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError || !team) {
      console.error('Error creating team:', createError);
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      );
    }

    // Add creator as team leader
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'LEADER',
      });

    if (memberError) {
      console.error('Error adding team leader:', memberError);
      // Rollback team creation
      await supabase.from('teams').delete().eq('id', team.id);
      return NextResponse.json(
        { error: 'Failed to create team membership' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        purpose: team.purpose,
        maxMembers: team.max_members,
        skillRequirements: team.skill_requirements,
        isPublic: team.is_public,
        createdAt: team.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Teams POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
