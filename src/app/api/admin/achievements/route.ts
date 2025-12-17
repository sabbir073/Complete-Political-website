import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List all achievements (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const { data: achievements, error, count } = await supabase
      .from('achievements')
      .select(`
        *,
        achievement_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `, { count: 'exact' })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching achievements:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: achievements,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in admin achievements GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch achievements'
    }, { status: 500 });
  }
}

// POST - Create a new achievement
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
      achievement_date,
      location_en,
      location_bn,
      impact_metrics,
      featured_image,
      images,
      videos,
      news_links,
      featured,
      display_order
    } = body;

    if (!title_en) {
      return NextResponse.json({ success: false, error: 'Title (English) is required' }, { status: 400 });
    }

    const { data: achievement, error } = await supabase
      .from('achievements')
      .insert({
        category_id: category_id || null,
        title_en,
        title_bn,
        description_en,
        description_bn,
        achievement_date: achievement_date || null,
        location_en,
        location_bn,
        impact_metrics: impact_metrics || {},
        featured_image,
        images: images || [],
        videos: videos || [],
        news_links: news_links || [],
        featured: featured || false,
        display_order: display_order || 0
      })
      .select(`
        *,
        achievement_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: achievement }, { status: 201 });
  } catch (error) {
    console.error('Error in admin achievements POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create achievement'
    }, { status: 500 });
  }
}

// PUT - Update an achievement
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Achievement ID is required' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: achievement, error } = await supabase
      .from('achievements')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        achievement_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `)
      .single();

    if (error) {
      console.error('Error updating achievement:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: achievement });
  } catch (error) {
    console.error('Error in admin achievements PUT:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update achievement'
    }, { status: 500 });
  }
}

// DELETE - Delete an achievement
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Achievement ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting achievement:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error in admin achievements DELETE:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete achievement'
    }, { status: 500 });
  }
}
