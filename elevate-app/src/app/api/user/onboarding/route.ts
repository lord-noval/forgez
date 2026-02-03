import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper to validate age (must be 13+)
function isAtLeast13YearsOld(birthday: string): boolean {
  const birthDate = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
}

// POST /api/user/onboarding - Complete onboarding
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      // Personal info fields
      firstName,
      lastName,
      birthday,
      phoneNumber,
      phoneCountryCode,
      // Existing fields
      worldId,
      headline,
      bio,
      primarySkills,
      industries,
      experienceLevel,
      primaryGoal,
    } = body;

    // Validate required personal info fields
    if (!firstName || !firstName.trim()) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 });
    }
    if (!lastName || !lastName.trim()) {
      return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    }
    if (!birthday) {
      return NextResponse.json({ error: "Birthday is required" }, { status: 400 });
    }
    if (!isAtLeast13YearsOld(birthday)) {
      return NextResponse.json({ error: "You must be at least 13 years old" }, { status: 400 });
    }

    // Build update object
    const updates: Record<string, unknown> = {
      onboarding_completed: true,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birthday: birthday,
    };

    // Optional phone number
    if (phoneNumber) {
      updates.phone_number = phoneNumber;
      updates.phone_country_code = phoneCountryCode || 'US';
    }

    // Optional fields from onboarding
    if (worldId) updates.active_world_id = worldId;
    if (headline) updates.headline = headline;
    if (bio) updates.bio = bio;

    // Update user
    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) throw error;

    // If primary skills were selected, add them to user_skills
    if (primarySkills && Array.isArray(primarySkills) && primarySkills.length > 0) {
      const skillInserts = primarySkills.map((skillId: string, index: number) => ({
        user_id: authUser.id,
        skill_id: skillId,
        proficiency_level: 1,
        verification_level: 'SELF_ASSESSED',
        confidence_score: 0.5,
        evidence_count: 0,
        is_primary: index === 0, // First skill is primary
      }));

      await supabase
        .from("user_skills")
        .upsert(skillInserts, { onConflict: 'user_id,skill_id' });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
