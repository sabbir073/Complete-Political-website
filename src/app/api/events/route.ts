import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/events - List published events (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter'); // 'past' or 'upcoming'
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('events')
            .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
            .eq('status', 'published')
            .order('event_date', { ascending: filter === 'upcoming' });

        // Filter by past/upcoming
        if (filter === 'past') {
            query = query.lt('event_date', new Date().toISOString());
        } else if (filter === 'upcoming') {
            query = query.gte('event_date', new Date().toISOString());
        }

        if (category) {
            query = query.eq('category_id', category);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching events:', error);
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
        console.error('Error in GET /api/events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
