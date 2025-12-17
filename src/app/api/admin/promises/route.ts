import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all promises (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const { data: promises, error, count } = await supabase
      .from('promises')
      .select(`
        *,
        promise_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `, { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching promises:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: promises,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in admin promises GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch promises'
    }, { status: 500 });
  }
}

// POST - Create a new promise
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      category_id,
      title_en,
      title_bn,
      description_en,
      description_bn,
      target_date,
      status,
      progress,
      priority,
      featured,
      featured_image,
      display_order
    } = body;

    if (!title_en) {
      return NextResponse.json({ success: false, error: 'Title (English) is required' }, { status: 400 });
    }

    const { data: promise, error } = await supabase
      .from('promises')
      .insert({
        category_id: category_id || null,
        title_en,
        title_bn,
        description_en,
        description_bn,
        target_date: target_date || null,
        status: status || 'not_started',
        progress: progress || 0,
        priority: priority || 'medium',
        featured: featured || false,
        featured_image,
        display_order: display_order || 0
      })
      .select(`
        *,
        promise_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating promise:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: promise }, { status: 201 });
  } catch (error) {
    console.error('Error in admin promises POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create promise'
    }, { status: 500 });
  }
}

// PUT - Update a promise
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promise ID is required' }, { status: 400 });
    }

    // If status is completed, set completion_date
    if (updateData.status === 'completed' && !updateData.completion_date) {
      updateData.completion_date = new Date().toISOString().split('T')[0];
      updateData.progress = 100;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: promise, error } = await supabase
      .from('promises')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        promise_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `)
      .single();

    if (error) {
      console.error('Error updating promise:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: promise });
  } catch (error) {
    console.error('Error in admin promises PUT:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update promise'
    }, { status: 500 });
  }
}

// DELETE - Delete a promise
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promise ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('promises')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promise:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Promise deleted successfully' });
  } catch (error) {
    console.error('Error in admin promises DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete promise'
    }, { status: 500 });
  }
}
