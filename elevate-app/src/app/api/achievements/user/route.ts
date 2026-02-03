import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/achievements/user - Get user's unlocked achievements and progress
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's unlocked achievements with definitions
    const { data: unlockedAchievements, error: unlockedError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achievement_id,
        unlocked_at,
        notified,
        achievement_definitions (
          id,
          name,
          description,
          category,
          rarity,
          icon,
          xp_reward,
          criteria,
          has_progress,
          is_secret
        )
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (unlockedError) {
      console.error('Error fetching user achievements:', unlockedError);
      return NextResponse.json(
        { error: 'Failed to fetch user achievements' },
        { status: 500 }
      );
    }

    // Get user's achievement progress
    const { data: progress, error: progressError } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', user.id);

    if (progressError) {
      console.error('Error fetching achievement progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch achievement progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        unlocked: unlockedAchievements,
        progress: progress,
        totalUnlocked: unlockedAchievements?.length ?? 0,
      },
    });
  } catch (error) {
    console.error('User achievements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/achievements/user - Unlock an achievement for the user
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    // Verify achievement exists
    const { data: achievement, error: achievementError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Achievement already unlocked', alreadyUnlocked: true },
        { status: 409 }
      );
    }

    // Unlock achievement
    const { data: unlocked, error: unlockError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        notified: false,
      })
      .select()
      .single();

    if (unlockError) {
      console.error('Error unlocking achievement:', unlockError);
      return NextResponse.json(
        { error: 'Failed to unlock achievement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        unlocked,
        achievement,
        xpAwarded: achievement.xp_reward,
      },
    });
  } catch (error) {
    console.error('Unlock achievement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/achievements/user - Update achievement progress
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { achievementId, currentValue } = body;

    if (!achievementId || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Achievement ID and current value are required' },
        { status: 400 }
      );
    }

    // Get achievement to verify it has progress tracking
    const { data: achievement, error: achievementError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    if (!achievement.has_progress) {
      return NextResponse.json(
        { error: 'Achievement does not track progress' },
        { status: 400 }
      );
    }

    const targetValue = achievement.criteria?.targetValue ?? 0;

    // Upsert progress
    const { data: progress, error: progressError } = await supabase
      .from('achievement_progress')
      .upsert(
        {
          user_id: user.id,
          achievement_id: achievementId,
          current_value: Math.min(currentValue, targetValue),
          target_value: targetValue,
        },
        {
          onConflict: 'user_id,achievement_id',
        }
      )
      .select()
      .single();

    if (progressError) {
      console.error('Error updating achievement progress:', progressError);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Check if achievement should be unlocked
    const shouldUnlock = progress.current_value >= targetValue;

    return NextResponse.json({
      data: {
        progress,
        shouldUnlock,
        achievement: shouldUnlock ? achievement : null,
      },
    });
  } catch (error) {
    console.error('Update progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
