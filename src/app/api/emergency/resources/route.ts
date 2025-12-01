import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/emergency/resources - Get all safety resources (public)
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: resources, error } = await supabase
            .from('safety_resources')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching safety resources:', error);
            return NextResponse.json(
                { error: 'Failed to fetch safety resources' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: resources || [],
        });
    } catch (error) {
        console.error('Error in GET /api/emergency/resources:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
