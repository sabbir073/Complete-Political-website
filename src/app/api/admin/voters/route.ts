import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has moderator+ access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['moderator', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'serial_no';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    let query = supabase
      .from('voter_list')
      .select('*, voter_metadata(*)', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`voter_name.ilike.%${search}%,voter_no.ilike.%${search}%,father_name.ilike.%${search}%,mother_name.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: voters, error, count } = await query;

    if (error) {
      console.error('Error fetching voters:', error);
      return NextResponse.json({ error: 'Failed to fetch voters' }, { status: 500 });
    }

    return NextResponse.json({
      voters,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });

  } catch (error) {
    console.error('Voter list API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
