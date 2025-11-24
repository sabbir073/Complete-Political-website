import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/photo-gallery/photos - List all photos
// POST /api/admin/photo-gallery/photos - Create new photo
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const albumId = searchParams.get('album_id');
        const category = searchParams.get('category');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('photo_gallery')
            .select(`
        *,
        album:photo_albums(id, name_en, name_bn),
        category:categories(*)
      `, { count: 'exact' })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (albumId) query = query.eq('album_id', albumId);
        if (category) query = query.eq('category_id', category);

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching photos:', error);
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
        console.error('Error in GET /api/admin/photo-gallery/photos:', error);
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

        if (!body.image_url) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('photo_gallery')
            .insert({
                ...body,
                created_by: user.id,
            })
            .select(`
        *,
        album:photo_albums(id, name_en, name_bn),
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error creating photo:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/photo-gallery/photos:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
