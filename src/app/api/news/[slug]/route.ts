import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/news/[slug] - Get single news article by slug (public)
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('news')
            .select(`
        *,
        category:categories(*)
      `)
            .eq('slug', params.slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'News article not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/news/[slug]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
