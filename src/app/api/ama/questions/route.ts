import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List public questions (approved/answered only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // category slug
    const status = searchParams.get('status'); // 'answered' or 'pending' (pending = approved but not answered)
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Get voter IP from request headers (server-side)
    const forwarded = request.headers.get('x-forwarded-for');
    const voterIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || null;

    // Build query - only show approved or answered questions (not pending, not flagged)
    let query = supabase
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
      `, { count: 'exact' })
      .in('status', ['approved', 'answered']);

    // Filter by category
    if (category && category !== 'all') {
      // Get category ID by slug
      const { data: categoryData } = await supabase
        .from('ama_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    // Filter by status
    if (status === 'answered') {
      query = query.eq('status', 'answered');
    } else if (status === 'pending') {
      query = query.eq('status', 'approved'); // approved but not yet answered
    }

    // Search in question text
    if (search) {
      query = query.or(`question_en.ilike.%${search}%,question_bn.ilike.%${search}%`);
    }

    // Order by date (newest first), then by upvotes
    query = query
      .order('created_at', { ascending: false })
      .order('upvotes', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: questions, error, count } = await query;

    if (error) {
      console.error('Error fetching AMA questions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get user's votes if IP is provided (both question and answer votes)
    let userVotes: { question_id: string; vote_type: string; vote_target: string }[] = [];
    if (voterIp && questions && questions.length > 0) {
      const questionIds = questions.map((q: any) => q.id);
      const { data: votes } = await supabase
        .from('ama_votes')
        .select('question_id, vote_type, vote_target')
        .eq('voter_ip', voterIp)
        .in('question_id', questionIds);
      userVotes = votes || [];
    }

    // Create maps for quick lookup (separate for question and answer votes)
    const userQuestionVotesMap = new Map(
      userVotes.filter(v => v.vote_target === 'question').map(v => [v.question_id, v.vote_type])
    );
    const userAnswerVotesMap = new Map(
      userVotes.filter(v => v.vote_target === 'answer').map(v => [v.question_id, v.vote_type])
    );

    // Process questions
    const processedQuestions = questions?.map((q: any) => ({
      ...q,
      user_vote: userQuestionVotesMap.get(q.id) || null,
      user_answer_vote: userAnswerVotesMap.get(q.id) || null,
      // Hide submitter info if anonymous
      submitter_name_en: q.is_anonymous ? null : q.submitter_name_en,
      submitter_name_bn: q.is_anonymous ? null : q.submitter_name_bn,
      submitter_address_en: q.is_anonymous ? null : q.submitter_address_en,
      submitter_address_bn: q.is_anonymous ? null : q.submitter_address_bn,
    }));

    return NextResponse.json({
      success: true,
      data: processedQuestions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in AMA questions GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch questions'
    }, { status: 500 });
  }
}

// POST - Submit a new question (public)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      category_id,
      submitter_name,
      submitter_address,
      question,
      is_anonymous = false
    } = body;

    // Validate required fields
    if (!question || question.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 });
    }

    if (question.length > 2000) {
      return NextResponse.json({
        success: false,
        error: 'Question must be less than 2000 characters'
      }, { status: 400 });
    }

    // Get submitter IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    // If not anonymous, name is required
    if (!is_anonymous && (!submitter_name || submitter_name.trim().length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'Name is required (or submit anonymously)'
      }, { status: 400 });
    }

    // Create question - store in question_en for now, admin will translate
    const { data: newQuestion, error } = await supabase
      .from('ama_questions')
      .insert({
        category_id: category_id || null,
        submitter_name_en: is_anonymous ? null : submitter_name?.trim(),
        submitter_address_en: is_anonymous ? null : submitter_address?.trim(),
        question_en: question.trim(),
        is_anonymous,
        submitter_ip: ip,
        status: 'pending' // Admin must review before publishing
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AMA question:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newQuestion,
      message: 'Your question has been submitted and is pending review'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in AMA questions POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit question'
    }, { status: 500 });
  }
}
