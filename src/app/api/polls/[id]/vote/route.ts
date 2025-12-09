import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Submit a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const { option_id, voter_phone_hash } = body;

    // Validate required fields
    if (!option_id) {
      return NextResponse.json({
        success: false,
        error: 'Option ID is required'
      }, { status: 400 });
    }

    if (!voter_phone_hash) {
      return NextResponse.json({
        success: false,
        error: 'Phone verification is required to vote'
      }, { status: 400 });
    }

    // Fetch the poll to check if voting is allowed
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        id,
        start_datetime,
        end_datetime,
        status,
        require_verification,
        poll_options (id)
      `)
      .eq('id', pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    // Check poll status
    if (poll.status === 'draft' || poll.status === 'archived') {
      return NextResponse.json({ success: false, error: 'This poll is not available for voting' }, { status: 400 });
    }

    // Check if poll is within voting period
    const now = new Date();
    const start = new Date(poll.start_datetime);
    const end = new Date(poll.end_datetime);

    if (now < start) {
      return NextResponse.json({ success: false, error: 'Voting has not started yet' }, { status: 400 });
    }

    if (now > end) {
      return NextResponse.json({ success: false, error: 'Voting has ended for this poll' }, { status: 400 });
    }

    // Verify option belongs to this poll
    const validOptionIds = poll.poll_options?.map((opt: any) => opt.id) || [];
    if (!validOptionIds.includes(option_id)) {
      return NextResponse.json({ success: false, error: 'Invalid option for this poll' }, { status: 400 });
    }

    // Check if user already voted (using phone hash)
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id, option_id')
      .eq('poll_id', pollId)
      .eq('voter_phone_hash', voter_phone_hash)
      .single();

    if (existingVote) {
      return NextResponse.json({
        success: false,
        error: 'You have already voted in this poll',
        already_voted: true,
        voted_option_id: existingVote.option_id
      }, { status: 400 });
    }

    // Get voter IP and user agent for additional tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const voterIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Insert vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: option_id,
        voter_phone_hash: voter_phone_hash,
        voter_ip: voterIp,
        user_agent: userAgent.substring(0, 500) // Limit user agent length
      });

    if (voteError) {
      console.error('Error inserting vote:', voteError);

      // Check if it's a unique constraint violation
      if (voteError.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'You have already voted in this poll',
          already_voted: true
        }, { status: 400 });
      }

      return NextResponse.json({ success: false, error: 'Failed to record vote' }, { status: 500 });
    }

    // Fetch updated poll results
    const { data: updatedPoll } = await supabase
      .from('polls')
      .select(`
        poll_options (
          id,
          option_en,
          option_bn,
          display_order,
          vote_count
        )
      `)
      .eq('id', pollId)
      .single();

    const totalVotes = updatedPoll?.poll_options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;
    const sortedOptions = updatedPoll?.poll_options?.sort((a: any, b: any) => a.display_order - b.display_order) || [];

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voted_option_id: option_id,
        total_votes: totalVotes,
        options: sortedOptions.map((opt: any) => ({
          id: opt.id,
          option_en: opt.option_en,
          option_bn: opt.option_bn,
          vote_count: opt.vote_count,
          percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
          is_voted: opt.id === option_id
        }))
      }
    });

  } catch (error) {
    console.error('Error in vote POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote'
    }, { status: 500 });
  }
}

// GET - Check if user has voted
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const voterPhoneHash = searchParams.get('voter_hash');

    if (!voterPhoneHash) {
      return NextResponse.json({
        success: true,
        has_voted: false
      });
    }

    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id, option_id, voted_at')
      .eq('poll_id', pollId)
      .eq('voter_phone_hash', voterPhoneHash)
      .single();

    return NextResponse.json({
      success: true,
      has_voted: !!existingVote,
      voted_option_id: existingVote?.option_id || null,
      voted_at: existingVote?.voted_at || null
    });

  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check vote status'
    }, { status: 500 });
  }
}
