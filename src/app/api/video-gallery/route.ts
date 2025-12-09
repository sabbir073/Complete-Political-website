import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/video-gallery - List published videos (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') || '6');

        let query = supabase
            .from('video_gallery')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category_id', category);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching videos:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/video-gallery:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
