import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/skills/endorsements - Endorse a skill
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
    const { user_skill_id, relationship, endorsement_text } = body;

    if (!user_skill_id) {
      return NextResponse.json(
        { error: 'User skill ID is required' },
        { status: 400 }
      );
    }

    // Check that the skill exists and is not the user's own
    const { data: userSkill, error: skillError } = await supabase
      .from('user_skills')
      .select('user_id')
      .eq('id', user_skill_id)
      .single();

    if (skillError || !userSkill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (userSkill.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot endorse your own skill' },
        { status: 400 }
      );
    }

    // Check if already endorsed
    const { data: existing } = await supabase
      .from('skill_endorsements')
      .select('id')
      .eq('user_skill_id', user_skill_id)
      .eq('endorser_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already endorsed this skill' },
        { status: 400 }
      );
    }

    const { data: endorsement, error } = await supabase
      .from('skill_endorsements')
      .insert({
        user_skill_id,
        endorser_id: user.id,
        relationship: relationship || null,
        endorsement_text: endorsement_text || null,
      })
      .select(`
        *,
        endorser:users(id, username, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating endorsement:', error);
      return NextResponse.json(
        { error: 'Failed to create endorsement' },
        { status: 500 }
      );
    }

    // Update verification level if peer endorsement threshold met
    const { count } = await supabase
      .from('skill_endorsements')
      .select('id', { count: 'exact', head: true })
      .eq('user_skill_id', user_skill_id);

    if (count && count >= 3) {
      await supabase
        .from('user_skills')
        .update({ verification_level: 'PEER_ENDORSED' })
        .eq('id', user_skill_id)
        .eq('verification_level', 'SELF_ASSESSED');
    }

    return NextResponse.json({ endorsement }, { status: 201 });
  } catch (error) {
    console.error('Endorsements POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/endorsements - Remove endorsement
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
        { error: 'Endorsement ID is required' },
        { status: 400 }
      );
    }

    // Check ownership (endorser can remove their own endorsement)
    const { data: existing, error: existingError } = await supabase
      .from('skill_endorsements')
      .select('endorser_id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Endorsement not found' },
        { status: 404 }
      );
    }

    if (existing.endorser_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('skill_endorsements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting endorsement:', error);
      return NextResponse.json(
        { error: 'Failed to delete endorsement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Endorsements DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
