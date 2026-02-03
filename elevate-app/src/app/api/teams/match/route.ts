import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface UserSkillRow {
  skill_id: string;
  proficiency_level: number;
  skill: {
    name: string;
    category: string;
  } | null;
}

interface TeamForMatch {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  max_members: number;
  skill_requirements: { skills: string[]; experience_level?: string } | null;
  is_public: boolean;
  created_at: string;
  members: { user_id: string }[];
  creator: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

// GET /api/teams/match - Find teams that match user's skills
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
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get user's skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        skill:skills_taxonomy(name, category)
      `)
      .eq('user_id', user.id)
      .order('proficiency_level', { ascending: false });

    if (skillsError) {
      console.error('Error fetching user skills:', skillsError);
      return NextResponse.json(
        { error: 'Failed to fetch user skills' },
        { status: 500 }
      );
    }

    // Extract skill names from user skills
    // Supabase returns joined data which we need to extract properly
    const userSkillNames = new Set<string>();
    if (userSkills) {
      for (const skillRow of userSkills as unknown[]) {
        const row = skillRow as UserSkillRow;
        const skillName = row.skill?.name;
        if (skillName) {
          userSkillNames.add(skillName.toLowerCase());
        }
      }
    }

    // Get user's archetype for additional matching
    const { data: archetype } = await supabase
      .from('user_archetypes')
      .select('archetype, domain_interest')
      .eq('user_id', user.id)
      .single();

    // Get teams user is not already a member of
    const { data: existingMemberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    const excludeTeamIds = existingMemberships?.map(m => m.team_id) || [];

    // Fetch public teams with open spots
    let query = supabase
      .from('teams')
      .select(`
        *,
        members:team_members(user_id),
        creator:users!teams_created_by_fkey(id, username, avatar_url)
      `)
      .eq('is_active', true)
      .eq('is_public', true);

    if (excludeTeamIds.length > 0) {
      query = query.not('id', 'in', `(${excludeTeamIds.join(',')})`);
    }

    const { data: teams, error: teamsError } = await query.limit(50);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    // Calculate match scores
    const matchedTeams = (teams as TeamForMatch[] | null || [])
      .filter(team => {
        // Filter out full teams
        const memberCount = team.members?.length || 0;
        return memberCount < team.max_members;
      })
      .map(team => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        // Score based on skill match
        const requiredSkills = team.skill_requirements?.skills || [];
        const matchedSkills: string[] = [];

        for (const skill of requiredSkills) {
          if (userSkillNames.has(skill.toLowerCase())) {
            matchedSkills.push(skill);
            matchScore += 20;
          }
        }

        if (matchedSkills.length > 0) {
          matchReasons.push(`You have ${matchedSkills.length}/${requiredSkills.length} required skills`);
        }

        // Score based on complementary skills (skills team might need)
        const teamMemberCount = team.members?.length || 0;
        if (teamMemberCount < team.max_members - 1) {
          // Team needs more members, boost score
          matchScore += 10;
          matchReasons.push('Team is actively looking for members');
        }

        // Score based on domain interest (if team description mentions it)
        if (archetype?.domain_interest && team.description) {
          const desc = team.description.toLowerCase();
          const domain = archetype.domain_interest.toLowerCase();
          if (desc.includes(domain)) {
            matchScore += 15;
            matchReasons.push(`Matches your ${archetype.domain_interest} interest`);
          }
        }

        // Base score for public teams with good descriptions
        if (team.description && team.description.length > 50) {
          matchScore += 5;
        }

        if (team.purpose) {
          matchScore += 5;
        }

        // Normalize score to 0-100
        matchScore = Math.min(100, matchScore);

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          purpose: team.purpose,
          maxMembers: team.max_members,
          memberCount: teamMemberCount,
          skillRequirements: team.skill_requirements,
          matchedSkills,
          matchScore,
          matchReasons,
          creator: team.creator,
          createdAt: team.created_at,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return NextResponse.json({
      matches: matchedTeams,
      userSkillCount: userSkills?.length || 0,
      hasSkills: (userSkills?.length || 0) > 0,
      message: (userSkills?.length || 0) === 0
        ? 'Add skills to your profile for better team matches'
        : undefined,
    });
  } catch (error) {
    console.error('Team match error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
