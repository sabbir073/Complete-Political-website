import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/events/[id] - Get single event
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/admin/events/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Check if slug is unique (excluding current event)
        if (body.slug) {
            const { data: existingSlug } = await supabase
                .from('events')
                .select('id')
                .eq('slug', body.slug)
                .neq('id', id)
                .single();

            if (existingSlug) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        // Update published_at if status changes to published
        if (body.status === 'published') {
            body.published_at = new Date().toISOString();
        }

        // Helper function to convert datetime-local to proper ISO string
        // datetime-local gives format: "2025-11-29T14:30" (no timezone)
        // We need to treat this as Bangladesh Time (UTC+6) and store it properly
        const convertToISOWithTimezone = (dateTimeLocal: string): string => {
            if (!dateTimeLocal) return '';
            // Check if the input already includes timezone info (ISO format from DB)
            if (dateTimeLocal.includes('Z') || dateTimeLocal.includes('+')) {
                return dateTimeLocal; // Already in proper format
            }
            // datetime-local format is "YYYY-MM-DDTHH:mm"
            // Append Bangladesh timezone offset (+06:00) to treat the input as Bangladesh time
            const bdTimeString = `${dateTimeLocal}:00+06:00`;
            return new Date(bdTimeString).toISOString();
        };

        // Prepare update data with proper date handling
        const updateData = {
            ...body,
            event_date: body.event_date ? convertToISOWithTimezone(body.event_date) : undefined,
            event_end_date: body.event_end_date ? convertToISOWithTimezone(body.event_end_date) : null,
        };

        const { data, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', id)
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error updating event:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/admin/events/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/events/[id] - Delete event
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/admin/events/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
