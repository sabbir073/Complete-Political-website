import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/complaints/[id] - Get single complaint
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createAdminClient();
        const { id } = await params;

        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching complaint:', error);
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/admin/complaints/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/complaints/[id] - Update complaint status/notes/response
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createAdminClient();
        const { id } = await params;
        const body = await request.json();

        const { status, admin_notes, admin_response } = body;

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (status) {
            updateData.status = status;
            if (status === 'responded' || status === 'resolved') {
                updateData.responded_at = new Date().toISOString();
            }
        }

        if (admin_notes !== undefined) {
            updateData.admin_notes = admin_notes;
        }

        if (admin_response !== undefined) {
            updateData.admin_response = admin_response;
            updateData.responded_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('complaints')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating complaint:', error);
            return NextResponse.json(
                { error: 'Failed to update complaint' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/admin/complaints/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/complaints/[id] - Delete complaint
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createAdminClient();
        const { id } = await params;

        const { error } = await supabase
            .from('complaints')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting complaint:', error);
            return NextResponse.json(
                { error: 'Failed to delete complaint' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/complaints/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
