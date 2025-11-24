import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateReadTime } from '@/lib/cms-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('news')
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
        console.error('Error in GET /api/admin/news/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (body.slug) {
            const { data: existingSlug } = await supabase
                .from('news')
                .select('id')
                .eq('slug', body.slug)
                .neq('id', id)
                .single();

            if (existingSlug) {
                return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
            }
        }

        // Auto-recalculate read time if content changed
        if (body.content_en && !body.read_time) {
            body.read_time = calculateReadTime(body.content_en);
        }

        if (body.status === 'published') {
            body.published_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('news')
            .update(body)
            .eq('id', id)
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error updating news:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/admin/news/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting news:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/admin/news/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
