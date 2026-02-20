import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

// GET - List submissions (all or by challenge)
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
    const challenge_id = searchParams.get('challenge_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const serviceClient = createServiceClient();
    let query = serviceClient
      .from('challenge_submissions')
      .select('*, challenges(title_en, title_bn)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (challenge_id) {
      query = query.eq('challenge_id', challenge_id);
    }
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// DELETE - Delete a submission
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('challenge_submissions').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete submission' }, { status: 500 });
  }
}
