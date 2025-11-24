import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/categories - List all categories
// POST /api/admin/categories - Create new category
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const contentType = searchParams.get('content_type');

        let query = supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name_en', { ascending: true });

        if (contentType) {
            query = query.eq('content_type', contentType);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/admin/categories:', error);
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

        if (!body.name_en || !body.name_bn || !body.slug || !body.content_type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug is unique
        const { data: existingSlug } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', body.slug)
            .single();

        if (existingSlug) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert(body)
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
