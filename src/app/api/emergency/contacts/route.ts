import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/emergency/contacts - Get all emergency contacts (public)
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: contacts, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching emergency contacts:', error);
            return NextResponse.json(
                { error: 'Failed to fetch emergency contacts' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: contacts || [],
        });
    } catch (error) {
        console.error('Error in GET /api/emergency/contacts:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
