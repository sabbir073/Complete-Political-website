import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// GET - List all challenges for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const serviceClient = createServiceClient();
    let query = serviceClient
      .from('challenges')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title_bn.ilike.%${search}%`);
    }
    query = query.range(offset, offset + limit - 1);

    const { data: challenges, error, count } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const now = new Date();
    const challengesWithStatus = challenges?.map(c => {
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      let computed_status = c.status;
      if (c.status === 'active') {
        if (now < start) computed_status = 'upcoming';
        else if (now > end) computed_status = 'ended';
      }
      return { ...c, computed_status };
    });

    return NextResponse.json({
      success: true,
      data: challengesWithStatus,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

// POST - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
    if (!userRole || !['admin', 'moderator'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title_en, title_bn, description_en, description_bn, rules_en, rules_bn, cover_image, start_date, end_date, status = 'draft' } = body;

    if (!title_en || !title_bn) {
      return NextResponse.json({ success: false, error: 'Title required in both languages' }, { status: 400 });
    }
    if (!start_date || !end_date) {
      return NextResponse.json({ success: false, error: 'Start and end date required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('challenges')
      .insert({ title_en, title_bn, description_en, description_bn, rules_en, rules_bn, cover_image, start_date, end_date, status, created_by: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create challenge' }, { status: 500 });
  }
}
