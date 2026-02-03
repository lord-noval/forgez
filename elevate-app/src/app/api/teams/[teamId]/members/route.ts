import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

// GET /api/teams/[teamId]/members - List team members
export async function GET(request: Request, context: RouteContext) {
  try {
    const { teamId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check team access
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('is_public, created_by')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // For private teams, only members can see member list
    if (!team.is_public) {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { data: membership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Fetch members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id,
        user_id,
        role,
        contribution_area,
        joined_at,
        user:users(id, username, avatar_url, headline)
      `)
      .eq('team_id', teamId)
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    const isOwner = team.created_by === user?.id;

    return NextResponse.json({
      members: members?.map(m => ({
        id: m.id,
        userId: m.user_id,
        role: m.role,
        contributionArea: m.contribution_area,
        joinedAt: m.joined_at,
        user: m.user,
      })) || [],
      isOwner,
    });
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[teamId]/members - Update member (approve, change role, remove)
export async function PUT(request: Request, context: RouteContext) {
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

    // Check if user is team leader
    const { data: leaderMembership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!leaderMembership || leaderMembership.role !== 'LEADER') {
      return NextResponse.json(
        { error: 'Only team leaders can manage members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId, action, role, contributionArea } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Get member details
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Can't modify self
    if (member.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own membership' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'approve':
        // Approve pending member
        if (member.role !== 'PENDING') {
          return NextResponse.json(
            { error: 'Member is not pending approval' },
            { status: 400 }
          );
        }

        await supabase
          .from('team_members')
          .update({ role: 'MEMBER' })
          .eq('id', memberId);

        return NextResponse.json({
          success: true,
          message: 'Member approved',
        });

      case 'reject':
      case 'remove':
        // Remove member
        await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId);

        return NextResponse.json({
          success: true,
          message: action === 'reject' ? 'Request rejected' : 'Member removed',
        });

      case 'update':
        // Update role or contribution area
        const updates: Record<string, unknown> = {};

        if (role && ['MEMBER', 'ADVISOR'].includes(role)) {
          updates.role = role;
        }

        if (contributionArea !== undefined) {
          updates.contribution_area = contributionArea?.trim() || null;
        }

        if (Object.keys(updates).length === 0) {
          return NextResponse.json(
            { error: 'No valid updates provided' },
            { status: 400 }
          );
        }

        await supabase
          .from('team_members')
          .update(updates)
          .eq('id', memberId);

        return NextResponse.json({
          success: true,
          message: 'Member updated',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, remove, or update' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Members PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
