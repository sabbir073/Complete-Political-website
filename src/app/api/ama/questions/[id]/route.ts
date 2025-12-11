import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get a single question by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: question, error } = await supabase
      .from('ama_questions')
      .select(`
        id,
        category_id,
        submitter_name_en,
        submitter_name_bn,
        submitter_address_en,
        submitter_address_bn,
        is_anonymous,
        question_en,
        question_bn,
        answer_en,
        answer_bn,
        answered_at,
        status,
        upvotes,
        downvotes,
        answer_upvotes,
        answer_downvotes,
        created_at,
        ama_categories (
          id,
          name_en,
          name_bn,
          slug,
          icon
        )
      `)
      .eq('id', id)
      .in('status', ['approved', 'answered'])
      .single();

    if (error || !question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Process question - hide submitter info if anonymous
    const processedQuestion = {
      ...question,
      submitter_name_en: question.is_anonymous ? null : question.submitter_name_en,
      submitter_name_bn: question.is_anonymous ? null : question.submitter_name_bn,
      submitter_address_en: question.is_anonymous ? null : question.submitter_address_en,
      submitter_address_bn: question.is_anonymous ? null : question.submitter_address_bn,
    };

    return NextResponse.json({
      success: true,
      data: processedQuestion,
    });
  } catch (error) {
    console.error('Error fetching AMA question:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch question',
      },
      { status: 500 }
    );
  }
}
