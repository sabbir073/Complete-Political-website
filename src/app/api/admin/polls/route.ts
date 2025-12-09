import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all polls for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          option_en,
          option_bn,
          display_order,
          vote_count
        ),
        created_by_profile:profiles!polls_created_by_fkey (
          full_name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title_bn.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: polls, error, count } = await query;

    if (error) {
      console.error('Error fetching polls:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Calculate computed status for each poll
    const pollsWithStatus = polls?.map(poll => {
      const now = new Date();
      const start = new Date(poll.start_datetime);
      const end = new Date(poll.end_datetime);

      let computedStatus = poll.status;
      if (poll.status === 'active') {
        if (now < start) {
          computedStatus = 'scheduled';
        } else if (now > end) {
          computedStatus = 'closed';
        }
      }

      // Calculate total votes
      const totalVotes = poll.poll_options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;

      return {
        ...poll,
        computed_status: computedStatus,
        total_votes: totalVotes
      };
    });

    return NextResponse.json({
      success: true,
      data: pollsWithStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in polls GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch polls'
    }, { status: 500 });
  }
}

// POST - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title_en,
      title_bn,
      description_en,
      description_bn,
      start_datetime,
      end_datetime,
      timezone = 'Asia/Dhaka',
      status = 'draft',
      allow_multiple_votes = false,
      show_results_before_end = false,
      require_verification = true,
      options = []
    } = body;

    // Validate required fields
    if (!title_en || !title_bn) {
      return NextResponse.json({
        success: false,
        error: 'Title is required in both English and Bengali'
      }, { status: 400 });
    }

    if (!start_datetime || !end_datetime) {
      return NextResponse.json({
        success: false,
        error: 'Start and end datetime are required'
      }, { status: 400 });
    }

    if (!options || options.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 options are required'
      }, { status: 400 });
    }

    // Validate options have both languages
    for (const opt of options) {
      if (!opt.option_en || !opt.option_bn) {
        return NextResponse.json({
          success: false,
          error: 'Each option must have both English and Bengali text'
        }, { status: 400 });
      }
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title_en,
        title_bn,
        description_en,
        description_bn,
        start_datetime,
        end_datetime,
        timezone,
        status,
        allow_multiple_votes,
        show_results_before_end,
        require_verification,
        created_by: user.id
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      return NextResponse.json({ success: false, error: pollError.message }, { status: 500 });
    }

    // Create options
    const optionsToInsert = options.map((opt: any, index: number) => ({
      poll_id: poll.id,
      option_en: opt.option_en,
      option_bn: opt.option_bn,
      display_order: index
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert);

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      // Delete the poll if options failed
      await supabase.from('polls').delete().eq('id', poll.id);
      return NextResponse.json({ success: false, error: optionsError.message }, { status: 500 });
    }

    // Fetch the complete poll with options
    const { data: completePoll } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          option_en,
          option_bn,
          display_order,
          vote_count
        )
      `)
      .eq('id', poll.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completePoll
    }, { status: 201 });

  } catch (error) {
    console.error('Error in polls POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create poll'
    }, { status: 500 });
  }
}
