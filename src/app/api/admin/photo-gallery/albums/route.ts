import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/photo-gallery/albums - List all albums
// POST /api/admin/photo-gallery/albums - Create new album
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('photo_albums')
            .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category_id', category);
        if (search) {
            query = query.or(`name_en.ilike.%${search}%,name_bn.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching albums:', error);
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
        console.error('Error in GET /api/admin/photo-gallery/albums:', error);
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

        if (!body.name_en || !body.name_bn || !body.slug) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data: existingSlug } = await supabase
            .from('photo_albums')
            .select('id')
            .eq('slug', body.slug)
            .single();

        if (existingSlug) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('photo_albums')
            .insert({
                ...body,
                created_by: user.id,
            })
            .select(`
        *,
        category:categories(*)
      `)
            .single();

        if (error) {
            console.error('Error creating album:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/photo-gallery/albums:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
