import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractYouTubeId } from '@/lib/cms-utils';

// GET /api/admin/video-gallery - List all videos
// POST /api/admin/video-gallery - Create new video
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('video_gallery')
            .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category_id', category);
        if (featured) query = query.eq('is_featured', featured === 'true');
        if (search) {
            query = query.or(`title_en.ilike.%${search}%,title_bn.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching videos:', error);
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
        console.error('Error in GET /api/admin/video-gallery:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.title_en || !body.title_bn || !body.youtube_url || !body.slug) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Extract YouTube ID
        const youtubeId = extractYouTubeId(body.youtube_url);
        if (!youtubeId) {
            return NextResponse.json(
                { error: 'Invalid YouTube URL' },
                { status: 400 }
            );
        }

        const { data: existingSlug } = await supabase
            .from('video_gallery')
            .select('id')
            .eq('slug', body.slug)
            .single();

        if (existingSlug) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('video_gallery')
            .insert({
                ...body,
                youtube_id: youtubeId,
                created_by: user.id,
                published_at: body.status === 'published' ? new Date().toISOString() : null,
            })
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error creating video:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/video-gallery:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
