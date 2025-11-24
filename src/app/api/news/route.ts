import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/news - List published news (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('news')
            .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (category) {
            query = query.eq('category_id', category);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching news:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('Error in GET /api/news:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
