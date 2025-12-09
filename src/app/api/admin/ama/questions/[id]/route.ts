import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get single question details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: question, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error || !question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('Error in admin AMA question GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch question'
    }, { status: 500 });
  }
}

// PATCH - Update question (edit, approve, answer, flag)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const {
      category_id,
      submitter_name_en,
      submitter_name_bn,
      submitter_address_en,
      submitter_address_bn,
      question_en,
      question_bn,
      answer_en,
      answer_bn,
      status,
      admin_notes,
      is_anonymous
    } = body;

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (category_id !== undefined) updateData.category_id = category_id;
    if (submitter_name_en !== undefined) updateData.submitter_name_en = submitter_name_en;
    if (submitter_name_bn !== undefined) updateData.submitter_name_bn = submitter_name_bn;
    if (submitter_address_en !== undefined) updateData.submitter_address_en = submitter_address_en;
    if (submitter_address_bn !== undefined) updateData.submitter_address_bn = submitter_address_bn;
    if (question_en !== undefined) updateData.question_en = question_en;
    if (question_bn !== undefined) updateData.question_bn = question_bn;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous;

    // Handle answer
    if (answer_en !== undefined || answer_bn !== undefined) {
      if (answer_en !== undefined) updateData.answer_en = answer_en;
      if (answer_bn !== undefined) updateData.answer_bn = answer_bn;

      // If providing an answer, mark as answered
      if ((answer_en && answer_en.trim()) || (answer_bn && answer_bn.trim())) {
        updateData.status = 'answered';
        updateData.answered_at = new Date().toISOString();
        updateData.answered_by = user.id;
      }
    }

    // Handle status change
    if (status !== undefined) {
      updateData.status = status;

      // If changing to answered, require answer content
      if (status === 'answered') {
        const { data: existingQ } = await supabase
          .from('ama_questions')
          .select('answer_en, answer_bn')
          .eq('id', id)
          .single();

        if (!existingQ?.answer_en && !existingQ?.answer_bn && !answer_en && !answer_bn) {
          return NextResponse.json({
            success: false,
            error: 'Cannot mark as answered without providing an answer'
          }, { status: 400 });
        }

        if (!updateData.answered_at) {
          updateData.answered_at = new Date().toISOString();
          updateData.answered_by = user.id;
        }
      }
    }

    const { data: updated, error } = await supabase
      .from('ama_questions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        ama_categories (
          id,
          name_en,
          name_bn,
          slug,
          icon
        )
      `)
      .single();

    if (error) {
      console.error('Error updating AMA question:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('Error in admin AMA question PATCH:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update question'
    }, { status: 500 });
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from('ama_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting AMA question:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Error in admin AMA question DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete question'
    }, { status: 500 });
  }
}
