import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/complaints - List all complaints
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const searchParams = request.nextUrl.searchParams;

        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const priority = searchParams.get('priority');
        const ward = searchParams.get('ward');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '20');
        const page = parseInt(searchParams.get('page') || '1');
        const offset = (page - 1) * limit;

        let query = supabase
            .from('complaints')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        if (priority && priority !== 'all') {
            query = query.eq('priority', priority);
        }

        if (ward && ward !== 'all') {
            query = query.eq('ward', ward);
        }

        if (search) {
            query = query.or(`tracking_id.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching complaints:', error);
            return NextResponse.json(
                { error: 'Failed to fetch complaints' },
                { status: 500 }
            );
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
        console.error('Error in GET /api/admin/complaints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
