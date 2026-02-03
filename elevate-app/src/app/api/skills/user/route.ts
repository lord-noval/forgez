import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/skills/user - Get user's skills
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
    const userId = searchParams.get('userId') || user.id;

    // Check if viewing own skills or public profile
    if (userId !== user.id) {
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('show_skills_publicly, profile_visibility')
        .eq('id', userId)
        .single();

      if (userError || !targetUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (
        !targetUser.show_skills_publicly ||
        targetUser.profile_visibility !== 'public'
      ) {
        return NextResponse.json(
          { error: 'Skills are not publicly visible' },
          { status: 403 }
        );
      }
    }

    const { data: skills, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill:skills_taxonomy(*),
        endorsements:skill_endorsements(
          *,
          endorser:users(id, username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('proficiency_level', { ascending: false });

    if (error) {
      console.error('Error fetching user skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('User skills GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/skills/user - Add skill to user profile
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
      skill_id,
      proficiency_level = 1,
      years_experience,
      last_used_date,
      is_primary = false,
      notes,
    } = body;

    if (!skill_id) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Validate skill exists
    const { data: skillExists, error: skillError } = await supabase
      .from('skills_taxonomy')
      .select('id')
      .eq('id', skill_id)
      .single();

    if (skillError || !skillExists) {
      return NextResponse.json(
        { error: 'Skill not found in taxonomy' },
        { status: 404 }
      );
    }

    // Check if already added
    const { data: existing } = await supabase
      .from('user_skills')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_id', skill_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Skill already added to profile' },
        { status: 400 }
      );
    }

    const { data: userSkill, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: user.id,
        skill_id,
        proficiency_level,
        verification_level: 'SELF_ASSESSED',
        years_experience: years_experience || null,
        last_used_date: last_used_date || null,
        is_primary,
        notes: notes || null,
      })
      .select(`
        *,
        skill:skills_taxonomy(*)
      `)
      .single();

    if (error) {
      console.error('Error adding skill:', error);
      return NextResponse.json(
        { error: 'Failed to add skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skill: userSkill }, { status: 201 });
  } catch (error) {
    console.error('User skills POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/skills/user - Update user skill
export async function PUT(request: Request) {
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
      id,
      proficiency_level,
      years_experience,
      last_used_date,
      is_primary,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User skill ID is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existing, error: existingError } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (proficiency_level !== undefined) updates.proficiency_level = proficiency_level;
    if (years_experience !== undefined) updates.years_experience = years_experience;
    if (last_used_date !== undefined) updates.last_used_date = last_used_date;
    if (is_primary !== undefined) updates.is_primary = is_primary;
    if (notes !== undefined) updates.notes = notes;

    const { data: userSkill, error } = await supabase
      .from('user_skills')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        skill:skills_taxonomy(*)
      `)
      .single();

    if (error) {
      console.error('Error updating skill:', error);
      return NextResponse.json(
        { error: 'Failed to update skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ skill: userSkill });
  } catch (error) {
    console.error('User skills PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/user - Remove skill from profile
export async function DELETE(request: Request) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User skill ID is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const { data: existing, error: existingError } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting skill:', error);
      return NextResponse.json(
        { error: 'Failed to delete skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User skills DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
