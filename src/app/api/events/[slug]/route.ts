import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/events/[slug] - Get single event by slug (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('events')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/events/[slug]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
