import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get blood request statistics (public)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const getStats = searchParams.get('stats');

        if (getStats === 'true') {
            // Get comprehensive statistics
            const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

            // Get total verified donors
            const { count: totalDonors } = await supabase
                .from('blood_donors')
                .select('*', { count: 'exact', head: true })
                .eq('is_verified', true);

            // Get available donors
            const { count: availableDonors } = await supabase
                .from('blood_donors')
                .select('*', { count: 'exact', head: true })
                .eq('is_verified', true)
                .eq('is_available', true);

            // Get donors by blood group
            const donorsByGroup: Record<string, number> = {};
            for (const group of bloodGroups) {
                const { count } = await supabase
                    .from('blood_donors')
                    .select('*', { count: 'exact', head: true })
                    .eq('blood_group', group)
                    .eq('is_verified', true)
                    .eq('is_available', true);
                donorsByGroup[group] = count || 0;
            }

            // Get request statistics
            const { count: totalRequests } = await supabase
                .from('blood_requests')
                .select('*', { count: 'exact', head: true });

            const { count: pendingRequests } = await supabase
                .from('blood_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            const { count: inProgressRequests } = await supabase
                .from('blood_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'in_progress');

            const { count: fulfilledRequests } = await supabase
                .from('blood_requests')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'fulfilled');

            const { count: emergencyRequests } = await supabase
                .from('blood_requests')
                .select('*', { count: 'exact', head: true })
                .eq('urgency', 'emergency')
                .in('status', ['pending', 'in_progress']);

            // Get requests by blood group
            const requestsByGroup: Record<string, number> = {};
            for (const group of bloodGroups) {
                const { count } = await supabase
                    .from('blood_requests')
                    .select('*', { count: 'exact', head: true })
                    .eq('blood_group', group)
                    .in('status', ['pending', 'in_progress']);
                requestsByGroup[group] = count || 0;
            }

            return NextResponse.json({
                success: true,
                stats: {
                    donors: {
                        total: totalDonors || 0,
                        available: availableDonors || 0,
                        byGroup: donorsByGroup,
                    },
                    requests: {
                        total: totalRequests || 0,
                        pending: pendingRequests || 0,
                        inProgress: inProgressRequests || 0,
                        fulfilled: fulfilledRequests || 0,
                        emergency: emergencyRequests || 0,
                        byGroup: requestsByGroup,
                    },
                },
            });
        }

        // Return recent pending requests (without personal info)
        const { data: requests, error } = await supabase
            .from('blood_requests')
            .select('id, blood_group, units_needed, hospital_name, needed_by, urgency, status, created_at')
            .in('status', ['pending', 'in_progress'])
            .order('urgency', { ascending: true })
            .order('needed_by', { ascending: true })
            .limit(10);

        if (error) {
            console.error('Error fetching requests:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch requests',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Error in GET /api/blood-hub/requests:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}

// POST - Submit a blood request
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        const {
            contact_person,
            contact_phone,
            contact_email,
            patient_name,
            blood_group,
            units_needed,
            hospital_name,
            hospital_address,
            ward,
            needed_by,
            urgency,
            reason,
        } = body;

        // Validate required fields
        if (!contact_person || !contact_phone || !blood_group || !hospital_name || !needed_by) {
            return NextResponse.json({
                success: false,
                error: 'Contact person, phone, blood group, hospital name, and needed by date are required',
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

        // Validate urgency
        const validUrgency = ['emergency', 'urgent', 'normal'];
        if (urgency && !validUrgency.includes(urgency)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid urgency level',
            }, { status: 400 });
        }

        // Insert new request
        const { data, error } = await supabase
            .from('blood_requests')
            .insert({
                contact_person,
                contact_phone,
                contact_email: contact_email || null,
                patient_name: patient_name || null,
                blood_group,
                units_needed: units_needed || 1,
                hospital_name,
                hospital_address: hospital_address || null,
                ward: ward || null,
                needed_by,
                urgency: urgency || 'normal',
                reason: reason || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting blood request:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to submit blood request',
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Blood request submitted successfully. We will contact potential donors.',
            data: {
                id: data.id,
                blood_group: data.blood_group,
                hospital_name: data.hospital_name,
                status: data.status,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/blood-hub/requests:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
        }, { status: 500 });
    }
}
