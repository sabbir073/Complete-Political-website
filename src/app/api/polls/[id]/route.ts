import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get a single poll by ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get phone hash from query to check if user already voted
    const { searchParams } = new URL(request.url);
    const voterPhoneHash = searchParams.get('voter_hash');

    // Fetch poll with options
    const { data: poll, error } = await supabase
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
      `)
      .eq('id', id)
      .neq('status', 'draft')
      .neq('status', 'archived')
      .single();

    if (error || !poll) {
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    // Check if user already voted
    let hasVoted = false;
    let votedOptionId: string | null = null;

    if (voterPhoneHash) {
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', id)
        .eq('voter_phone_hash', voterPhoneHash)
        .single();

      if (existingVote) {
        hasVoted = true;
        votedOptionId = existingVote.option_id;
      }
    }

    // Determine computed status
    const now = new Date();
    const start = new Date(poll.start_datetime);
    const end = new Date(poll.end_datetime);

    let computedStatus: 'upcoming' | 'active' | 'closed' = 'active';
    if (now < start) {
      computedStatus = 'upcoming';
    } else if (now > end) {
      computedStatus = 'closed';
    }

    // Calculate total votes
    const totalVotes = poll.poll_options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;

    // Determine if results should be shown
    // Show results if:
    // 1. Poll is closed, OR
    // 2. Poll allows showing results before end, OR
    // 3. User has already voted
    const shouldShowResults = computedStatus === 'closed' || poll.show_results_before_end || hasVoted;

    // Sort options by display_order
    const sortedOptions = poll.poll_options?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

    return NextResponse.json({
      success: true,
      data: {
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
        can_vote: computedStatus === 'active' && !hasVoted,
        has_voted: hasVoted,
        voted_option_id: votedOptionId,
        total_votes: shouldShowResults ? totalVotes : 0,
        poll_options: sortedOptions.map((opt: any) => ({
          id: opt.id,
          option_en: opt.option_en,
          option_bn: opt.option_bn,
          display_order: opt.display_order,
          vote_count: shouldShowResults ? opt.vote_count : null,
          percentage: shouldShowResults && totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : null,
          is_voted: opt.id === votedOptionId
        }))
      }
    });

  } catch (error) {
    console.error('Error in poll GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch poll'
    }, { status: 500 });
  }
}
