import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - List public testimonials (approved only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const hasVideo = searchParams.get('has_video');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('testimonials')
      .select(`
        id,
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
        submitted_at,
        testimonial_categories (
          id, name_en, name_bn, slug, icon
        )
      `, { count: 'exact' })
      .eq('status', 'approved')
      .order('display_order', { ascending: true })
      .order('submitted_at', { ascending: false });

    if (category && category !== 'all') {
      const { data: cat } = await supabase
        .from('testimonial_categories')
        .select('id')
        .eq('slug', category)
        .single();
      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (hasVideo === 'true') {
      query = query.not('video_url', 'is', null);
    }

    query = query.range(offset, offset + limit - 1);

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
    console.error('Error in testimonials GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch testimonials'
    }, { status: 500 });
  }
}

// POST - Submit a new testimonial (public)
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
      submitter_email,
      submitter_phone
    } = body;

    if (!person_name_en || !content_en) {
      return NextResponse.json({
        success: false,
        error: 'Name and testimonial content are required'
      }, { status: 400 });
    }

    if (content_en.length > 2000) {
      return NextResponse.json({
        success: false,
        error: 'Testimonial must be less than 2000 characters'
      }, { status: 400 });
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
        submitter_email,
        submitter_phone,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Your testimonial has been submitted and is pending review'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in testimonials POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit testimonial'
    }, { status: 500 });
  }
}
