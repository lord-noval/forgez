import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/skills - Get skills taxonomy summary with user's skills
// For detailed taxonomy browsing, use /api/skills/taxonomy
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's skills with taxonomy data
    const { data: userSkills, error: userSkillsError } = await supabase
      .from("user_skills")
      .select(`
        *,
        skill:skills_taxonomy(*)
      `)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (userSkillsError) throw userSkillsError;

    // Get skill categories summary from taxonomy
    const { data: categories, error: categoriesError } = await supabase
      .from("skills_taxonomy")
      .select("category")
      .eq("is_active", true);

    if (categoriesError) throw categoriesError;

    // Count skills by category
    const categoryCounts = categories?.reduce((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate user's skill stats
    const stats = {
      totalSkills: userSkills?.length || 0,
      verifiedSkills: userSkills?.filter(s =>
        s.verification_level !== 'SELF_ASSESSED'
      ).length || 0,
      primarySkills: userSkills?.filter(s => s.is_primary).length || 0,
      averageProficiency: userSkills?.length
        ? Math.round(
            userSkills.reduce((sum, s) => sum + (s.proficiency_level || 0), 0) /
            userSkills.length
          )
        : 0,
    };

    return NextResponse.json({
      userSkills: userSkills || [],
      categoryCounts,
      stats,
    });
  } catch (error) {
    console.error("Failed to get skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
