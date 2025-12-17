import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List updates for a promise
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const promiseId = searchParams.get('promise_id');

    if (!promiseId) {
      return NextResponse.json({ success: false, error: 'Promise ID is required' }, { status: 400 });
    }

    const { data: updates, error } = await supabase
      .from('promise_updates')
      .select('*')
      .eq('promise_id', promiseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promise updates:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error('Error in promise updates GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch updates'
    }, { status: 500 });
  }
}

// POST - Create a new update
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      promise_id,
      title_en,
      title_bn,
      description_en,
      description_bn,
      progress_change,
      new_progress,
      images,
      documents,
      news_link
    } = body;

    if (!promise_id || !title_en) {
      return NextResponse.json({ success: false, error: 'Promise ID and title are required' }, { status: 400 });
    }

    // Create the update
    const { data: update, error } = await supabase
      .from('promise_updates')
      .insert({
        promise_id,
        title_en,
        title_bn,
        description_en,
        description_bn,
        progress_change: progress_change || 0,
        new_progress,
        images: images || [],
        documents: documents || [],
        news_link
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promise update:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update the promise progress if new_progress is provided
    if (new_progress !== undefined) {
      const updateData: { progress: number; status?: string; completion_date?: string; updated_at: string } = {
        progress: new_progress,
        updated_at: new Date().toISOString()
      };

      if (new_progress >= 100) {
        updateData.status = 'completed';
        updateData.completion_date = new Date().toISOString().split('T')[0];
      } else if (new_progress > 0) {
        updateData.status = 'in_progress';
      }

      await supabase
        .from('promises')
        .update(updateData)
        .eq('id', promise_id);
    }

    return NextResponse.json({ success: true, data: update }, { status: 201 });
  } catch (error) {
    console.error('Error in promise updates POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create update'
    }, { status: 500 });
  }
}

// DELETE - Delete an update
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Update ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('promise_updates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting update:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Error in promise updates DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete update'
    }, { status: 500 });
  }
}
