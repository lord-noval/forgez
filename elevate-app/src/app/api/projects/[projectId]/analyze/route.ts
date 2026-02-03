import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'language';
  confidence: number;
  evidence: string;
}

interface AnalysisResult {
  skills: ExtractedSkill[];
  summary: string;
  projectType: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

// POST /api/projects/[projectId]/analyze - Analyze project with AI to extract skills
export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch project with artifacts
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        artifacts:project_artifacts(*)
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Check if Google API key is configured
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      // Return mock analysis when API key is not available
      console.log('GOOGLE_API_KEY not configured, returning mock analysis');

      const mockAnalysis = generateMockAnalysis(project);

      // Store mock results in database
      await storeAnalysisResults(supabase, projectId, mockAnalysis);

      return NextResponse.json({
        analysis: mockAnalysis,
        source: 'mock',
        message: 'AI analysis requires GOOGLE_API_KEY to be configured',
      });
    }

    // Prepare content for analysis
    const contentToAnalyze = prepareProjectContent(project);

    // Call Google Gemini API
    const analysis = await analyzeWithGemini(apiKey, contentToAnalyze);

    // Store results in database
    await storeAnalysisResults(supabase, projectId, analysis);

    return NextResponse.json({
      analysis,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Project analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    );
  }
}

function prepareProjectContent(project: {
  title: string;
  description: string | null;
  project_type: string;
  tags: string[] | null;
  external_url: string | null;
  repository_url: string | null;
  metadata: Record<string, unknown> | null;
  artifacts: Array<{ file_name: string; file_type: string; analysis_result?: unknown }>;
}): string {
  const parts: string[] = [];

  parts.push(`Project Title: ${project.title}`);

  if (project.description) {
    parts.push(`Description: ${project.description}`);
  }

  parts.push(`Project Type: ${project.project_type}`);

  if (project.tags && project.tags.length > 0) {
    parts.push(`Tags: ${project.tags.join(', ')}`);
  }

  if (project.repository_url) {
    parts.push(`Repository: ${project.repository_url}`);
  }

  if (project.external_url) {
    parts.push(`External URL: ${project.external_url}`);
  }

  if (project.metadata) {
    const metaStr = Object.entries(project.metadata)
      .filter(([_, v]) => v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(', ');
    if (metaStr) {
      parts.push(`Additional metadata: ${metaStr}`);
    }
  }

  if (project.artifacts && project.artifacts.length > 0) {
    const artifactInfo = project.artifacts
      .map(a => `${a.file_name} (${a.file_type})`)
      .join(', ');
    parts.push(`Files: ${artifactInfo}`);
  }

  return parts.join('\n');
}

async function analyzeWithGemini(apiKey: string, content: string): Promise<AnalysisResult> {
  const prompt = `Analyze this project and extract skills demonstrated. Return JSON only.

Project Information:
${content}

Return a JSON object with this exact structure:
{
  "skills": [
    {
      "name": "skill name",
      "category": "technical" | "soft" | "tool" | "language",
      "confidence": 0.0-1.0,
      "evidence": "brief explanation of why this skill is identified"
    }
  ],
  "summary": "2-3 sentence summary of the project",
  "projectType": "category of project",
  "complexity": "beginner" | "intermediate" | "advanced"
}

Guidelines:
- Extract 5-15 relevant skills
- Be conservative with confidence scores
- Technical skills: programming languages, frameworks, algorithms, etc.
- Soft skills: communication, teamwork, problem-solving, etc.
- Tools: specific software, platforms, services
- Language: natural languages demonstrated
- Only include skills clearly evidenced by the project`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();

  // Extract JSON from response
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('No content in Gemini response');
  }

  try {
    const analysis = JSON.parse(textContent);
    return analysis as AnalysisResult;
  } catch {
    console.error('Failed to parse Gemini response:', textContent);
    throw new Error('Invalid JSON in Gemini response');
  }
}

function generateMockAnalysis(project: {
  title: string;
  description: string | null;
  project_type: string;
  tags: string[] | null;
}): AnalysisResult {
  const skills: ExtractedSkill[] = [];

  // Generate skills based on project type
  const projectType = project.project_type.toLowerCase();

  if (projectType === 'code' || projectType.includes('software')) {
    skills.push(
      { name: 'Problem Solving', category: 'soft', confidence: 0.85, evidence: 'Demonstrated through project implementation' },
      { name: 'Software Development', category: 'technical', confidence: 0.80, evidence: 'Code-based project' }
    );
  }

  if (projectType === 'design' || projectType.includes('ui')) {
    skills.push(
      { name: 'UI/UX Design', category: 'technical', confidence: 0.75, evidence: 'Design-focused project' },
      { name: 'Visual Communication', category: 'soft', confidence: 0.70, evidence: 'Design artifacts present' }
    );
  }

  // Add skills from tags
  if (project.tags) {
    project.tags.slice(0, 5).forEach(tag => {
      skills.push({
        name: tag,
        category: 'technical',
        confidence: 0.65,
        evidence: `Listed as project tag`,
      });
    });
  }

  // Always add some general skills
  skills.push(
    { name: 'Project Management', category: 'soft', confidence: 0.60, evidence: 'Completed project submission' },
    { name: 'Documentation', category: 'soft', confidence: 0.55, evidence: 'Project description provided' }
  );

  // Determine complexity based on description length and tags
  let complexity: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  const descLength = project.description?.length || 0;
  const tagCount = project.tags?.length || 0;

  if (descLength > 500 || tagCount > 5) {
    complexity = 'advanced';
  } else if (descLength > 200 || tagCount > 2) {
    complexity = 'intermediate';
  }

  return {
    skills: skills.slice(0, 10),
    summary: `This ${project.project_type} project "${project.title}" demonstrates various technical and soft skills. ${project.description?.slice(0, 100) || 'Further analysis requires AI integration.'}`,
    projectType: project.project_type,
    complexity,
  };
}

async function storeAnalysisResults(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  analysis: AnalysisResult
) {
  // Get or create skill taxonomy entries for extracted skills
  for (const skill of analysis.skills) {
    // Check if skill exists in taxonomy
    const { data: existingSkill } = await supabase
      .from('skills_taxonomy')
      .select('id')
      .eq('name', skill.name)
      .single();

    let skillId: string;

    if (existingSkill) {
      skillId = existingSkill.id;
    } else {
      // Create new skill in taxonomy with FORGEZ framework
      const categoryMap: Record<string, string> = {
        technical: 'SKILL',
        soft: 'COMPETENCE',
        tool: 'SKILL',
        language: 'LANGUAGE',
      };

      const { data: newSkill, error: createError } = await supabase
        .from('skills_taxonomy')
        .insert({
          name: skill.name,
          framework: 'FORGEZ',
          category: categoryMap[skill.category] || 'SKILL',
          description: skill.evidence,
        })
        .select('id')
        .single();

      if (createError || !newSkill) {
        console.error('Failed to create skill:', createError);
        continue;
      }

      skillId = newSkill.id;
    }

    // Upsert project skill
    await supabase
      .from('project_skills')
      .upsert({
        project_id: projectId,
        skill_id: skillId,
        confidence_score: skill.confidence,
        evidence_snippets: { evidence: skill.evidence },
        ai_reasoning: skill.evidence,
        is_verified: false,
      }, {
        onConflict: 'project_id,skill_id',
      });
  }

  // Update project metadata with analysis summary
  await supabase
    .from('projects')
    .update({
      metadata: {
        ai_analysis: {
          summary: analysis.summary,
          complexity: analysis.complexity,
          analyzed_at: new Date().toISOString(),
        },
      },
    })
    .eq('id', projectId);
}
