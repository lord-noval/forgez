import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface LearningResource {
  id: string;
  title: string;
  provider: string;
  description: string | null;
  url: string;
  duration: string | null;
  level: string | null;
  industry: string | null;
  skill_ids: string[] | null;
  rating: number | null;
  enrollments: string | null;
  featured: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  provider: string;
  description: string | null;
  url: string;
  duration: string | null;
  level: string | null;
  industry: string | null;
  skills: string[];
  rating: number | null;
  enrollments: string | null;
  featured: boolean;
  relevanceScore: number;
  reason: string;
}

// GET /api/learn/recommendations - Get personalized learning recommendations
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user (optional for public access)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const level = searchParams.get("level");
    const featured = searchParams.get("featured") === "true";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query for learning resources
    let query = supabase
      .from("learning_resources")
      .select("*")
      .order("featured", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false });

    // Apply filters
    if (industry) {
      query = query.eq("industry", industry);
    }

    if (level) {
      query = query.eq("level", level);
    }

    if (featured) {
      query = query.eq("featured", true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: resources, error: resourcesError } = await query;

    if (resourcesError) {
      console.error("Error fetching learning resources:", resourcesError);
      return NextResponse.json(
        { error: "Failed to fetch learning resources" },
        { status: 500 }
      );
    }

    // Get user's archetype and domain interest if authenticated
    let userDomain: string | null = null;
    let userArchetype: string | null = null;

    if (user) {
      const { data: archetypeData } = await supabase
        .from("user_archetypes")
        .select("archetype, domain_interest")
        .eq("user_id", user.id)
        .single();

      if (archetypeData) {
        userDomain = archetypeData.domain_interest;
        userArchetype = archetypeData.archetype;
      }

      // Get user's learning progress to filter out completed courses
      const { data: progressData } = await supabase
        .from("user_learning_progress")
        .select("resource_id, status")
        .eq("user_id", user.id);

      const completedResourceIds = new Set(
        progressData
          ?.filter((p) => p.status === "completed")
          .map((p) => p.resource_id) || []
      );

      const inProgressResourceIds = new Set(
        progressData
          ?.filter((p) => p.status === "in_progress")
          .map((p) => p.resource_id) || []
      );

      // Transform resources to recommendations with personalization
      const recommendations: Recommendation[] = (resources || [])
        .filter((r: LearningResource) => !completedResourceIds.has(r.id))
        .map((resource: LearningResource) => {
          let relevanceScore = 0.5; // Base score
          let reason = "Recommended for your learning journey";

          // Boost score for matching industry
          if (userDomain && resource.industry === userDomain) {
            relevanceScore += 0.25;
            reason = `Matches your interest in ${userDomain}`;
          }

          // Boost featured courses
          if (resource.featured) {
            relevanceScore += 0.1;
          }

          // Boost highly rated courses
          if (resource.rating && resource.rating >= 4.5) {
            relevanceScore += 0.1;
          }

          // Boost in-progress courses
          if (inProgressResourceIds.has(resource.id)) {
            relevanceScore += 0.15;
            reason = "Continue your learning";
          }

          // Cap relevance score at 1.0
          relevanceScore = Math.min(relevanceScore, 1.0);

          return {
            id: resource.id,
            title: resource.title,
            provider: resource.provider,
            description: resource.description,
            url: resource.url,
            duration: resource.duration,
            level: resource.level,
            industry: resource.industry,
            skills: [], // Skills would be populated from skill_ids lookup
            rating: resource.rating,
            enrollments: resource.enrollments,
            featured: resource.featured,
            relevanceScore: Math.round(relevanceScore * 100) / 100,
            reason,
          };
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      return NextResponse.json({
        recommendations,
        total: recommendations.length,
        userDomain,
        userArchetype,
      });
    }

    // For unauthenticated users, return resources without personalization
    const recommendations: Recommendation[] = (resources || []).map(
      (resource: LearningResource) => ({
        id: resource.id,
        title: resource.title,
        provider: resource.provider,
        description: resource.description,
        url: resource.url,
        duration: resource.duration,
        level: resource.level,
        industry: resource.industry,
        skills: [],
        rating: resource.rating,
        enrollments: resource.enrollments,
        featured: resource.featured,
        relevanceScore: resource.featured ? 0.9 : 0.5,
        reason: resource.featured
          ? "Featured course"
          : "Popular learning resource",
      })
    );

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error("Error fetching learning recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
