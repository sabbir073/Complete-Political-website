import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST - Vote on a question or answer (upvote/downvote with toggle behavior)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { question_id, vote_type, vote_target = 'question' } = body;

    // Validate
    if (!question_id) {
      return NextResponse.json({ success: false, error: 'Question ID is required' }, { status: 400 });
    }

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json({ success: false, error: 'Vote type must be upvote or downvote' }, { status: 400 });
    }

    if (!['question', 'answer'].includes(vote_target)) {
      return NextResponse.json({ success: false, error: 'Vote target must be question or answer' }, { status: 400 });
    }

    // Get voter IP
    const forwarded = request.headers.get('x-forwarded-for');
    const voterIp = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    if (voterIp === 'unknown') {
      return NextResponse.json({ success: false, error: 'Could not determine voter identity' }, { status: 400 });
    }

    // Check if question exists and is public
    const { data: question, error: questionError } = await supabase
      .from('ama_questions')
      .select('id, status, upvotes, downvotes, answer_upvotes, answer_downvotes, answer_en, answer_bn')
      .eq('id', question_id)
      .in('status', ['approved', 'answered'])
      .single();

    if (questionError || !question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    // If voting on answer, check that answer exists
    if (vote_target === 'answer' && !question.answer_en && !question.answer_bn) {
      return NextResponse.json({ success: false, error: 'Cannot vote on answer - no answer exists' }, { status: 400 });
    }

    // Check existing vote for this target (question or answer)
    const { data: existingVote } = await supabase
      .from('ama_votes')
      .select('id, vote_type')
      .eq('question_id', question_id)
      .eq('voter_ip', voterIp)
      .eq('vote_target', vote_target)
      .single();

    // Determine which vote counts to update based on target
    const isAnswerVote = vote_target === 'answer';
    let newUpvotes = isAnswerVote ? (question.answer_upvotes || 0) : question.upvotes;
    let newDownvotes = isAnswerVote ? (question.answer_downvotes || 0) : question.downvotes;
    let action: 'added' | 'removed' | 'changed' = 'added';
    let newVoteType: string | null = vote_type;

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Same vote type - remove the vote (toggle off)
        const { error: deleteError } = await supabase
          .from('ama_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Error removing vote:', deleteError);
          return NextResponse.json({ success: false, error: 'Failed to remove vote' }, { status: 500 });
        }

        // Update counts
        if (vote_type === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        action = 'removed';
        newVoteType = null;
      } else {
        // Different vote type - change the vote
        const { error: updateError } = await supabase
          .from('ama_votes')
          .update({ vote_type })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Error changing vote:', updateError);
          return NextResponse.json({ success: false, error: 'Failed to change vote' }, { status: 500 });
        }

        // Update counts - remove old, add new
        if (existingVote.vote_type === 'upvote') {
          newUpvotes = Math.max(0, newUpvotes - 1);
          newDownvotes = newDownvotes + 1;
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
          newUpvotes = newUpvotes + 1;
        }
        action = 'changed';
      }
    } else {
      // No existing vote - create new
      const { error: insertError } = await supabase
        .from('ama_votes')
        .insert({
          question_id,
          voter_ip: voterIp,
          vote_type,
          vote_target
        });

      if (insertError) {
        console.error('Error adding vote:', insertError);
        return NextResponse.json({ success: false, error: 'Failed to add vote' }, { status: 500 });
      }

      // Update counts
      if (vote_type === 'upvote') {
        newUpvotes = newUpvotes + 1;
      } else {
        newDownvotes = newDownvotes + 1;
      }
    }

    // Update question/answer vote counts based on target
    const updateData = isAnswerVote
      ? { answer_upvotes: newUpvotes, answer_downvotes: newDownvotes }
      : { upvotes: newUpvotes, downvotes: newDownvotes };

    const { error: updateError } = await supabase
      .from('ama_questions')
      .update(updateData)
      .eq('id', question_id);

    if (updateError) {
      console.error('Error updating vote counts:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        vote_target,
        user_vote: newVoteType,
        upvotes: newUpvotes,
        downvotes: newDownvotes
      }
    });

  } catch (error) {
    console.error('Error in AMA vote POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process vote'
    }, { status: 500 });
  }
}
