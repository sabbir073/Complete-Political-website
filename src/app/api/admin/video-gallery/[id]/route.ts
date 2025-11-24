import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractYouTubeId } from '@/lib/cms-utils';

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
            .from('video_gallery')
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
        console.error('Error in GET /api/admin/video-gallery/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        if (body.slug) {
            const { data: existingSlug } = await supabase
                .from('video_gallery')
                .select('id')
                .eq('slug', body.slug)
                .neq('id', id)
                .single();

            if (existingSlug) {
                return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
            }
        }

        // Extract YouTube ID if URL changed
        if (body.youtube_url) {
            const youtubeId = extractYouTubeId(body.youtube_url);
            if (!youtubeId) {
                return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
            }
            body.youtube_id = youtubeId;
        }

        if (body.status === 'published') {
            body.published_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('video_gallery')
            .update(body)
            .eq('id', id)
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error updating video:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/admin/video-gallery/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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
            .from('video_gallery')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting video:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /api/admin/video-gallery/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
