import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/events - List all events with filtering
// POST /api/admin/events - Create new event
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('events')
            .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
            .order('event_date', { ascending: false });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (category) {
            query = query.eq('category_id', category);
        }
        if (search) {
            query = query.or(`title_en.ilike.%${search}%,title_bn.ilike.%${search}%`);
        }

        // Apply pagination
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
        console.error('Error in GET /api/admin/events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.title_en || !body.title_bn || !body.description_en || !body.description_bn || !body.event_date || !body.slug) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug is unique
        const { data: existingSlug } = await supabase
            .from('events')
            .select('id')
            .eq('slug', body.slug)
            .single();

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        // Helper function to convert datetime-local to proper ISO string
        // datetime-local gives format: "2025-11-29T14:30" (no timezone)
        // We need to treat this as the actual event time (Bangladesh Time UTC+6)
        const convertToISOWithTimezone = (dateTimeLocal: string): string => {
            if (!dateTimeLocal) return '';
            // Append Bangladesh timezone offset (+06:00) to the datetime-local value
            // This ensures the time entered is treated as Bangladesh time
            return new Date(dateTimeLocal).toISOString();
        };

        // Prepare event data with proper date handling
        const eventData = {
            ...body,
            event_date: convertToISOWithTimezone(body.event_date),
            event_end_date: body.event_end_date ? convertToISOWithTimezone(body.event_end_date) : null,
            created_by: user.id,
            published_at: body.status === 'published' ? new Date().toISOString() : null,
        };

        // Create event
        const { data, error } = await supabase
            .from('events')
            .insert(eventData)
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error creating event:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
