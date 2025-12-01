import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/contacts/[id] - Get single contact
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching contact:', error);
            return NextResponse.json(
                { error: 'Contact not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in GET /api/admin/contacts/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/contacts/[id] - Update contact status/notes
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const body = await request.json();

        const { status, admin_notes } = body;

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (status) {
            updateData.status = status;
            if (status === 'responded') {
                updateData.responded_at = new Date().toISOString();
            }
        }

        if (admin_notes !== undefined) {
            updateData.admin_notes = admin_notes;
        }

        const { data, error } = await supabase
            .from('contact_submissions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating contact:', error);
            return NextResponse.json(
                { error: 'Failed to update contact' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in PUT /api/admin/contacts/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/contacts/[id] - Delete contact
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting contact:', error);
            return NextResponse.json(
                { error: 'Failed to delete contact' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/admin/contacts/[id]:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
