import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/photo-gallery - List published albums with photos (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const albumSlug = searchParams.get('album');
        const limit = parseInt(searchParams.get('limit') || '9');

        if (albumSlug) {
            // Get specific album with photos
            const { data: album, error: albumError } = await supabase
                .from('photo_albums')
                .select(`
          *,
          category:categories(*),
          photos:photo_gallery(*)
        `)
                .eq('slug', albumSlug)
                .eq('status', 'published')
                .single();

            if (albumError || !album) {
                return NextResponse.json({ error: 'Album not found' }, { status: 404 });
            }

            // Sort photos by display_order
            if (album.photos) {
                album.photos.sort((a: any, b: any) => a.display_order - b.display_order);
            }

            return NextResponse.json(album);
        } else {
            // List all published albums
            const { data, error } = await supabase
                .from('photo_albums')
                .select(`
          *,
          category:categories(*)
        `)
                .eq('status', 'published')
                .order('display_order', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('Error fetching albums:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ data });
        }
    } catch (error) {
        console.error('Error in GET /api/photo-gallery:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
