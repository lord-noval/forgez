import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

// GET /api/teams/[teamId] - Get team details
export async function GET(request: Request, context: RouteContext) {
  try {
    const { teamId } = await context.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          id,
          user_id,
          role,
          contribution_area,
          joined_at,
          user:users(id, username, avatar_url, headline)
        ),
        creator:users!teams_created_by_fkey(id, username, avatar_url)
      `)
      .eq('id', teamId)
      .single();

    if (error || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check access
    const isMember = team.members?.some((m: { user_id: string }) => m.user_id === user?.id);
    const isOwner = team.created_by === user?.id;

    if (!team.is_public && !isMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
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
        isActive: team.is_active,
        createdAt: team.created_at,
        creator: team.creator,
        members: team.members?.map((m: { id: string; user_id: string; role: string; contribution_area: string | null; joined_at: string; user: { id: string; username: string | null; avatar_url: string | null; headline: string | null } }) => ({
          id: m.id,
          userId: m.user_id,
          role: m.role,
          contributionArea: m.contribution_area,
          joinedAt: m.joined_at,
          user: m.user,
        })) || [],
        isMember,
        isOwner,
      },
    });
  } catch (error) {
    console.error('Team GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[teamId] - Update team
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

    // Check ownership
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (fetchError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (team.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Only team owner can update the team' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      purpose,
      maxMembers,
      skillRequirements,
      isPublic,
      isActive,
    } = body;

    const updates: Record<string, unknown> = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (purpose !== undefined) updates.purpose = purpose?.trim() || null;
    if (maxMembers !== undefined) updates.max_members = Math.min(Math.max(2, maxMembers), 10);
    if (skillRequirements !== undefined) updates.skill_requirements = skillRequirements;
    if (isPublic !== undefined) updates.is_public = isPublic;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: updatedTeam, error: updateError } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating team:', updateError);
      return NextResponse.json(
        { error: 'Failed to update team' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      team: {
        id: updatedTeam.id,
        name: updatedTeam.name,
        description: updatedTeam.description,
        purpose: updatedTeam.purpose,
        maxMembers: updatedTeam.max_members,
        skillRequirements: updatedTeam.skill_requirements,
        isPublic: updatedTeam.is_public,
        isActive: updatedTeam.is_active,
      },
    });
  } catch (error) {
    console.error('Team PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId] - Delete team
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

    // Check ownership
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('created_by')
      .eq('id', teamId)
      .single();

    if (fetchError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    if (team.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Only team owner can delete the team' },
        { status: 403 }
      );
    }

    // Delete team (cascades to team_members)
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (deleteError) {
      console.error('Error deleting team:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete team' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
