import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/emergency/sos - Submit an emergency SOS request (public)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            name,
            phone,
            request_type = 'general',
            message,
            latitude,
            longitude,
            address,
            ward,
            audio_url,
            audio_duration,
            priority = 'high',
        } = body;

        // Validate required fields
        if (!phone) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Insert emergency request
        const { data, error } = await supabase
            .from('emergency_requests')
            .insert({
                name: name || 'Anonymous',
                phone,
                request_type,
                message,
                latitude,
                longitude,
                address,
                ward,
                audio_url,
                audio_duration,
                priority,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating emergency request:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to submit emergency request' },
                { status: 500 }
            );
        }

        // TODO: Add notification system (SMS, email, push notification to admin)

        return NextResponse.json({
            success: true,
            data,
            message: 'Emergency request submitted successfully',
        });
    } catch (error) {
        console.error('Error in POST /api/emergency/sos:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/emergency/sos - Get all emergency requests (for admin)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const request_type = searchParams.get('request_type');
        const priority = searchParams.get('priority');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('emergency_requests')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        if (request_type) {
            query = query.eq('request_type', request_type);
        }

        if (priority) {
            query = query.eq('priority', priority);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching emergency requests:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch emergency requests' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            pagination: {
                total: count || 0,
                limit,
                offset,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/emergency/sos:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
