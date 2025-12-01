import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get all blood requests (admin)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const bloodGroup = searchParams.get('blood_group');
        const status = searchParams.get('status');
        const urgency = searchParams.get('urgency');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('blood_requests')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (bloodGroup && bloodGroup !== 'all') {
            query = query.eq('blood_group', bloodGroup);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (urgency && urgency !== 'all') {
            query = query.eq('urgency', urgency);
        }

        if (search) {
            query = query.or(`contact_person.ilike.%${search}%,contact_phone.ilike.%${search}%,hospital_name.ilike.%${search}%,patient_name.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching blood requests:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch blood requests',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
            total: count,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/blood-hub/requests:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// PATCH - Update blood request status
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Request ID is required',
            }, { status: 400 });
        }

        // Validate status if provided
        if (updates.status) {
            const validStatuses = ['pending', 'in_progress', 'fulfilled', 'cancelled', 'expired'];
            if (!validStatuses.includes(updates.status)) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid status',
                }, { status: 400 });
            }
        }

        const { data, error } = await supabase
            .from('blood_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating blood request:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update blood request',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in PATCH /api/admin/blood-hub/requests:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// DELETE - Delete blood request
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Request ID is required',
            }, { status: 400 });
        }

        const { error } = await supabase
            .from('blood_requests')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting blood request:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete blood request',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Blood request deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /api/admin/blood-hub/requests:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}
