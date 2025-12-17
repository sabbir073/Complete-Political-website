import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List public achievements
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const year = searchParams.get('year');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('achievements')
      .select(`
        *,
        achievement_categories (
          id, name_en, name_bn, slug, icon, color
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('achievement_date', { ascending: false });

    if (category && category !== 'all') {
      const { data: cat } = await supabase
        .from('achievement_categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (year) {
      query = query
        .gte('achievement_date', `${year}-01-01`)
        .lte('achievement_date', `${year}-12-31`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: achievements, error, count } = await query;

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
    console.error('Error in achievements GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch achievements'
    }, { status: 500 });
  }
}
