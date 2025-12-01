import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/complaints/stats - Get ward-based complaint statistics (public)
export async function GET() {
    try {
        const supabase = await createClient();

        // Get all complaints with ward and status
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select('ward, status')
            .not('ward', 'is', null);

        if (error) {
            console.error('Error fetching complaint stats:', error);
            return NextResponse.json(
                { error: 'Failed to fetch statistics' },
                { status: 500 }
            );
        }

        // Define all wards
        const allWards = ['01', '17', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54'];

        // Initialize stats for all wards
        const wardStats: Record<string, {
            total: number;
            pending: number;
            in_progress: number;
            under_review: number;
            responded: number;
            resolved: number;
            rejected: number;
        }> = {};

        allWards.forEach(ward => {
            wardStats[ward] = {
                total: 0,
                pending: 0,
                in_progress: 0,
                under_review: 0,
                responded: 0,
                resolved: 0,
                rejected: 0,
            };
        });

        // Count complaints by ward and status
        complaints?.forEach(complaint => {
            if (complaint.ward && wardStats[complaint.ward]) {
                wardStats[complaint.ward].total++;
                const status = complaint.status as keyof typeof wardStats[string];
                if (status && wardStats[complaint.ward][status] !== undefined) {
                    wardStats[complaint.ward][status]++;
                }
            }
        });

        // Calculate max for heat map scaling
        const maxComplaints = Math.max(...Object.values(wardStats).map(s => s.total), 1);

        // Transform to array with intensity for heat map
        const stats = allWards.map(ward => ({
            ward,
            ...wardStats[ward],
            intensity: wardStats[ward].total / maxComplaints, // 0 to 1 for heat map
        }));

        return NextResponse.json({
            success: true,
            data: stats,
            summary: {
                totalComplaints: complaints?.length || 0,
                maxComplaintsPerWard: maxComplaints,
                wardCount: allWards.length,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/complaints/stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
