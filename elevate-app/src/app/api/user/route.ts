import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with world preference
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        world_preference:user_world_preferences(
          world:narrative_worlds(*)
        )
      `)
      .eq("id", authUser.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // If user doesn't exist, they'll be created by the trigger
    // But return the auth user info for now
    if (!user) {
      return NextResponse.json({
        id: authUser.id,
        email: authUser.email,
        username: authUser.user_metadata?.username || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        onboarding_completed: false,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      avatar_url,
      timezone,
      dark_mode,
      reminder_time,
      headline,
      bio,
      location,
      linkedin_url,
      github_url,
      portfolio_url,
      current_role,
      current_company,
      years_experience,
      is_open_to_work,
      job_search_status,
      profile_visibility,
      show_skills_publicly,
      show_projects_publicly,
    } = body;

    const updates: Record<string, unknown> = {};

    // Basic profile fields
    if (username !== undefined) updates.username = username;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (timezone !== undefined) updates.timezone = timezone;
    if (dark_mode !== undefined) updates.dark_mode = dark_mode;
    if (reminder_time !== undefined) updates.reminder_time = reminder_time;

    // Extended profile fields
    if (headline !== undefined) updates.headline = headline;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
    if (github_url !== undefined) updates.github_url = github_url;
    if (portfolio_url !== undefined) updates.portfolio_url = portfolio_url;
    if (current_role !== undefined) updates.current_role = current_role;
    if (current_company !== undefined) updates.current_company = current_company;
    if (years_experience !== undefined) updates.years_experience = years_experience;

    // Job search settings
    if (is_open_to_work !== undefined) updates.is_open_to_work = is_open_to_work;
    if (job_search_status !== undefined) updates.job_search_status = job_search_status;

    // Privacy settings
    if (profile_visibility !== undefined) updates.profile_visibility = profile_visibility;
    if (show_skills_publicly !== undefined) updates.show_skills_publicly = show_skills_publicly;
    if (show_projects_publicly !== undefined) updates.show_projects_publicly = show_projects_publicly;

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", authUser.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
