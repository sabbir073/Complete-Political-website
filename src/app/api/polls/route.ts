import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all public polls (active and closed)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'closed', or 'all'
    const voterPhoneHash = searchParams.get('voter_hash');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const now = new Date().toISOString();

    // Build query - only show polls that are not draft
    let query = supabase
      .from('polls')
      .select(`
        id,
        title_en,
        title_bn,
        description_en,
        description_bn,
        start_datetime,
        end_datetime,
        timezone,
        status,
        show_results_before_end,
        require_verification,
        created_at,
        poll_options (
          id,
          option_en,
          option_bn,
          display_order,
          vote_count
        )
      `, { count: 'exact' })
      .neq('status', 'draft')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    // Filter by computed status
    if (status === 'active') {
      // Active: current time is between start and end
      query = query.lte('start_datetime', now).gte('end_datetime', now);
    } else if (status === 'closed') {
      // Closed: end time has passed
      query = query.lt('end_datetime', now);
    } else if (status === 'upcoming') {
      // Upcoming: start time is in the future
      query = query.gt('start_datetime', now);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: polls, error, count } = await query;

    if (error) {
      console.error('Error fetching polls:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get voted polls for this user if voter_hash is provided
    let userVotes: { poll_id: string; option_id: string }[] = [];
    if (voterPhoneHash && polls && polls.length > 0) {
      const pollIds = polls.map((p: any) => p.id);
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_id, option_id')
        .eq('voter_phone_hash', voterPhoneHash)
        .in('poll_id', pollIds);
      userVotes = votes || [];
    }

    // Create a map for quick lookup
    const userVotesMap = new Map(userVotes.map(v => [v.poll_id, v.option_id]));

    // Process polls - hide results if poll is still active and show_results_before_end is false
    const processedPolls = polls?.map(poll => {
      const now = new Date();
      const start = new Date(poll.start_datetime);
      const end = new Date(poll.end_datetime);

      // Determine computed status
      let computedStatus: 'upcoming' | 'active' | 'closed' = 'active';
      if (now < start) {
        computedStatus = 'upcoming';
      } else if (now > end) {
        computedStatus = 'closed';
      }

      // Check if user has voted on this poll
      const hasVoted = userVotesMap.has(poll.id);
      const votedOptionId = userVotesMap.get(poll.id) || null;

      // Calculate total votes
      const totalVotes = poll.poll_options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;

      // Show results if: closed, show_results_before_end is true, or user has voted
      const shouldShowResults = computedStatus === 'closed' || poll.show_results_before_end || hasVoted;

      // Sort options by display_order
      const sortedOptions = poll.poll_options?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

      return {
        id: poll.id,
        title_en: poll.title_en,
        title_bn: poll.title_bn,
        description_en: poll.description_en,
        description_bn: poll.description_bn,
        start_datetime: poll.start_datetime,
        end_datetime: poll.end_datetime,
        timezone: poll.timezone,
        require_verification: poll.require_verification,
        show_results_before_end: poll.show_results_before_end,
        created_at: poll.created_at,
        computed_status: computedStatus,
        has_voted: hasVoted,
        voted_option_id: votedOptionId,
        total_votes: shouldShowResults ? totalVotes : 0,
        poll_options: sortedOptions.map((opt: any) => ({
          id: opt.id,
          option_en: opt.option_en,
          option_bn: opt.option_bn,
          display_order: opt.display_order,
          vote_count: shouldShowResults ? opt.vote_count : null,
          percentage: shouldShowResults && totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : null
        }))
      };
    });

    return NextResponse.json({
      success: true,
      data: processedPolls,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in public polls GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch polls'
    }, { status: 500 });
  }
}
