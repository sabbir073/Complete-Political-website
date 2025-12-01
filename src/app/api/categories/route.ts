import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/categories - List categories (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const searchParams = request.nextUrl.searchParams;
        const contentType = searchParams.get('content_type');
        const slug = searchParams.get('slug');

        let query = supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (contentType) {
            query = query.eq('content_type', contentType);
        }

        if (slug) {
            query = query.eq('slug', slug);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error in GET /api/categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
