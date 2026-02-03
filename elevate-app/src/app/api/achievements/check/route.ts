import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AchievementTrigger } from '@/types/achievements';

interface CheckRequestBody {
  trigger: AchievementTrigger;
  data?: Record<string, unknown>;
}

// POST /api/achievements/check - Check and unlock achievements based on trigger
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

    const body: CheckRequestBody = await request.json();
    const { trigger, data = {} } = body;

    if (!trigger) {
      return NextResponse.json(
        { error: 'Trigger is required' },
        { status: 400 }
      );
    }

    // Get all achievement definitions that match this trigger
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .contains('criteria', { trigger });

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    // Get user's already unlocked achievements
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const unlockedIds = new Set(unlockedAchievements?.map((ua) => ua.achievement_id) ?? []);

    // Get user's current progress
    const { data: progressData } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', user.id);

    const progressMap = new Map(progressData?.map((p) => [p.achievement_id, p]) ?? []);

    const newUnlocks: Array<{ achievement: typeof achievements[0]; xpAwarded: number }> = [];
    const progressUpdates: Array<{ achievementId: string; currentValue: number; targetValue: number }> = [];

    // Check each achievement
    for (const achievement of achievements ?? []) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      const criteria = achievement.criteria as {
        trigger: string;
        targetValue?: number;
        conditions?: Record<string, unknown>;
      };

      // Check conditions
      let conditionsMet = true;
      if (criteria.conditions) {
        for (const [key, value] of Object.entries(criteria.conditions)) {
          if (key === 'questNumber' && data.questNumber !== value) {
            conditionsMet = false;
            break;
          }
          if (key === 'level' && (data.level as number) < (value as number)) {
            conditionsMet = false;
            break;
          }
          if (key === 'xpThreshold' && (data.totalXP as number) < (value as number)) {
            conditionsMet = false;
            break;
          }
          if (key === 'archetype' && data.archetype !== value) {
            conditionsMet = false;
            break;
          }
          if (key === 'earlyAdopter' && !data.earlyAdopter) {
            conditionsMet = false;
            break;
          }
        }
      }

      if (!conditionsMet) {
        continue;
      }

      // Check progress-based achievements
      if (criteria.targetValue !== undefined) {
        const existingProgress = progressMap.get(achievement.id);
        const currentValue = existingProgress?.current_value ?? 0;

        // For progress-based achievements, we need to increment progress
        // The data should contain the increment amount or the new value
        const incrementBy = (data.incrementBy as number) ?? 1;
        const newValue = currentValue + incrementBy;

        // Update progress
        progressUpdates.push({
          achievementId: achievement.id,
          currentValue: Math.min(newValue, criteria.targetValue),
          targetValue: criteria.targetValue,
        });

        // Check if we've reached the target
        if (newValue >= criteria.targetValue) {
          newUnlocks.push({
            achievement,
            xpAwarded: achievement.xp_reward,
          });
        }
      } else {
        // Non-progress achievement - unlock immediately
        newUnlocks.push({
          achievement,
          xpAwarded: achievement.xp_reward,
        });
      }
    }

    // Apply progress updates
    for (const update of progressUpdates) {
      await supabase
        .from('achievement_progress')
        .upsert(
          {
            user_id: user.id,
            achievement_id: update.achievementId,
            current_value: update.currentValue,
            target_value: update.targetValue,
          },
          {
            onConflict: 'user_id,achievement_id',
          }
        );
    }

    // Unlock new achievements
    for (const unlock of newUnlocks) {
      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: unlock.achievement.id,
        notified: false,
      });
    }

    return NextResponse.json({
      data: {
        unlocked: newUnlocks,
        progressUpdated: progressUpdates,
        totalUnlocked: newUnlocks.length,
        totalXpAwarded: newUnlocks.reduce((sum, u) => sum + u.xpAwarded, 0),
      },
    });
  } catch (error) {
    console.error('Check achievements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
