import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET - Get testimonials statistics
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('rating, is_verified, video_url')
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching testimonial stats:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = testimonials?.length || 0;
    const verified = testimonials?.filter(t => t.is_verified).length || 0;
    const withVideo = testimonials?.filter(t => t.video_url).length || 0;
    const averageRating = testimonials?.length
      ? testimonials.filter(t => t.rating).reduce((sum, t) => sum + (t.rating || 0), 0) /
        testimonials.filter(t => t.rating).length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        verified,
        withVideo,
        averageRating: Math.round(averageRating * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error in testimonial stats GET:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    }, { status: 500 });
  }
}
