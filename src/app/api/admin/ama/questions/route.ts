import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all questions (admin - includes all statuses)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, answered, flagged, all
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('ama_questions')
      .select(`
        *,
        ama_categories (
          id,
          name_en,
          name_bn,
          slug,
          icon
        ),
        answered_by_profile:profiles!ama_questions_answered_by_fkey (
          id,
          full_name,
          email
        )
      `, { count: 'exact' });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Search
    if (search) {
      query = query.or(`question_en.ilike.%${search}%,question_bn.ilike.%${search}%,submitter_name_en.ilike.%${search}%`);
    }

    // Order - newest first (last submitted showing first)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: questions, error, count } = await query;

    if (error) {
      console.error('Error fetching AMA questions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get stats
    const { data: stats } = await supabase
      .from('ama_questions')
      .select('status')
      .then(result => {
        if (result.error) return { data: null };
        const statCounts = {
          total: result.data?.length || 0,
          pending: result.data?.filter(q => q.status === 'pending').length || 0,
          approved: result.data?.filter(q => q.status === 'approved').length || 0,
          answered: result.data?.filter(q => q.status === 'answered').length || 0,
          flagged: result.data?.filter(q => q.status === 'flagged').length || 0
        };
        return { data: statCounts };
      });

    return NextResponse.json({
      success: true,
      data: questions,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in admin AMA questions GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch questions'
    }, { status: 500 });
  }
}
