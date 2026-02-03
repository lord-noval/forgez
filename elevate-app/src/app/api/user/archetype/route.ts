import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { archetype, gamePreference, domainInterest, focusArea } = body;

    // Validate required fields
    if (!archetype || !gamePreference || !domainInterest || !focusArea) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert user archetype
    const { data, error } = await supabase
      .from('user_archetypes')
      .upsert({
        user_id: user.id,
        archetype,
        game_preference: gamePreference,
        domain_interest: domainInterest,
        focus_area: focusArea,
        quiz_answers: { gamePreference, domainInterest, focusArea },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving archetype:', error);
      return NextResponse.json(
        { error: 'Failed to save archetype' },
        { status: 500 }
      );
    }

    // Award XP for completing archetype quiz
    await supabase.rpc('award_xp', {
      p_user_id: user.id,
      p_amount: 100,
      p_source: 'archetype_complete',
      p_description: 'Completed Character Creation quest'
    });

    // Update quest progress
    await supabase
      .from('quest_progress')
      .update({
        status: 'completed',
        xp_earned: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('quest_number', 1);

    // Unlock quest 2
    await supabase
      .from('quest_progress')
      .update({
        status: 'available',
      })
      .eq('user_id', user.id)
      .eq('quest_number', 2);

    // Update user's current quest
    await supabase
      .from('users')
      .update({
        current_quest: 2,
        total_xp: supabase.rpc('COALESCE(total_xp, 0)') as unknown as number + 100,
      })
      .eq('id', user.id);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Archetype API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    // Get user archetype
    const { data, error } = await supabase
      .from('user_archetypes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching archetype:', error);
      return NextResponse.json(
        { error: 'Failed to fetch archetype' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Archetype API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
