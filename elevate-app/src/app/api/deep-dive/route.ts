import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const pathType = searchParams.get('path_type');
    const industry = searchParams.get('industry') || 'space';

    // First get a featured epic object for this industry
    const { data: epicObject, error: epicError } = await supabase
      .from('epic_objects')
      .select('id')
      .eq('industry', industry)
      .eq('is_featured', true)
      .limit(1)
      .single();

    if (epicError || !epicObject) {
      // Fallback to any epic object
      const { data: fallbackObject, error: fallbackError } = await supabase
        .from('epic_objects')
        .select('id')
        .eq('industry', industry)
        .limit(1)
        .single();

      if (fallbackError || !fallbackObject) {
        return NextResponse.json({ content: [], questions: [] });
      }
    }

    const epicObjectId = epicObject?.id;

    // Fetch deep dive content
    let contentQuery = supabase
      .from('deep_dive_content')
      .select('*')
      .order('order_index', { ascending: true });

    if (epicObjectId) {
      contentQuery = contentQuery.eq('epic_object_id', epicObjectId);
    }

    if (pathType) {
      contentQuery = contentQuery.eq('path_type', pathType);
    }

    const { data: content, error: contentError } = await contentQuery;

    if (contentError) {
      console.error('Error fetching deep dive content:', contentError);
      return NextResponse.json({ content: [], questions: [] });
    }

    // Fetch quiz questions for this content
    const contentIds = content?.map((c) => c.id) || [];
    let questions: unknown[] = [];

    if (contentIds.length > 0) {
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_questions')
        .select('*')
        .in('deep_dive_id', contentIds)
        .order('order_index', { ascending: true });

      if (!quizError && quizData) {
        questions = quizData;
      }
    }

    return NextResponse.json({
      content: content || [],
      questions,
    });
  } catch (error) {
    console.error('Deep dive API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
