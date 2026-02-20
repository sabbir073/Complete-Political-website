import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// GET - Public list of challenges
export async function GET(request: NextRequest) {
  try {
    const serviceClient = createServiceClient();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Fetch a larger batch for computed_status filtering, then paginate in memory
    // We fetch limit * 3 or at least 50 extra to account for filtered items
    const fetchLimit = statusFilter && statusFilter !== 'all' ? limit * 5 + 50 : limit + 1;

    let query = serviceClient
      .from('challenges')
      .select('id, title_en, title_bn, description_en, description_bn, cover_image, start_date, end_date, status, created_at')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const now = new Date();
    let challengesWithStatus = (data || []).map(c => {
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      let computed_status = c.status;
      if (c.status === 'active') {
        if (now < start) computed_status = 'upcoming';
        else if (now > end) computed_status = 'ended';
      }
      return { ...c, computed_status };
    });

    // Apply computed_status filter
    if (statusFilter && statusFilter !== 'all') {
      challengesWithStatus = challengesWithStatus.filter(c => c.computed_status === statusFilter);
    }

    // Paginate
    const paginated = challengesWithStatus.slice(offset, offset + limit);

    return NextResponse.json({ success: true, data: paginated });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
