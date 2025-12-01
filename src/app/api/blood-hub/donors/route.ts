import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get donor counts by blood group (public - no personal info)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const bloodGroup = searchParams.get('blood_group');

        if (bloodGroup) {
            // Get count for specific blood group
            const { count, error } = await supabase
                .from('blood_donors')
                .select('*', { count: 'exact', head: true })
                .eq('blood_group', bloodGroup)
                .eq('is_available', true)
                .eq('is_verified', true);

            if (error) {
                console.error('Error fetching donor count:', error);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to fetch donor count',
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                blood_group: bloodGroup,
                count: count || 0,
            });
        }

        // Get counts for all blood groups
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const counts: Record<string, number> = {};

        for (const group of bloodGroups) {
            const { count, error } = await supabase
                .from('blood_donors')
                .select('*', { count: 'exact', head: true })
                .eq('blood_group', group)
                .eq('is_available', true)
                .eq('is_verified', true);

            if (!error) {
                counts[group] = count || 0;
            } else {
                counts[group] = 0;
            }
        }

        const totalDonors = Object.values(counts).reduce((sum, count) => sum + count, 0);

        return NextResponse.json({
            success: true,
            data: counts,
            total: totalDonors,
        });
    } catch (error) {
        console.error('Error in GET /api/blood-hub/donors:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// POST - Register as a blood donor
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            name,
            phone,
            email,
            blood_group,
            date_of_birth,
            gender,
            weight,
            address,
            ward,
            area,
            last_donation_date,
            medical_conditions,
        } = body;

        // Validate required fields
        if (!name || !phone || !blood_group) {
            return NextResponse.json({
                success: false,
                error: 'Name, phone, and blood group are required',
            }, { status: 400 });
        }

        // Validate blood group
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(blood_group)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid blood group',
            }, { status: 400 });
        }

        // Check if phone already exists
        const { data: existingDonor } = await supabase
            .from('blood_donors')
            .select('id')
            .eq('phone', phone)
            .single();

        if (existingDonor) {
            return NextResponse.json({
                success: false,
                error: 'A donor with this phone number already exists',
            }, { status: 400 });
        }

        // Insert new donor
        const { data, error } = await supabase
            .from('blood_donors')
            .insert({
                name,
                phone,
                email: email || null,
                blood_group,
                date_of_birth: date_of_birth || null,
                gender: gender || null,
                weight: weight || null,
                address: address || null,
                ward: ward || null,
                area: area || null,
                last_donation_date: last_donation_date || null,
                medical_conditions: medical_conditions || null,
                is_available: true,
                is_verified: false, // Admin needs to verify
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting donor:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to register as donor',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully registered as a blood donor. Your profile will be verified by admin.',
            data: {
                id: data.id,
                name: data.name,
                blood_group: data.blood_group,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/blood-hub/donors:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}
