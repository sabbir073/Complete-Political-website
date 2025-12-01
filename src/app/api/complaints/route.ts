import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/complaints - Submit a complaint (public)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            is_anonymous,
            name,
            email,
            phone,
            ward,
            category,
            priority,
            location,
            subject,
            message,
            attachments,
        } = body;

        // Validate required fields
        if (!ward || !category || !subject || !message) {
            return NextResponse.json(
                { error: 'Ward, category, subject, and message are required' },
                { status: 400 }
            );
        }

        // Validate ward is one of the valid Dhaka-18 wards
        const validWards = ['01', '17', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54'];
        if (!validWards.includes(ward)) {
            return NextResponse.json(
                { error: 'Invalid ward selected' },
                { status: 400 }
            );
        }

        // If not anonymous, name and email are required
        if (!is_anonymous && (!name || !email)) {
            return NextResponse.json(
                { error: 'Name and email are required for non-anonymous complaints' },
                { status: 400 }
            );
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        // Insert complaint
        const { data, error } = await supabase
            .from('complaints')
            .insert({
                is_anonymous: is_anonymous || false,
                name: is_anonymous ? null : name,
                email: is_anonymous ? null : email,
                phone: is_anonymous ? null : phone,
                ward,
                category,
                priority: priority || 'medium',
                location: location || null,
                subject,
                message,
                attachments: attachments || [],
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating complaint:', error);
            return NextResponse.json(
                { error: 'Failed to submit complaint' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Complaint submitted successfully',
            tracking_id: data.tracking_id,
            data,
        });
    } catch (error) {
        console.error('Error in POST /api/complaints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/complaints?tracking_id=XXX - Track complaint by tracking ID (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const trackingId = searchParams.get('tracking_id');

        if (!trackingId) {
            return NextResponse.json(
                { error: 'Tracking ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('complaints')
            .select('tracking_id, category, subject, status, admin_response, responded_at, created_at, updated_at')
            .eq('tracking_id', trackingId.toUpperCase())
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in GET /api/complaints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
