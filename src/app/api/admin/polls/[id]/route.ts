import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get a single poll by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch poll with options and vote details
    const { data: poll, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching poll:', error);
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    // Get vote count per option
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('option_id, voted_at')
      .eq('poll_id', id);

    // Calculate total votes and compute status
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

    const totalVotes = poll.poll_options?.reduce((sum: number, opt: any) => sum + (opt.vote_count || 0), 0) || 0;

    // Sort options by display_order
    if (poll.poll_options) {
      poll.poll_options.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...poll,
        computed_status: computedStatus,
        total_votes: totalVotes,
        votes_detail: votes
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

// PUT - Update a poll
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      timezone,
      status,
      allow_multiple_votes,
      show_results_before_end,
      require_verification,
      options
    } = body;

    // Check if poll exists and get current vote count
    const { data: existingPoll, error: fetchError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (vote_count)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingPoll) {
      return NextResponse.json({ success: false, error: 'Poll not found' }, { status: 404 });
    }

    // Check if poll has votes - if so, restrict certain updates
    const totalVotes = existingPoll.poll_options?.reduce((sum: any, opt: any) => sum + (opt.vote_count || 0), 0) || 0;
    const hasVotes = totalVotes > 0;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title_en !== undefined) updateData.title_en = title_en;
    if (title_bn !== undefined) updateData.title_bn = title_bn;
    if (description_en !== undefined) updateData.description_en = description_en;
    if (description_bn !== undefined) updateData.description_bn = description_bn;
    if (start_datetime !== undefined) updateData.start_datetime = start_datetime;
    if (end_datetime !== undefined) updateData.end_datetime = end_datetime;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (status !== undefined) updateData.status = status;
    if (allow_multiple_votes !== undefined) updateData.allow_multiple_votes = allow_multiple_votes;
    if (show_results_before_end !== undefined) updateData.show_results_before_end = show_results_before_end;
    if (require_verification !== undefined) updateData.require_verification = require_verification;

    // Update poll
    const { error: updateError } = await supabase
      .from('polls')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating poll:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Update options if provided and poll has no votes
    if (options && !hasVotes) {
      // Delete existing options
      await supabase.from('poll_options').delete().eq('poll_id', id);

      // Insert new options
      const optionsToInsert = options.map((opt: any, index: number) => ({
        poll_id: id,
        option_en: opt.option_en,
        option_bn: opt.option_bn,
        display_order: index
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (optionsError) {
        console.error('Error updating poll options:', optionsError);
        return NextResponse.json({ success: false, error: optionsError.message }, { status: 500 });
      }
    } else if (options && hasVotes) {
      // Only update option text, not add/remove options
      for (const opt of options) {
        if (opt.id) {
          await supabase
            .from('poll_options')
            .update({
              option_en: opt.option_en,
              option_bn: opt.option_bn
            })
            .eq('id', opt.id);
        }
      }
    }

    // Fetch updated poll
    const { data: updatedPoll } = await supabase
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
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      data: updatedPoll,
      message: hasVotes && options ? 'Poll updated. Options cannot be added/removed after voting has started.' : 'Poll updated successfully'
    });

  } catch (error) {
    console.error('Error in poll PUT:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update poll'
    }, { status: 500 });
  }
}

// DELETE - Delete a poll
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role - only admin can delete
    const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
    if (!userRole || userRole !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can delete polls' }, { status: 403 });
    }

    // Delete poll (cascade will delete options and votes)
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting poll:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Poll deleted successfully'
    });

  } catch (error) {
    console.error('Error in poll DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete poll'
    }, { status: 500 });
  }
}
