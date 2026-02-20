import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

async function checkAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
  if (!userRole || !['admin', 'moderator'].includes(userRole)) return null;
  return user;
}

// GET - List winners for a challenge
export async function GET(request: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const challenge_id = searchParams.get('challenge_id');
    if (!challenge_id) return NextResponse.json({ success: false, error: 'challenge_id required' }, { status: 400 });

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('challenge_winners')
      .select('*')
      .eq('challenge_id', challenge_id)
      .order('rank', { ascending: true });

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data: data || [] });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch winners' }, { status: 500 });
  }
}

// POST - Add a winner
export async function POST(request: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { challenge_id, rank, name, image } = body;

    if (!challenge_id || !rank || !name) {
      return NextResponse.json({ success: false, error: 'challenge_id, rank, and name are required' }, { status: 400 });
    }
    if (rank < 1 || rank > 10) {
      return NextResponse.json({ success: false, error: 'Rank must be between 1 and 10' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('challenge_winners')
      .upsert({ challenge_id, rank, name: name.trim(), image: image || null }, { onConflict: 'challenge_id,rank' })
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to add winner' }, { status: 500 });
  }
}

// DELETE - Remove a winner
export async function DELETE(request: NextRequest) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('challenge_winners').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete winner' }, { status: 500 });
  }
}
