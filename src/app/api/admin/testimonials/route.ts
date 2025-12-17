import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all testimonials (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('testimonials')
      .select(`
        *,
        testimonial_categories (
          id, name_en, name_bn, slug, icon
        )
      `, { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: testimonials, error, count } = await query;

    if (error) {
      console.error('Error fetching testimonials:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in admin testimonials GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch testimonials'
    }, { status: 500 });
  }
}

// POST - Create a new testimonial (admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      category_id,
      person_name_en,
      person_name_bn,
      person_photo,
      location_en,
      location_bn,
      profession_en,
      profession_bn,
      content_en,
      content_bn,
      video_url,
      rating,
      is_verified,
      is_featured,
      status,
      display_order
    } = body;

    if (!person_name_en || !content_en) {
      return NextResponse.json({ success: false, error: 'Name and content are required' }, { status: 400 });
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert({
        category_id: category_id || null,
        person_name_en,
        person_name_bn,
        person_photo,
        location_en,
        location_bn,
        profession_en,
        profession_bn,
        content_en,
        content_bn,
        video_url,
        rating: rating || null,
        is_verified: is_verified || false,
        is_featured: is_featured || false,
        status: status || 'approved',
        display_order: display_order || 0,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .select(`
        *,
        testimonial_categories (
          id, name_en, name_bn, slug, icon
        )
      `)
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: testimonial }, { status: 201 });
  } catch (error) {
    console.error('Error in admin testimonials POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create testimonial'
    }, { status: 500 });
  }
}

// PUT - Update a testimonial
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
    }

    // Convert empty strings to null for UUID and optional fields
    if (updateData.category_id === '') {
      updateData.category_id = null;
    }

    // Convert empty strings to null for other optional fields
    const optionalFields = ['person_photo', 'video_url', 'location_en', 'location_bn', 'profession_en', 'profession_bn', 'person_name_bn', 'content_bn'];
    for (const field of optionalFields) {
      if (updateData[field] === '') {
        updateData[field] = null;
      }
    }

    // If approving, set approved_at
    if (updateData.status === 'approved' && !updateData.approved_at) {
      updateData.approved_at = new Date().toISOString();
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        testimonial_categories (
          id, name_en, name_bn, slug, icon
        )
      `)
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error in admin testimonials PUT:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update testimonial'
    }, { status: 500 });
  }
}

// DELETE - Delete a testimonial
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Testimonial ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error in admin testimonials DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete testimonial'
    }, { status: 500 });
  }
}
