import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/admin/emergency/[id] - Update emergency request status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const {
            status,
            priority,
            admin_notes,
            assigned_to,
        } = body;

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (status) {
            updateData.status = status;

            // Set response time when acknowledged
            if (status === 'acknowledged' || status === 'responding') {
                updateData.response_time = new Date().toISOString();
            }

            // Set resolved time when resolved
            if (status === 'resolved') {
                updateData.resolved_at = new Date().toISOString();
            }
        }

        if (priority) updateData.priority = priority;
        if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
        if (assigned_to) updateData.assigned_to = assigned_to;

        const { data, error } = await supabase
            .from('emergency_requests')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating emergency request:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update emergency request' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in PATCH /api/admin/emergency/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/admin/emergency/[id] - Get single emergency request
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('emergency_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching emergency request:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch emergency request' },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Emergency request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/emergency/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/emergency/[id] - Delete emergency request
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('emergency_requests')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting emergency request:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to delete emergency request' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Emergency request deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /api/admin/emergency/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
