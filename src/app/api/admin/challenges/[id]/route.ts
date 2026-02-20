import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

async function checkAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: userRole } = await supabase.rpc('get_user_role', { user_id: user.id });
  if (!userRole || !['admin', 'moderator'].includes(userRole)) return null;
  return user;
}

// PUT - Update a challenge
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await checkAuth(supabase);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title_en, title_bn, description_en, description_bn, rules_en, rules_bn, cover_image, start_date, end_date, status } = body;

    if (!title_en || !title_bn) {
      return NextResponse.json({ success: false, error: 'Title required in both languages' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('challenges')
      .update({ title_en, title_bn, description_en, description_bn, rules_en, rules_bn, cover_image, start_date, end_date, status })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update challenge' }, { status: 500 });
  }
}

// DELETE - Delete a challenge
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const user = await checkAuth(supabase);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('challenges').delete().eq('id', id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete challenge' }, { status: 500 });
  }
}
