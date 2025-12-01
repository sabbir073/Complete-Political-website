import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get all donors (admin)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const bloodGroup = searchParams.get('blood_group');
        const isVerified = searchParams.get('is_verified');
        const isAvailable = searchParams.get('is_available');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('blood_donors')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (bloodGroup && bloodGroup !== 'all') {
            query = query.eq('blood_group', bloodGroup);
        }

        if (isVerified === 'true') {
            query = query.eq('is_verified', true);
        } else if (isVerified === 'false') {
            query = query.eq('is_verified', false);
        }

        if (isAvailable === 'true') {
            query = query.eq('is_available', true);
        } else if (isAvailable === 'false') {
            query = query.eq('is_available', false);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching donors:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch donors',
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
        console.error('Error in GET /api/admin/blood-hub/donors:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// PATCH - Update donor (verify, toggle availability, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Donor ID is required',
            }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('blood_donors')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating donor:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update donor',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in PATCH /api/admin/blood-hub/donors:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// DELETE - Delete donor
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Donor ID is required',
            }, { status: 400 });
        }

        const { error } = await supabase
            .from('blood_donors')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting donor:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete donor',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Donor deleted successfully',
        });
    } catch (error) {
        console.error('Error in DELETE /api/admin/blood-hub/donors:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}
