import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

// POST /api/teams/[teamId]/join - Request to join a team
export async function POST(request: Request, context: RouteContext) {
  try {
    const { teamId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(user_id)
      `)
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if team is active and public
    if (!team.is_active) {
      return NextResponse.json(
        { error: 'Team is not active' },
        { status: 400 }
      );
    }

    if (!team.is_public) {
      return NextResponse.json(
        { error: 'Team is private. Please request an invitation.' },
        { status: 403 }
      );
    }

    // Check if already a member
    const isMember = team.members?.some((m: { user_id: string }) => m.user_id === user.id);
    if (isMember) {
      return NextResponse.json(
        { error: 'You are already a member of this team' },
        { status: 400 }
      );
    }

    // Check if team is full
    const memberCount = team.members?.length || 0;
    if (memberCount >= team.max_members) {
      return NextResponse.json(
        { error: 'Team is full' },
        { status: 400 }
      );
    }

    // Get contribution area from request body
    const body = await request.json().catch(() => ({}));
    const contributionArea = body.contributionArea?.trim() || null;

    // Add user as pending member
    const { data: membership, error: joinError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'PENDING',
        contribution_area: contributionArea,
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error joining team:', joinError);
      if (joinError.code === '23505') {
        return NextResponse.json(
          { error: 'Join request already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to join team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      membership: {
        id: membership.id,
        teamId: membership.team_id,
        role: membership.role,
        contributionArea: membership.contribution_area,
        status: 'pending_approval',
      },
      message: 'Join request submitted. Team leader will review your request.',
    }, { status: 201 });
  } catch (error) {
    console.error('Team join error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId]/join - Leave team or cancel join request
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { teamId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if team owner (can't leave own team)
    const { data: team } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (team?.created_by === user.id) {
      return NextResponse.json(
        { error: 'Team owner cannot leave. Transfer ownership or delete the team.' },
        { status: 400 }
      );
    }

    // Remove membership
    const { error: leaveError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id);

    if (leaveError) {
      console.error('Error leaving team:', leaveError);
      return NextResponse.json(
        { error: 'Failed to leave team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully left the team',
    });
  } catch (error) {
    console.error('Team leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
